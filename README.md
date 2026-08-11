# Midnight Escrow — Zero-Knowledge Privacy Protocol

Midnight Escrow is a privacy-preserving digital agreement DApp built natively on Midnight's zero-knowledge layer. It enables counterparty transactions where obligations are proven without disclosing trade secrets, deal amounts, or participant identities on-chain.

## Contract & Deployment Status

| Property | Details |
| --- | --- |
| **Network** | Midnight Preprod Testnet |
| **Contract Address** | `02003ccecf9e1d8ea83e60155b5507ffcc98ae7ee5f4c4a45a333190df0e56e927c9` |
| **Live Web App** | [https://escrow-henna-seven.vercel.app/](https://escrow-henna-seven.vercel.app/) |
| **Demo Video** | [Watch Demonstration](https://drive.google.com/file/d/1JKyK9ODofAk_H_-WWBU35iC4dmaD63x5/view?usp=sharing) |

---

## UI Screenshots

<img width="1902" height="856" alt="Midnight Escrow Hero Landing" src="https://github.com/user-attachments/assets/7f8c3f80-16bd-46fd-860d-8f122bda071a" />

<img width="1864" height="834" alt="Midnight Escrow Control Center" src="https://github.com/user-attachments/assets/94ab9aff-b35f-4b05-a0a8-c841b9b2a096" />

---

## Initial Product Idea

Midnight Escrow is a privacy-preserving digital agreement framework designed to solve transaction counterparty risk without exposing high-stakes commercial terms or participant identities on-chain. Built natively on Midnight's zero-knowledge layer, the application locks obligations behind cryptographic commitment schemes (`buyerAuthority`, `sellerAuthority`, and `agreementCommitment`), allowing escrow release or refund actions to execute only when secret preimages are proven via Compact ZK circuits. This model protects sensitive deal amounts, agreement terms, and participant credentials from public ledger visibility while maintaining non-repudiable state enforcement.

---

## CI/CD Pipeline

The project includes an automated **CI/CD Pipeline** powered by GitHub Actions. The workflow file is located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Workflow Jobs:
1. **Checkout Code**: Fetches latest commit on `main`/`master` branches or pull requests.
2. **Node.js Environment**: Sets up Node.js v22 environment.
3. **Dependency Installation**: Runs `npm ci` cleanly.
4. **Unit Test Suite**: Executes unit tests via `npm test` (`test/escrow.test.ts`).
5. **TypeScript Compilation**: Validates Node/backend TypeScript code (`npm run build`).
6. **Frontend App Compilation**: Validates React Vite client build (`npm run build:client`).

---

## Features

- **Zero-Knowledge Proof Execution**: Perform escrow release and refund operations using Compact circuits without publishing preimages or terms.
- **Lace & Midnight Wallet Support**: Direct browser wallet connection using `@midnight-ntwrk/dapp-connector-api`.
- **Modern React + Vite Frontend**: Responsive UI built with custom CSS design tokens and micro-animations.
- **Full Compact Circuit Architecture**: Native `contracts/escrow.compact` state machine with `createEscrow`, `releaseEscrow`, and `refundEscrow` circuits.
- **Automated CI/CD Pipeline**: GitHub Actions workflow testing TypeScript build and React frontend compilation.

---

## Privacy Model

| Category | Information |
| --- | --- |
| **Public On-Chain** | Lifecycle status (`UNFUNDED`, `FUNDED`, `RELEASED`, `REFUNDED`) and commitment hashes (`buyerAuthority`, `sellerAuthority`, `agreementCommitment`). |
| **Private Local State** | Authorization secret preimages, escrow amounts, terms plaintext, participant identities, and commitment randomness. |
| **Proven Without Disclosure** | Release caller holds the seller secret; refund caller holds the buyer secret; and state transition logic is valid. |

---

## Project Structure

```text
escrow/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD pipeline workflow
├── client/                     # Vite + React Modern DApp Frontend
│   ├── src/
│   │   ├── components/        # React UI components (Hero, WalletCard, EscrowStatus, etc.)
│   │   ├── hooks/             # Wallet connection & Escrow API hooks
│   │   ├── App.tsx            # Main Application Shell
│   │   └── index.css          # Design tokens & styling
│   └── vite.config.ts         # Vite build configuration
├── contracts/
│   ├── escrow.compact         # Midnight Compact zero-knowledge contract
│   └── managed/escrow/        # Generated circuit binaries, ZKIR, and proving keys
├── src/
│   ├── server.ts              # Backend API & static asset server
│   ├── contract.ts            # Midnight JS providers & circuit wiring
│   ├── network.ts             # Midnight network configuration (Preprod/Preview/Local)
│   ├── wallet.ts              # Node wallet integration
│   └── config.ts              # Address & network configuration
├── test/
│   └── escrow.test.ts         # Unit test suite verifying circuit hashing and privacy model
└── vercel.json                # Vercel deployment configuration
```

---

## Development Setup

### Prerequisites
- Node.js >= 22.0.0
- Docker Desktop (for running the Midnight proof server)

### 1. Install Dependencies
```bash
npm install
npm --prefix client install
```

### 2. Run Compact Compiler
```bash
npm run compact
```

### 3. Run Unit Tests
```bash
npm test
```

### 4. Start Local Development Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

---

## Deployment Configuration (Vercel)

The repository contains a top-level `vercel.json` configured to build the React application from `client/`:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## License

MIT
