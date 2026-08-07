/**
 * CLI for interacting with the escrow contract.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Buffer } from 'buffer';
import { createHash, randomBytes } from 'node:crypto';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken } from './wallet';
import { createEscrowProviders, loadEscrowContract, PRIVATE_STATE_ID } from './contract';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function secretBytes(value: string): Uint8Array {
  return new Uint8Array(createHash('sha256').update(value, 'utf8').digest());
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   Escrow CLI                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }

  try {
    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    await walletCtx.wallet.waitForSyncedState();
    await persistWalletState(network, walletCtx);

    const { compiledContract, zkConfigPath, escrowModule } = await loadEscrowContract();
    const providers = await createEscrowProviders(walletCtx, network, networkConfig, zkConfigPath);

    const deployed: any = await findDeployedContract(providers as any, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Create escrow');
      console.log('  2. Read escrow state');
      console.log('  3. Release escrow');
      console.log('  4. Cancel escrow');
      console.log('  5. Check wallet balance');
      console.log('  6. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const buyer = await rl.question('  Buyer identifier: ');
          const seller = await rl.question('  Seller identifier: ');
          const amount = await rl.question('  Amount: ');
          if (!amount || Number(amount) <= 0) throw new Error('Amount must be greater than zero.');
          const tx = await deployed.callTx.createEscrow(
            secretBytes(buyer),
            secretBytes(seller),
            new Uint8Array(randomBytes(32)),
          );
          console.log(`\n  ✅ Escrow created: ${tx.public.txId}\n`);
          break;
        }
        case '2': {
          const state = await providers.publicDataProvider.queryContractState(deployment.address);
          if (state) {
            const ledgerState = escrowModule.ledger(state.data);
            console.log(`\n  Escrow status code: ${ledgerState.status}`);
            console.log('  Agreement details remain private.');
          }
          break;
        }
        case '3': {
          const tx = await deployed.callTx.releaseEscrow();
          console.log(`\n  ✅ Escrow released: ${tx.public.txId}\n`);
          break;
        }
        case '4': {
          const tx = await deployed.callTx.refundEscrow();
          console.log(`\n  ✅ Escrow refunded: ${tx.public.txId}\n`);
          break;
        }
        case '5': {
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}\n`);
          break;
        }
        case '6':
          running = false;
          console.log('\n  👋 Goodbye!\n');
          break;
        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-6.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  }
}

main().catch(console.error);
