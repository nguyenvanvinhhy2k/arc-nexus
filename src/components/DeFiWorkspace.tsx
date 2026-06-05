"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useDeFiOperation } from "@/hooks/useDeFiOperation";
import { useMounted } from "@/hooks/useMounted";
import { ARC_TESTNET_TOKENS, type TokenSymbol } from "@/config/tokens";
import { TxStatus } from "@/components/TxStatus";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Coins,
  HandCoins,
  Info,
  Landmark,
  Loader2,
  Percent,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

export type DeFiMode = "lend" | "pool" | "borrow" | "docs";

type DeFiWorkspaceProps = {
  mode: DeFiMode;
};

type Market = {
  id: string;
  name: string;
  assets: TokenSymbol[];
  rate: string;
  depth: string;
  helper: string;
};

const lendMarkets: Market[] = [
  { id: "lend-usdc", name: "USDC", assets: ["USDC"], rate: "4.82%", depth: "$18.4M", helper: "72% utilization" },
  { id: "lend-eurc", name: "EURC", assets: ["EURC"], rate: "3.16%", depth: "$6.8M", helper: "48% utilization" },
  { id: "lend-cirbtc", name: "cirBTC", assets: ["cirBTC"], rate: "1.94%", depth: "$2.1M", helper: "31% utilization" },
];

const poolMarkets: Market[] = [
  { id: "pool-usdc-eurc", name: "USDC / EURC", assets: ["USDC", "EURC"], rate: "6.24%", depth: "$12.6M", helper: "0.04% fee tier" },
  { id: "pool-usdc-cirbtc", name: "USDC / cirBTC", assets: ["USDC", "cirBTC"], rate: "9.88%", depth: "$4.9M", helper: "0.12% fee tier" },
  { id: "pool-eurc-cirbtc", name: "EURC / cirBTC", assets: ["EURC", "cirBTC"], rate: "11.40%", depth: "$1.7M", helper: "0.18% fee tier" },
];

const borrowMarkets: Market[] = [
  { id: "borrow-usdc", name: "USDC", assets: ["USDC"], rate: "6.12%", depth: "$5.1M", helper: "80% collateral limit" },
  { id: "borrow-eurc", name: "EURC", assets: ["EURC"], rate: "4.55%", depth: "$2.9M", helper: "75% collateral limit" },
  { id: "borrow-cirbtc", name: "cirBTC", assets: ["cirBTC"], rate: "3.78%", depth: "$860K", helper: "65% collateral limit" },
];

const docs = [
{
title: "1. Connect Your Wallet and Select a Network",
description: "Prepare your wallet before interacting with the dApp so all modules can read balances correctly and send transactions on the right network.",
steps: [
"Click Connect Wallet in the top-right corner.",
"Choose MetaMask, Coinbase Wallet, or any injected browser wallet.",
"Switch to Arc Testnet when using Swap, Lend, Pool, or Borrow.",
"Make sure you have testnet USDC, as Arc uses USDC as the native gas token.",
],
},
{
title: "2. Swap Tokens on Arc",
description: "Use the Swap tab to exchange USDC, EURC, and cirBTC directly within the workspace.",
steps: [
"Open the Swap tab from the left-hand menu.",
"Select the token you want to pay in the Pay field and the token you want to receive in the Receive field.",
"Enter the amount, and the dApp will estimate the received tokens and price impact.",
"Review the estimated fees, then click Swap Tokens and confirm the transaction in your wallet.",
],
},
{
title: "3. Bridge Stablecoins",
description: "Use the Bridge tab to transfer USDC or EURC between Arc Testnet, Ethereum Sepolia, and Base Sepolia via Circle CCTP.",
steps: [
"Select the Source Chain and Destination Chain.",
"Choose USDC or EURC and enter the amount to bridge.",
"Verify the recipient address. By default, the dApp fills in the connected wallet address.",
"Choose Fast or Standard mode, then click Bridge Stablecoin and confirm the transaction.",
],
},
{
title: "4. Gateway Unified Balance",
description: "Use the Gateway tab to deposit USDC into your Unified Balance or spend it instantly on a destination network.",
steps: [
"In Deposit USDC, select the source network and enter the amount of USDC to deposit.",
"Click Deposit into Gateway to transfer funds into your Unified Balance.",
"In Instant Spend, choose the destination network, enter the amount, and provide the recipient address.",
"Click Spend USDC Instantly to send USDC from your Unified Balance to the recipient.",
],
},
{
title: "5. Lend, Pool, and Borrow",
description: "These DeFi tabs allow you to view markets, enter amounts, and interact with contracts configured in .env.local.",
steps: [
"Lend: Select a market, enter an amount, and click Lend to supply assets.",
"Pool: Choose a liquidity pair, enter both token amounts, and click Add Liquidity.",
"Borrow: Select the asset you want to borrow, review collateral suggestions, and click Borrow.",
"If a button is disabled, check your wallet connection, Arc Testnet network, token balances, and contract addresses.",
],
},
]


