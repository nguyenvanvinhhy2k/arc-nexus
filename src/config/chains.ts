import { defineChain, type Chain } from "viem";

export const arcTestnet: Chain & { iconUrl: string } = {
  ...defineChain({
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"],
        webSocket: ["wss://rpc.testnet.arc.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "ArcScan",
        url: "https://testnet.arcscan.app",
      },
    },
    testnet: true,
  }),
  iconUrl: "/arc-testnet-icon.png",
};

// Use Ethereum Sepolia + Base Sepolia for bridge
export { sepolia, baseSepolia } from "viem/chains";
