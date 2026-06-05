import {
  createPublicClient,
  erc20Abi,
  http,
  isAddress,
  parseUnits,
  type Address,
  type WalletClient,
} from "viem";
import { arcTestnet } from "@/config/chains";
import { ARC_TESTNET_CONTRACTS } from "@/config/contracts";
import { ARC_TESTNET_TOKENS, type TokenSymbol } from "@/config/tokens";

export type DeFiAction = "lend" | "pool" | "borrow";

export interface DeFiParams {
  action: DeFiAction;
  market: string;
  assets: TokenSymbol[];
  amount: string;
  amountB?: string;
  walletClient: WalletClient;
}

export interface DeFiResult {
  txHash: string;
  approveTxHashes: string[];
}

const defiAbi = [
  {
    type: "function",
    name: "lend",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "addLiquidity",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"),
});

function getToken(symbol: TokenSymbol) {
  const token = ARC_TESTNET_TOKENS.find((item) => item.symbol === symbol);

  if (!token || !isAddress(token.address)) {
    throw new Error(`Missing token config for ${symbol}`);
  }

  return {
    ...token,
    address: token.address as Address,
  };
}

function getContractAddress(action: DeFiAction): Address {
  const byAction = {
    lend: process.env.NEXT_PUBLIC_LEND_CONTRACT_ADDRESS,
    pool: process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS,
    borrow: process.env.NEXT_PUBLIC_BORROW_CONTRACT_ADDRESS,
  } satisfies Record<DeFiAction, string | undefined>;

  const address = byAction[action] || process.env.NEXT_PUBLIC_LEND_POOL_BORROW_CONTRACT_ADDRESS || ARC_TESTNET_CONTRACTS.DeFiVault;

  if (!address || address.includes("...") || !isAddress(address)) {
    throw new Error(
      `Missing or invalid NEXT_PUBLIC_${action.toUpperCase()}_CONTRACT_ADDRESS. Add a deployed Arc Testnet contract address to .env.local.`,
    );
  }

  return address;
}

async function approveToken({
  walletClient,
  token,
  spender,
  amount,
}: {
  walletClient: WalletClient;
  token: ReturnType<typeof getToken>;
  spender: Address;
  amount: bigint;
}) {
  const account = walletClient.account?.address;

  if (!account) {
    throw new Error("Wallet account not available");
  }

  return walletClient.writeContract({
    account,
    chain: walletClient.chain ?? null,
    address: token.address,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  });
}

export async function executeDeFiOperation(params: DeFiParams): Promise<DeFiResult> {
  const account = params.walletClient.account?.address;

  if (!account) {
    throw new Error("Wallet account not available");
  }

  const contractAddress = getContractAddress(params.action);
  const tokens = params.assets.map(getToken);
  const amount = parseUnits(params.amount, tokens[0].decimals);
  const approveTxHashes: string[] = [];

  if (params.action === "pool") {
    if (tokens.length !== 2) {
      throw new Error("Pool operation requires two assets");
    }

    const amountA = parseUnits(params.amount, tokens[0].decimals);
    const amountB = parseUnits(params.amountB ?? params.amount, tokens[1].decimals);

    for (const [index, token] of tokens.entries()) {
      const approveTxHash = await approveToken({
        walletClient: params.walletClient,
        token,
        spender: contractAddress,
        amount: index === 0 ? amountA : amountB,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      approveTxHashes.push(approveTxHash);
    }

    const txHash = await params.walletClient.writeContract({
      account,
      chain: params.walletClient.chain ?? null,
      address: contractAddress,
      abi: defiAbi,
      functionName: "addLiquidity",
      args: [tokens[0].address, tokens[1].address, amountA, amountB],
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash, approveTxHashes };
  }

  if (params.action === "lend") {
    const approveTxHash = await approveToken({
      walletClient: params.walletClient,
      token: tokens[0],
      spender: contractAddress,
      amount,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
    approveTxHashes.push(approveTxHash);
  }

  const txHash = await params.walletClient.writeContract({
    account,
    chain: params.walletClient.chain ?? null,
    address: contractAddress,
    abi: defiAbi,
    functionName: params.action,
    args: [tokens[0].address, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return { txHash, approveTxHashes };
}
