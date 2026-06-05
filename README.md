# 🚀 Arc Nexus

### Unified DeFi Workspace on Arc Network

Arc Nexus is an all-in-one DeFi dashboard built on **Arc Network**, designed to simplify cross-chain finance and showcase the power of Arc's USDC-native infrastructure.

Users can seamlessly:

* 🔄 Swap assets
* 🌉 Bridge stablecoins across chains
* 💳 Manage Unified Balance
* 💰 Lend assets
* 🏊 Provide liquidity
* 📈 Borrow against collateral

All from a single interface powered by Circle's Web3 infrastructure.

---

## ✨ Features

| Feature              | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| 🔐 Wallet Connection | Connect MetaMask, Coinbase Wallet, and other EVM wallets             |
| 🔄 Swap              | Exchange USDC, EURC, and cirBTC on Arc Testnet                       |
| 🌉 Bridge            | Transfer USDC & EURC between Arc, Base Sepolia, and Ethereum Sepolia |
| 💳 Gateway           | Deposit into Unified Balance and spend across chains                 |
| 💰 Lend              | Supply assets into lending markets                                   |
| 🏊 Pool              | Add liquidity to supported trading pairs                             |
| 📈 Borrow            | Borrow assets using collateral positions                             |
| ⚡ Arc Native         | Built specifically for Arc's USDC-native ecosystem                   |

---

# 🏗 Architecture

```text
┌─────────────────┐
│     Wallet      │
│ MetaMask/AppKit │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Arc Nexus    │
│    Frontend     │
└────────┬────────┘
         │
 ┌───────┼────────┐
 ▼       ▼        ▼
Swap   Bridge   Gateway
 │       │         │
 ▼       ▼         ▼
Arc   Circle     Unified
DEX    CCTP      Balance
```

---

# 🛠 Tech Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Frontend        | Next.js            |
| Language        | TypeScript         |
| UI              | Tailwind CSS       |
| Wallet          | Circle Web3 AppKit |
| Blockchain      | Arc Network        |
| Bridge          | Circle CCTP        |
| Smart Contracts | Solidity           |
| Package Manager | npm                |

---

# 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/nguyenvanvinhhy2k/arc-nexus.git

cd arc-nexus
```

### 2️⃣ Install Dependencies

```bash
npm install
```

---

# ⚙️ Environment Setup

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Circle Web3 AppKit Kit Key:

```env
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:YOUR_KEY_HERE
```

### Example

```env
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:abcd1234:xyz98765
```

---

# 🔑 Get a Circle Kit Key

To use Swap and Bridge functionality, obtain a Kit Key from Circle:

### Steps

1. Visit https://console.circle.com
2. Sign in or create an account
3. Navigate to:

```text
Developer Console → API Keys
```

4. Click **Create Kit Key**
5. Copy the generated key
6. Add it to `.env.local`

---

# 🚀 Run the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🌐 Supported Networks

| Network          | Purpose                     |
| ---------------- | --------------------------- |
| Arc Testnet      | Primary application network |
| Ethereum Sepolia | Bridge source/destination   |
| Base Sepolia     | Bridge source/destination   |

---

# 💧 Faucet Guide

Arc uses **USDC as the native gas token**.

Before testing the application:

### Arc Testnet

Claim:

* USDC
* EURC

From:

```text
https://faucet.circle.com
```

### Sepolia Networks

For bridge testing, also claim:

| Network          | Gas Required |
| ---------------- | ------------ |
| Ethereum Sepolia | ETH          |
| Base Sepolia     | ETH          |

---

# 🪙 Supported Assets

| Asset          | Symbol | Decimals | Contract Address                             |
| -------------- | ------ | -------- | -------------------------------------------- |
| USD Coin       | USDC   | 6        | `0x3600000000000000000000000000000000000000` |
| Euro Coin      | EURC   | 6        | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Hashnote USYC  | USYC   | 6        | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| Circle Bitcoin | cirBTC | 8        | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` |

---

# 📖 User Guide

## 🔄 Swap

| Step | Action                  |
| ---- | ----------------------- |
| 1    | Open Swap               |
| 2    | Select token to pay     |
| 3    | Select token to receive |
| 4    | Enter amount            |
| 5    | Review quote            |
| 6    | Confirm transaction     |

---

## 🌉 Bridge

| Step | Action                   |
| ---- | ------------------------ |
| 1    | Open Bridge              |
| 2    | Select source chain      |
| 3    | Select destination chain |
| 4    | Choose asset             |
| 5    | Enter amount             |
| 6    | Confirm bridge           |

---

## 💳 Gateway

### Deposit

| Step | Action                       |
| ---- | ---------------------------- |
| 1    | Choose source network        |
| 2    | Enter USDC amount            |
| 3    | Deposit into Unified Balance |

### Instant Spend

| Step | Action                     |
| ---- | -------------------------- |
| 1    | Choose destination network |
| 2    | Enter recipient address    |
| 3    | Enter amount               |
| 4    | Confirm transfer           |

---

## 💰 Lend

| Step | Action                |
| ---- | --------------------- |
| 1    | Select lending market |
| 2    | Enter amount          |
| 3    | Click Lend            |
| 4    | Confirm transaction   |

---

## 🏊 Pool

| Step | Action                |
| ---- | --------------------- |
| 1    | Select liquidity pair |
| 2    | Enter token amounts   |
| 3    | Add liquidity         |
| 4    | Confirm transaction   |

---

## 📈 Borrow

| Step | Action                         |
| ---- | ------------------------------ |
| 1    | Select asset                   |
| 2    | Review collateral requirements |
| 3    | Enter amount                   |
| 4    | Confirm borrow                 |

---

# 🎯 Why Arc Nexus?

✅ Unified DeFi Experience

✅ Built for Arc's USDC-Native Economy

✅ Cross-Chain Stablecoin Transfers

✅ Circle Web3 AppKit Integration

✅ Circle CCTP Support

✅ Developer-Friendly Architecture

✅ Ready for Extension and Production Development

---

# 🗺 Roadmap

| Status | Feature             |
| ------ | ------------------- |
| ✅      | Swap                |
| ✅      | Bridge              |
| ✅      | Gateway             |
| ✅      | Lend                |
| ✅      | Pool                |
| ✅      | Borrow              |
| 🔄     | Portfolio Dashboard |
| 🔄     | Transaction History |
| 🔄     | Yield Analytics     |
| 🔄     | Position Tracking   |
| 🔄     | Mainnet Support     |

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/my-feature
git commit -m "Add new feature"
git push origin feature/my-feature
```

Then open a Pull Request.

---

# 📞 Contact

### Developer

🐦 X (Twitter)

https://x.com/th787252

### Repository

🌐 https://github.com/nguyenvanvinhhy2k/arc-nexus

---

### Built with ❤️ for the Arc Ecosystem
