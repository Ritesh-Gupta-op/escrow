import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

import { CONTRACT_ADDRESS_PLACEHOLDER, getContractAddress } from './config';
import { createEscrowProviders, loadEscrowContract, PRIVATE_STATE_ID, type EscrowPrivateState } from './contract';
import { resolveNetwork, getDeployment, getOrCreateSeed, type NetworkConfig, type NetworkId } from './network';
import { createWallet, persistWalletState, type WalletContext } from './wallet';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexHtmlPath = resolve(__dirname, '..', 'public', 'index.html');
const html = existsSync(indexHtmlPath)
  ? readFileSync(indexHtmlPath, 'utf8')
  : '<!doctype html><html><body><h1>Escrow UI not found</h1></body></html>';

const STATUS_NAMES = ['UNFUNDED', 'FUNDED', 'RELEASED', 'REFUNDED'] as const;

interface AppContext {
  walletCtx: WalletContext;
  providers: Awaited<ReturnType<typeof createEscrowProviders>>;
  compiledContract: any;
  zkConfigPath: string;
  escrowModule: any;
  network: NetworkId;
  networkConfig: NetworkConfig;
}

let appContext: AppContext | null = null;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, payload: unknown, statusCode = 200): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function toHex(value: Uint8Array | Buffer | null | undefined): string {
  return value ? Buffer.from(value).toString('hex') : '';
}

function statusName(status: number): string {
  return STATUS_NAMES[status] ?? `UNKNOWN(${status})`;
}

function secretBytes(value: unknown): Buffer {
  if (typeof value !== 'string' || value.trim().length < 12) {
    throw new Error('Buyer and seller authorization secrets must each be at least 12 characters.');
  }
  return Buffer.from(createHash('sha256').update(value, 'utf8').digest());
}

function privateTermsCommitment(amount: number, terms: string): Buffer {
  const seed = `${amount}:${terms ?? ''}:${randomBytes(32).toString('hex')}`;
  return Buffer.from(createHash('sha256').update(seed, 'utf8').digest());
}

async function getAppContext(): Promise<AppContext> {
  if (appContext) return appContext;
  const { network, config: networkConfig } = resolveNetwork();
  const seed = getOrCreateSeed(network);
  const walletCtx = await createWallet({ network, networkConfig, seed });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);
  const { compiledContract, zkConfigPath, escrowModule } = await loadEscrowContract();
  const providers = await createEscrowProviders(walletCtx, network, networkConfig, zkConfigPath);
  appContext = { walletCtx, providers, compiledContract, zkConfigPath, escrowModule, network, networkConfig };
  return appContext;
}

async function loadEscrowState(contractAddress: string) {
  const ctx = await getAppContext();
  const state = await ctx.providers.publicDataProvider.queryContractState(contractAddress);
  if (!state?.data) return null;
  const ledgerState = ctx.escrowModule.ledger(state.data);
  return {
    status: Number(ledgerState.status),
    statusName: statusName(Number(ledgerState.status)),
    agreementCommitment: toHex(ledgerState.agreementCommitment),
    buyerAuthority: toHex(ledgerState.buyerAuthority),
    sellerAuthority: toHex(ledgerState.sellerAuthority),
  };
}