const modeCopy = {
  lend: {
    title: "Supply market",
    label: "Supply amount",
    action: "Lend",
    success: "Supply preview created",
    empty: "Select a market and enter an amount to preview a lend position.",
  },
  pool: {
    title: "Liquidity pool",
    label: "Deposit amount",
    action: "Add liquidity",
    success: "Pool preview created",
    empty: "Select a pool and enter an amount to preview LP exposure.",
  },
  borrow: {
    title: "Collateral borrow",
    label: "Borrow amount",
    action: "Borrow",
    success: "Borrow transaction submitted",
    empty: "Select a borrow market and enter an amount to preview debt.",
  },
  docs: {
    title: "Product documentation",
    label: "",
    action: "",
    success: "",
    empty: "",
  },
} satisfies Record<DeFiMode, {
  title: string;
  label: string;
  action: string;
  success: string;
  empty: string;
}>;

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-stone-800 bg-stone-900 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-stone-400">{label}</p>
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MarketRow({
  market,
  selected,
  onSelect,
}: {
  market: Market;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full cursor-pointer gap-3 rounded-lg border p-3 text-left transition sm:grid-cols-[1fr_110px_110px_82px] sm:items-center ${
        selected
          ? "border-emerald-300 bg-emerald-300/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <div>
        <p className="text-sm font-black text-white">{market.name}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{market.helper}</p>
      </div>
      <div>
        <p className="text-[11px] font-black uppercase text-stone-500">Rate</p>
        <p className="mt-1 text-sm font-black text-emerald-300">{market.rate}</p>
      </div>
      <div>
        <p className="text-[11px] font-black uppercase text-stone-500">Depth</p>
        <p className="mt-1 text-sm font-black text-white">{market.depth}</p>
      </div>
      <span className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-black text-stone-950">
        {selected ? "Selected" : "Select"}
      </span>
    </button>
  );
}

function getTokenConfig(symbol: TokenSymbol) {
  const token = ARC_TESTNET_TOKENS.find((item) => item.symbol === symbol);

  if (!token) {
    throw new Error(`Missing token config for ${symbol}`);
  }

  return token;
}

function isPositiveAmount(value: string, decimals: number) {
  try {
    return parseUnits(value, decimals) > 0n;
  } catch {
    return false;
  }
}

function formatBalance(value: bigint | undefined, symbol: TokenSymbol) {
  if (value === undefined) {
    return "0";
  }

  const token = getTokenConfig(symbol);
  const formatted = Number(formatUnits(value, token.decimals));

  if (!Number.isFinite(formatted)) {
    return "0";
  }

  return formatted.toLocaleString(undefined, {
    maximumFractionDigits: token.decimals === 8 ? 6 : 2,
  });
}

function ActionPanel({
  mode,
  markets,
  stats,
}: {
  mode: Exclude<DeFiMode, "docs">;
  markets: Market[];
  stats: Array<{ label: string; value: string; icon: ComponentType<{ className?: string }> }>;
}) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="mt-3 h-20 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  return <ActionPanelContent mode={mode} markets={markets} stats={stats} />;
}

