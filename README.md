# Arc Nexus

A unified DeFi workspace built on Arc Network.

Arc Nexus brings together token swaps, cross-chain stablecoin transfers, unified balance management, lending, borrowing, and liquidity provisioning into a single interface powered by Arc Network and Circle's Web3 infrastructure.

The goal of Arc Nexus is to simplify access to Arc's ecosystem by providing a developer-friendly and user-friendly dashboard that showcases the core financial primitives available on Arc.

---

## Overview

Arc Nexus demonstrates how developers can build a complete DeFi experience on Arc Network using:

* Circle Web3 AppKit
* Circle CCTP
* Arc Testnet
* React / Next.js
* EVM Smart Contracts

Users can:

* Connect wallets
* Swap supported assets
* Bridge stablecoins across chains
* Deposit and spend through Unified Balance
* Supply assets to lending markets
* Provide liquidity
* Borrow against collateral

All features are accessible from a single application.

---

## Key Features

### Wallet Integration

Connect using:

* MetaMask
* Coinbase Wallet
* Browser-injected wallets

The application automatically detects supported EVM wallets and prompts users to switch to Arc Testnet when required.

---

### Token Swap

Swap supported assets directly on Arc Network.

Supported assets include:

* USDC
* EURC
* cirBTC

Capabilities:

* Token selection
* Quote estimation
* Price impact preview
* Transaction confirmation

---

### Cross-Chain Bridge

Transfer stablecoins between supported networks using Circle CCTP.

Supported networks:

* Arc Testnet
* Ethereum Sepolia
* Base Sepolia

Features:

* USDC bridging
* EURC bridging
* Fast settlement options
* Destination wallet customization

---

### Unified Balance Gateway

Manage balances across networks using Arc's Unified Balance concept.

Functions:

#### Deposit

Move USDC from external chains into Unified Balance.

#### Instant Spend

Spend USDC directly from Unified Balance to any supported destination network.

Benefits:

* Reduced bridging complexity
* Improved user experience
* Cross-chain liquidity abstraction

---

### Lending

Supply assets to supported lending markets.

Users can:

* View available markets
* Supply assets
* Track positions
* Monitor balances

---

### Liquidity Pools

Provide liquidity to supported pools.

Users can:

* Select trading pairs
* Deposit token pairs
* Receive LP positions
* Contribute liquidity to Arc ecosystem markets

---

### Borrowing

Borrow assets against supplied collateral.

Features:

* Collateral recommendations
* Borrow amount validation
* Position monitoring
* Transaction execution

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Blockchain

* Arc Network
* Ethereum-compatible smart contracts

### Infrastructure

* Circle Web3 AppKit
* Circle CCTP
* Arc RPC

### Wallets

* MetaMask
* Coinbase Wallet
* Injected EVM wallets

---

## Project Structure

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── constants/
└── types/

public/
.env.example
```

### Important Directories

#### components/

Reusable UI components.

#### services/

Blockchain interaction logic.

#### hooks/

React hooks for wallet and blockchain state management.

#### constants/

Contract addresses and network configuration.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/nguyenvanvinhhy2k/arc-nexus.git
cd arc-nexus
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure your Circle Kit Key:

```env
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:YOUR_KEY_HERE
```

Additional values may already be preconfigured:

* Arc Testnet RPC
* Token addresses
* Contract addresses

---

## Running Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Arc Testnet Requirements

Before using the application:

### 1. Connect a Wallet

Supported wallets:

* MetaMask
* Coinbase Wallet

### 2. Switch to Arc Testnet

Ensure your wallet is connected to Arc Testnet.

### 3. Obtain Testnet Assets

Arc uses USDC as the native gas token.

You must have testnet USDC to execute transactions.

Circle Faucet:

https://faucet.circle.com

---

## Supported Assets

| Asset  | Address                                    | Decimals |
| ------ | ------------------------------------------ | -------- |
| USDC   | 0x3600000000000000000000000000000000000000 | 6        |
| EURC   | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a | 6        |
| USYC   | 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C | 6        |
| cirBTC | 0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF | 8        |

---

## User Guide

### Swap

1. Open Swap.
2. Select input token.
3. Select output token.
4. Enter amount.
5. Review quote.
6. Confirm transaction.

---

### Bridge

1. Open Bridge.
2. Select source chain.
3. Select destination chain.
4. Select asset.
5. Enter amount.
6. Confirm transaction.

---

### Gateway

Deposit:

1. Select source chain.
2. Enter USDC amount.
3. Deposit into Unified Balance.

Spend:

1. Select destination chain.
2. Enter recipient address.
3. Confirm transfer.

---

### Lend

1. Choose a lending market.
2. Enter amount.
3. Click Lend.
4. Confirm transaction.

---

### Pool

1. Select a liquidity pair.
2. Enter token amounts.
3. Add liquidity.
4. Confirm transaction.

---

### Borrow

1. Select an asset.
2. Review collateral requirements.
3. Enter borrow amount.
4. Confirm transaction.

---

## Future Improvements

Potential roadmap items:

* Position dashboard
* Yield analytics
* Portfolio tracking
* Multi-wallet support
* Transaction history
* Notifications
* Mobile optimization
* Mainnet deployment

---

## Contributing

Contributions are welcome.

Fork the repository, create a feature branch, and submit a pull request.

---

## License

MIT License

---

## Contact

Developer:

X (Twitter)

https://x.com/th787252

Repository:

https://github.com/nguyenvanvinhhy2k/arc-nexus