async function setEscrowPrivateState(
  contractAddress: string,
  nextState: Partial<EscrowPrivateState>,
): Promise<void> {
  const ctx = await getAppContext();
  const provider = ctx.providers.privateStateProvider;
  provider.setContractAddress(contractAddress as any);
  const current = (await provider.get(PRIVATE_STATE_ID)) as Partial<EscrowPrivateState> | null;
  const updated = { ...current, ...nextState } as EscrowPrivateState;
  await provider.set(PRIVATE_STATE_ID, updated);
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, { error: 'No URL provided' }, 400);
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, { ok: true, contractAddress: getContractAddress() });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/escrow') {
    try {
      const configuredAddress = getContractAddress();
      const { network } = resolveNetwork();
      const deployment = getDeployment(network);
      const contractAddress = deployment?.address ?? configuredAddress;

      if (contractAddress === CONTRACT_ADDRESS_PLACEHOLDER) {
        sendJson(res, {
          contractAddress,
          status: 'pending-deployment',
          statusName: 'UNDEPLOYED',
          message: 'Contract not deployed yet. Deploy the contract and set CONTRACT_ADDRESS.',
        });
        return;
      }

      const state = await loadEscrowState(contractAddress);
      if (!state) {
        sendJson(res, {
          contractAddress,
          status: 'unknown',
          statusName: 'UNKNOWN',
          message: 'No escrow state found on the network. Create a new escrow or verify the contract address.',
        });
        return;
      }

      sendJson(res, {
        contractAddress,
        ...state,
        message: 'Escrow contract is reachable. Status values are public ledger commitments only.',
      });
    } catch (error) {
      sendJson(res, { error: error instanceof Error ? error.message : String(error) }, 500);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/escrows') {
    const body = await readBody(req);

    try {
      const payload = JSON.parse(body);
      const configuredAddress = getContractAddress();
      const { network, config: networkConfig } = resolveNetwork();
      const deployment = getDeployment(network);
      const contractAddress = deployment?.address ?? configuredAddress;

      if (contractAddress === CONTRACT_ADDRESS_PLACEHOLDER) {
        sendJson(res, {
          status: 'pending-deployment',
          message: 'The escrow contract has been wired up. Deploy it, copy the address, and set CONTRACT_ADDRESS to finish the integration.',
          payload,
        }, 202);
        return;
      }

      const buyerSecret = String(payload.buyer ?? '').trim();
      const sellerSecret = String(payload.seller ?? '').trim();
      const walletAddress = String(payload.walletAddress ?? '').trim();
      const amount = Number(payload.amount ?? 0);
      const terms = String(payload.terms ?? '');

      if (!walletAddress) throw new Error('A connected browser wallet address is required to create escrow.');
      if (!buyerSecret || buyerSecret.length < 12) throw new Error('Buyer secret must be at least 12 characters.');
      if (!sellerSecret || sellerSecret.length < 12) throw new Error('Seller secret must be at least 12 characters.');
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Amount must be a positive whole number.');

      const ctx = await getAppContext();
      const providers = ctx.providers;
      const deployed: any = await findDeployedContract(providers as any, {
        compiledContract: ctx.compiledContract as any,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

      const tx = await deployed.callTx.createEscrow(
        secretBytes(buyerSecret),
        secretBytes(sellerSecret),
        new Uint8Array(privateTermsCommitment(amount, terms)),
      );

      await setEscrowPrivateState(contractAddress, {
        buyerAuthorizationSecret: secretBytes(buyerSecret),
        sellerAuthorizationSecret: secretBytes(sellerSecret),
      });

      sendJson(res, {
        status: 'created',
        walletAddress,
        txId: tx.public.txId,
        contractAddress,
        amount,
        message: 'Escrow created. Buyer and seller secrets are stored encrypted in local private state for later release/refund.',
      });
    } catch (error) {
      sendJson(res, { error: error instanceof Error ? error.message : String(error) }, 500);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/escrows/release') {
    const body = await readBody(req);

    try {
      const payload = JSON.parse(body);
      const sellerSecret = String(payload.seller ?? '').trim();
      const walletAddress = String(payload.walletAddress ?? '').trim();
      if (!walletAddress) throw new Error('A connected browser wallet address is required to release escrow.');
      if (!sellerSecret || sellerSecret.length < 12) throw new Error('Seller secret must be at least 12 characters.');

      const configuredAddress = getContractAddress();
      const { network, config: networkConfig } = resolveNetwork();
      const deployment = getDeployment(network);
      const contractAddress = deployment?.address ?? configuredAddress;

      if (contractAddress === CONTRACT_ADDRESS_PLACEHOLDER) {
        throw new Error('Contract address is not configured. Deploy the contract and set CONTRACT_ADDRESS.');
      }

      await setEscrowPrivateState(contractAddress, {
        sellerAuthorizationSecret: secretBytes(sellerSecret),
      });

      const ctx = await getAppContext();
      const deployed: any = await findDeployedContract(ctx.providers as any, {
        compiledContract: ctx.compiledContract as any,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

      const tx = await deployed.callTx.releaseEscrow();
      sendJson(res, {
        status: 'released',
        walletAddress,
        txId: tx.public.txId,
        contractAddress,
        message: 'Escrow released. The seller secret was accepted without being disclosed on-chain.',
      });
    } catch (error) {
      sendJson(res, { error: error instanceof Error ? error.message : String(error) }, 500);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/escrows/refund') {
    const body = await readBody(req);

    try {
      const payload = JSON.parse(body);
      const buyerSecret = String(payload.buyer ?? '').trim();
      const walletAddress = String(payload.walletAddress ?? '').trim();
      if (!walletAddress) throw new Error('A connected browser wallet address is required to refund escrow.');
      if (!buyerSecret || buyerSecret.length < 12) throw new Error('Buyer secret must be at least 12 characters.');

      const configuredAddress = getContractAddress();
      const { network, config: networkConfig } = resolveNetwork();
      const deployment = getDeployment(network);
      const contractAddress = deployment?.address ?? configuredAddress;

      if (contractAddress === CONTRACT_ADDRESS_PLACEHOLDER) {
        throw new Error('Contract address is not configured. Deploy the contract and set CONTRACT_ADDRESS.');
      }

      await setEscrowPrivateState(contractAddress, {
        buyerAuthorizationSecret: secretBytes(buyerSecret),
      });

      const ctx = await getAppContext();
      const deployed: any = await findDeployedContract(ctx.providers as any, {
        compiledContract: ctx.compiledContract as any,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

      const tx = await deployed.callTx.refundEscrow();
      sendJson(res, {
        status: 'refunded',
        walletAddress,
        txId: tx.public.txId,
        contractAddress,
        message: 'Escrow refunded. The buyer secret was accepted without being disclosed on-chain.',
      });
    } catch (error) {
      sendJson(res, { error: error instanceof Error ? error.message : String(error) }, 500);
    }
    return;
  }

  sendJson(res, { error: 'Not found' }, 404);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`Escrow web server listening on http://127.0.0.1:${port}`);
});
