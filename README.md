# Arc Nexus

A modern DeFi workspace built for the Arc ecosystem. Arc Nexus provides a ready-to-use interface for token swaps, stablecoin bridging, and unified balance management powered by Circle's Web3 AppKit SDK.

---

# Getting Started

## 1. Download the Project

Clone the repository and install all required packages:

```bash
git clone https://github.com/nguyenvanvinhhy2k/arc-nexus.git
cd arc-nexus

npm install
```

---

## 2. Set Up Environment Variables

Create your local environment file from the provided template:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Circle Web3 AppKit Kit Key:

```env
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:xxxxxx:yyyyyyyyyy
```

The repository already includes default configuration values for Arc Testnet RPC endpoints and contract addresses, so the Kit Key is the only required value before running the application.

---

## 3. Launch the Application

Start the development environment:

```bash
npm run dev
```

Once the server is running, open:

```text
http://localhost:3000
```

in your browser.

---

# Obtaining a Circle Web3 AppKit Kit Key

Arc Nexus uses Circle's Web3 AppKit services for swap and bridge functionality.

To generate your own Kit Key:

1. Visit the Circle Developer Console.
2. Sign in or create a developer account.
3. Open the API Keys section from the Developer Console menu.
4. Create a new Kit Key.
5. Copy the generated credential.
6. Paste it into your `.env.local` file as:

```env
NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:xxxxxxxxxxxxxxxx
```

Circle Console:

https://console.circle.com

API Keys:

https://console.circle.com/keys

---

# Getting Testnet Assets

Arc uses USDC as its native gas token. Before interacting with the application, make sure your wallet contains testnet assets.

## Arc Testnet Gas & Stablecoins

Use the Circle Faucet to request testnet funds:

1. Open the Circle Faucet.
2. Select **Arc Testnet**.
3. Enter your wallet address.
4. Request **USDC**.
5. Request **EURC** if you want to test token swaps.

Faucet:

https://faucet.circle.com

---

## Assets for Cross-Chain Bridge Testing

To test transfers from external networks:

1. Visit the Circle Faucet.
2. Select **Ethereum Sepolia** or **Base Sepolia**.
3. Request USDC or EURC.
4. Ensure your wallet also has a small amount of native gas on the source chain.

Examples:

* Ethereum Sepolia ETH
* Base Sepolia ETH

You can obtain testnet gas from public faucet providers such as Alchemy Faucet or Sepolia community faucets.

---

# Arc Testnet Token Directory

Import the following assets into your wallet if they are not automatically detected.

| Asset  | Address                                      | Decimals |
| ------ | -------------------------------------------- | -------- |
| USDC   | `0x3600000000000000000000000000000000000000` | 6        |
| EURC   | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6        |
| USYC   | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | 6        |
| cirBTC | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` | 8        |

---

# Features

Arc Nexus currently includes:

* Wallet connection via Circle AppKit
* Token swaps on Arc Testnet
* Cross-chain stablecoin transfers through CCTP
* Unified Balance deposits and spending
* Arc-focused DeFi interface components
* Ready-to-extend architecture for developers

---

# Support

Need help setting up the project or extending functionality?

Contact:

X (Twitter): https://x.com/th787252

Feel free to reach out with questions, bug reports, or development ideas related to Arc Nexus.
