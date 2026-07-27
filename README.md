# Midnight Escrow

A privacy-preserving escrow DApp for Midnight that proves buyer or seller authorization without revealing the agreement's amount, terms, or authorization secrets.

## Contract Address

| Network | Contract Address |
| --- | --- |
| Preprod | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |

## Features

- Create a single escrow agreement with buyer and seller authorization commitments.
- Release funds only when the seller proves knowledge of the seller secret.
- Refund only when the buyer proves knowledge of the buyer secret.
- Keep agreement terms, amount, commitment randomness, and authorization secrets private.
- Provide a local dashboard/API, interactive CLI, local wallet, network configuration, and proof-server integration.
- Validate lifecycle transitions and surface deployment/loading errors clearly.

## What This Project Does

The contract is a privacy-first escrow state machine. An escrow is created once, then moves from `FUNDED` to either `RELEASED` or `REFUNDED`. It stores cryptographic commitments for the parties and agreement, rather than the underlying agreement data. The application uses Midnight's wallet, indexer, proof-provider, and private-state providers to build transactions.

## Privacy Model

| Category | Information |
| --- | --- |
| Public | Lifecycle status and the buyer, seller, and agreement commitments. |
| Private | Authorization-secret preimages, escrow amount, agreement terms, participant identities, and commitment randomness. |
| Proven without disclosure | A release caller knows the seller secret; a refund caller knows the buyer secret; and the requested state transition is valid. |

`contracts/escrow.compact` uses Compact witnesses for authorization secrets. It uses `persistentHash` commitments and only uses `disclose()` for the commitments that must enter public ledger state. Do not reuse authorization secrets or commitment randomness between escrows.

## Tech Stack

- Midnight Compact and Compact compiler
- Midnight.js 4.1, wallet SDK, indexer provider, proof provider, and Level private-state provider
- TypeScript and Node.js
- Docker Compose / Midnight proof server

## Folder Structure

```text
contracts/
  escrow.compact          Compact escrow contract
  managed/escrow/         Generated contract assets (gitignored)
src/
  server.ts               Dashboard and HTTP API
  cli.ts                  Interactive escrow CLI
  contract.ts             Contract artifacts and Midnight provider wiring
  wallet.ts               Local wallet integration
  deploy.ts               Manual deployment command
scripts/
  compile-contract.ts     Cross-platform Compact compiler wrapper
```

No idea-specific scaffold files or folders were renamed: this repository was already named `escrow` and its existing `contracts/escrow.compact` and `src/` layout were reused. The obsolete starter contract was removed.

## Prerequisites

- Node.js 22+ (the project was verified with the available Node.js 24)
- Docker Desktop running
- Ubuntu WSL on Windows; Midnight documents WSL as the supported Windows path
- Compact installed in WSL with Midnight's official installer

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
```

## Installation

```bash
npm install
docker compose up -d --wait
```

## Build

```bash
npm run build
```

## Compile

```bash
npm run compact
```

On Windows the script invokes the `Ubuntu` WSL distribution. Set `MIDNIGHT_WSL_DISTRO` if your distribution has a different name.

## Run Locally

```bash
npm run start
# visit http://127.0.0.1:3000

npm run cli
```

## Manual Deployment

Deployment is intentionally skipped. After compilation and funding the deployer wallet, deploy manually:

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run deploy -- --network preprod
```

Never run the deployment command against a network with a seed you do not control. The local `undeployed` preset uses a development-only seed.

## After Deployment

The only remaining manual steps are:

1. Deploy the Compact contract.
2. Copy the deployed contract address.
3. Replace every occurrence of `<YOUR_DEPLOYED_CONTRACT_ADDRESS>`.

No additional coding should be required.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `CONTRACT_ADDRESS` | Deployed address for dashboard/API interaction; defaults to `<YOUR_DEPLOYED_CONTRACT_ADDRESS>`. |
| `PRIVATE_STATE_PASSWORD` | Password for the local encrypted private-state store. |
| `MIDNIGHT_WALLET_SEED` | Wallet seed override for non-local networks. Keep secret. |
| `MIDNIGHT_WSL_DISTRO` | WSL distribution used by `npm run compact` on Windows; defaults to `Ubuntu`. |
| `MIDNIGHT_INDEXER_URL`, `MIDNIGHT_INDEXER_WS_URL`, `MIDNIGHT_NODE_URL` | Network endpoint overrides. |
| `MIDNIGHT_PROOF_SERVER_URL` | Proof server endpoint override. |
| `PORT` | Local dashboard/API port; defaults to `3000`. |

## Screenshots

- Placeholder — add a dashboard screenshot after deployment.
- Placeholder — add a successful escrow lifecycle screenshot after deployment.

## Initial Idea

- Placeholder — add the original project idea and product rationale here.

## Troubleshooting

- **`compact` is not found:** install it in WSL, restart WSL, then run `npm run compact`.
- **Wrong WSL distribution:** set `MIDNIGHT_WSL_DISTRO` to the name returned by `wsl -l -q`.
- **Proof server unavailable:** run `docker compose up -d --wait` and confirm port 6300 is available.
- **Contract address placeholder response:** deploy first, then set `CONTRACT_ADDRESS` to the address returned by deployment.
- **Insufficient tNIGHT/DUST:** fund the active public-network wallet, allow DUST generation, and retry deployment.