function ActionPanelContent({
  mode,
  markets,
  stats,
}: {
  mode: Exclude<DeFiMode, "docs">;
  markets: Market[];
  stats: Array<{ label: string; value: string; icon: ComponentType<{ className?: string }> }>;
}) {
  const { address, isConnected, chain } = useAccount();
  const queryClient = useQueryClient();
  const { execute, loading, error, result } = useDeFiOperation();
  const copy = modeCopy[mode];
  const [selectedMarketId, setSelectedMarketId] = useState(markets[0].id);
  const [amount, setAmount] = useState("");
  const [amountB, setAmountB] = useState("");
  const [message, setMessage] = useState(copy.empty);
  const [txStatus, setTxStatus] = useState<"pending" | "complete" | "failed">("pending");
  const selectedMarket = markets.find((market) => market.id === selectedMarketId) ?? markets[0];
  const isCorrectChain = chain?.id === 5042002;
  const selectedTokens = selectedMarket.assets.map(getTokenConfig);
  const primaryToken = selectedTokens[0];
  const secondaryToken = selectedTokens[1];
  const balanceReads = useReadContracts({
    contracts: selectedTokens.map((token) => ({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      chainId: 5042002,
    })),
    query: {
      enabled: !!address && isCorrectChain,
    },
  });
  const primaryBalanceResult = balanceReads.data?.[0]?.status === "success" ? balanceReads.data[0].result : undefined;
  const secondaryBalanceResult = balanceReads.data?.[1]?.status === "success" ? balanceReads.data[1].result : undefined;
  const primaryBalance = typeof primaryBalanceResult === "bigint" ? primaryBalanceResult : undefined;
  const secondaryBalance = typeof secondaryBalanceResult === "bigint" ? secondaryBalanceResult : undefined;
  const primaryBalanceLabel = formatBalance(primaryBalance, primaryToken.symbol);
  const secondaryBalanceLabel = secondaryToken ? formatBalance(secondaryBalance, secondaryToken.symbol) : undefined;
  const hasValidAmount = isPositiveAmount(amount, primaryToken.decimals);
  const hasValidSecondaryAmount = mode !== "pool" || (
    secondaryToken ? isPositiveAmount(amountB, secondaryToken.decimals) : false
  );
  const canSubmit = hasValidAmount && hasValidSecondaryAmount && !loading;

  const estimatedValue = useMemo(() => {
    const numericAmount = Number(amount);
    const numericRate = Number.parseFloat(selectedMarket.rate);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "0.00";
    }

    return ((numericAmount * numericRate) / 100).toFixed(2);
  }, [amount, selectedMarket.rate]);

  const collateralEstimate = useMemo(() => {
    if (mode !== "borrow") {
      return "0.00";
    }

    const numericAmount = Number(amount);
    const collateralLimit = Number.parseFloat(selectedMarket.helper);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !Number.isFinite(collateralLimit) || collateralLimit <= 0) {
      return "0.00";
    }

    return (numericAmount / (collateralLimit / 100)).toFixed(2);
  }, [amount, mode, selectedMarket.helper]);

  const submitAction = async () => {
    if (!hasValidAmount || !hasValidSecondaryAmount) {
      setMessage(mode === "pool" ? "Enter both pool token amounts before submitting." : "Enter an amount greater than 0 before submitting.");
      return;
    }

    if (!isConnected) {
      setMessage("Connect wallet before submitting a smart contract transaction.");
      return;
    }

    if (!isCorrectChain) {
      setMessage("Switch wallet network to Arc Testnet before submitting.");
      return;
    }

    setTxStatus("pending");
    setMessage("Submitting approval and smart contract transaction...");

    const res = await execute({
      action: mode,
      market: selectedMarket.name,
      assets: selectedMarket.assets,
      amount,
      amountB: mode === "pool" ? amountB : undefined,
    });

    if (res?.txHash) {
      await Promise.all([
        balanceReads.refetch(),
        queryClient.invalidateQueries(),
      ]);
      setTxStatus("complete");
      setMessage(`${copy.action} confirmed for ${amount} on ${selectedMarket.name}. Balances updated.`);
      setAmount("");
      setAmountB("");
    } else {
      setTxStatus("failed");
      setMessage("Transaction was not submitted. Check the wallet prompt or error details below.");
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_280px]">
        <div className="space-y-2">
          {markets.map((market) => (
            <MarketRow
              key={market.id}
              market={market}
              selected={market.id === selectedMarket.id}
              onSelect={() => {
                setSelectedMarketId(market.id);
                setMessage(`Selected ${market.name}. Enter an amount to continue.`);
              }}
            />
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
          <div className="mb-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">{copy.label}</p>
            <h3 className="mt-1 text-lg font-black text-white">{selectedMarket.name}</h3>
          </div>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={`0.00 ${primaryToken.symbol}`}
            className="h-10 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 text-sm font-black text-white outline-none transition placeholder:text-stone-600 focus:border-emerald-300"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Balance: {primaryBalanceLabel} {primaryToken.symbol}
            </span>
            {primaryBalance !== undefined && mode !== "borrow" && (
              <button
                type="button"
                onClick={() => setAmount(formatUnits(primaryBalance, primaryToken.decimals))}
                className="cursor-pointer font-black text-emerald-300 transition hover:text-emerald-200"
              >
                Max
              </button>
            )}
          </div>

          {mode === "pool" && secondaryToken && (
            <div className="mt-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountB}
                onChange={(event) => setAmountB(event.target.value)}
                placeholder={`0.00 ${secondaryToken.symbol}`}
                className="h-10 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 text-sm font-black text-white outline-none transition placeholder:text-stone-600 focus:border-emerald-300"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  Balance: {secondaryBalanceLabel} {secondaryToken.symbol}
                </span>
                {secondaryBalance !== undefined && (
                  <button
                    type="button"
                    onClick={() => setAmountB(formatUnits(secondaryBalance, secondaryToken.decimals))}
                    className="cursor-pointer font-black text-emerald-300 transition hover:text-emerald-200"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 rounded-lg bg-stone-950 p-2.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-stone-500">
                {mode === "borrow" ? "Estimated yearly interest" : "Estimated yearly value"}
              </span>
              <span className="font-black text-emerald-300">{estimatedValue}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-stone-500">Market rate</span>
              <span className="font-black text-white">{selectedMarket.rate}</span>
            </div>
            {mode === "borrow" && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-stone-500">Suggested collateral</span>
                <span className="font-black text-white">{collateralEstimate}</span>
              </div>
            )}
          </div>

          {!isConnected && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs font-bold leading-5 text-amber-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Connect a wallet to submit on-chain lend, pool, and borrow transactions.
            </div>
          )}

          <button
            type="button"
            onClick={submitAction}
            disabled={!canSubmit}
            className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-black text-stone-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing transaction...
              </>
            ) : (
              <>
                {copy.action}
                <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-2.5">
            <p className="text-sm font-bold leading-5 text-emerald-50">{message}</p>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-bold leading-6 text-rose-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {result?.txHash && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-stone-400">Smart contract transaction</h3>
          {result.approveTxHashes.length > 0 && (
            <div className="mb-3 rounded-lg bg-stone-950 p-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Approval transaction{result.approveTxHashes.length > 1 ? "s" : ""} submitted
              </div>
              <p className="mt-1 break-all text-xs font-medium text-stone-500">
                {result.approveTxHashes.join(", ")}
              </p>
            </div>
          )}
          <div className="[&>div]:mt-0">
            <TxStatus txHash={result.txHash} status={txStatus} />
          </div>
        </div>
      )}
    </div>
  );
}

function DocsPanel() {
  const [activeDoc, setActiveDoc] = useState(0);
  const selectedDoc = docs[activeDoc];

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_500px]">
      <div className="space-y-2">
        {docs.map((item, index) => (
          <button
            type="button"
            key={item.title}
            onClick={() => setActiveDoc(index)}
            className={`w-full cursor-pointer rounded-lg border p-3 text-left transition ${
              activeDoc === index
                ? "border-emerald-300 bg-emerald-300/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-black text-stone-950">
                {index + 1}
              </span>
              <h3 className="text-base font-black text-white">{item.title}</h3>
            </div>
            <p className="text-sm font-medium leading-5 text-stone-400">{item.description}</p>
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3.5">
        <BookOpen className="mb-3 h-6 w-6 text-emerald-300" />
        <h3 className="text-lg font-black text-white">{selectedDoc.title}</h3>
        <p className="mt-2 text-sm font-medium leading-5 text-emerald-50/80">
          {selectedDoc.description}
        </p>
        <ol className="mt-3 space-y-2">
          {selectedDoc.steps.map((step, index) => (
            <li key={step} className="flex gap-2 rounded-lg bg-stone-950 p-2.5 text-sm font-bold leading-5 text-stone-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-300 text-[11px] font-black text-stone-950">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 rounded-lg border border-white/10 bg-stone-950 p-3 text-xs font-bold leading-5 text-stone-400">
          Lưu ý: các thao tác on-chain cần ví đã kết nối, đúng network và có đủ gas/token testnet trước khi xác nhận giao dịch.
        </div>
      </div>
    </div>
  );
}

export function DeFiWorkspace({ mode }: DeFiWorkspaceProps) {
  return (
    <div className="max-h-full w-full space-y-3 overflow-y-auto pr-1">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
              DeFi module
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white">{modeCopy[mode].title}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-stone-300">
            <HandCoins className="h-4 w-4 text-emerald-300" />
            Interactive preview
          </div>
        </div>
      </div>

      {mode === "lend" && (
        <ActionPanel
          mode="lend"
          markets={lendMarkets}
          stats={[
            { label: "Supplied", value: "$27.3M", icon: PiggyBank },
            { label: "Avg APY", value: "3.64%", icon: Percent },
            { label: "Risk mode", value: "Standard", icon: ShieldCheck },
          ]}
        />
      )}
      {mode === "pool" && (
        <ActionPanel
          mode="pool"
          markets={poolMarkets}
          stats={[
            { label: "Pool TVL", value: "$19.2M", icon: Coins },
            { label: "Top APR", value: "11.40%", icon: TrendingUp },
            { label: "Fee tiers", value: "3", icon: Percent },
          ]}
        />
      )}
      {mode === "borrow" && (
        <ActionPanel
          mode="borrow"
          markets={borrowMarkets}
          stats={[
            { label: "Borrow cap", value: "$8.9M", icon: Landmark },
            { label: "Min health", value: "1.25x", icon: ShieldCheck },
            { label: "Oracle", value: "Live", icon: Info },
          ]}
        />
      )}
      {mode === "docs" && <DocsPanel />}
    </div>
  );
}
