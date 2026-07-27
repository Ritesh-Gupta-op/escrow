import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

import { CONTRACT_ADDRESS_PLACEHOLDER, getContractAddress } from './config';
import { createEscrowProviders, loadEscrowContract, PRIVATE_STATE_ID } from './contract';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState } from './wallet';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

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

function secretBytes(value: unknown): Uint8Array {
  if (typeof value !== 'string' || value.trim().length < 12) {
    throw new Error('Buyer and seller authorization secrets must each be at least 12 characters.');
  }
  return new Uint8Array(createHash('sha256').update(value, 'utf8').digest());
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Escrow DApp</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, system-ui, sans-serif; }
      body { margin: 0; background: #07111f; color: #f5f7ff; }
      main { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem; }
      .card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 1.5rem; }
      label { display: block; margin-top: 0.75rem; font-weight: 600; }
      input, button { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid #2d4263; margin-top: 0.35rem; font: inherit; }
      button { background: #3b82f6; color: white; cursor: pointer; }
      .result { margin-top: 1rem; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Escrow dashboard</h1>
        <p>Create and manage a confidential escrow agreement with an on-chain status marker.</p>
        <form id="escrow-form">
          <label>Buyer authorization secret</label>
          <input name="buyer" type="password" autocomplete="off" required />
          <label>Seller authorization secret</label>
          <input name="seller" type="password" autocomplete="off" required />
          <label>Amount</label>
          <input name="amount" type="number" min="1" step="1" value="100" required />
          <button type="submit">Create escrow</button>
        </form>
        <div id="result" class="result">Waiting for deployment details…</div>
      </div>
    </main>
    <script>
      const form = document.getElementById('escrow-form');
      const result = document.getElementById('result');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());
        result.textContent = 'Submitting escrow request…';
        const response = await fetch('/api/escrows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      });
    </script>
  </body>
</html>`;

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

  if (req.method === 'POST' && url.pathname === '/api/escrows') {
    const body = await readBody(req);

    try {
      const payload = JSON.parse(body);
      const configuredAddress = getContractAddress();
      if (configuredAddress === CONTRACT_ADDRESS_PLACEHOLDER) {
        sendJson(res, {
          status: 'pending-deployment',
          message: 'The escrow contract has been wired up. Deploy it, copy the address, and set CONTRACT_ADDRESS to finish the integration.',
          payload,
        }, 202);
        return;
      }

      const { network, config: networkConfig } = resolveNetwork();
      const seed = getOrCreateSeed(network);
      const walletCtx = await createWallet({ network, networkConfig, seed });
      await walletCtx.wallet.waitForSyncedState();
      await persistWalletState(network, walletCtx);
      const { compiledContract, zkConfigPath } = await loadEscrowContract();
      const providers = await createEscrowProviders(walletCtx, network, networkConfig, zkConfigPath);
      const deployment = getDeployment(network);
      const contractAddress = deployment?.address ?? configuredAddress;

      const deployed: any = await findDeployedContract(providers as any, {
        compiledContract: compiledContract as any,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

      const amount = Number(payload.amount ?? 0);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Amount must be a positive whole number.');
      const tx = await deployed.callTx.createEscrow(
        secretBytes(payload.buyer),
        secretBytes(payload.seller),
        new Uint8Array(randomBytes(32)),
      );

      sendJson(res, {
        status: 'created',
        txId: tx.public.txId,
        contractAddress,
        amount,
        message: 'Escrow created. Store the authorization secrets securely; they are required to prove release or refund authorization.',
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
