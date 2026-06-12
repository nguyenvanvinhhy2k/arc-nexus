import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { depositToUnifiedBalance, spendFromUnifiedBalance, getUnifiedBalance } from "@/services/unifiedBalanceService";
import { BRIDGE_CHAINS } from "@/config/tokens";
import { useUsdcBalance } from "@/hooks/useTokenBalance";
import { useMounted } from "@/hooks/useMounted";
import type { SupportedChain } from "@/services/bridgeService";
import { formatUnits } from "viem";
import { Loader2, ArrowRightLeft, HelpCircle } from "lucide-react";

type TransactionLike = {
  hash?: string;
  txHash?: string;
  transactionHash?: string;
  explorerUrl?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getTransactionResult(value: unknown): TransactionLike {
  if (typeof value === "string") {
    return value.startsWith("0x") ? { hash: value } : {};
  }

  if (value && typeof value === "object") {
    return value as TransactionLike;
  }

  return {};
}

export function GatewayWidget() {
  const mounted = useMounted();
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [activeTab, setActiveTab] = useState<"deposit" | "spend">("deposit");
  const [depositChain, setDepositChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[2]); // Base Sepolia
  const [spendChain, setSpendChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[0]); // Arc Testnet
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unifiedBalance, setUnifiedBalance] = useState<string>("0.00");
  const [successTx, setSuccessTx] = useState<{ hash: string; url?: string } | null>(null);

  const getExplorerUrl = (chainId: number, hash: string) => {
    if (chainId === 5042002) return `https://testnet.arcscan.app/tx/${hash}`;
    if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
    if (chainId === 84532) return `https://sepolia.basescan.org/tx/${hash}`;
    return "";
  };

  const fetchUnifiedBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await getUnifiedBalance(address);
      setUnifiedBalance(parseFloat(bal).toFixed(2));
    } catch (e) {
      console.error("Failed to fetch unified balance", e);
    }
  }, [address]);

  useEffect(() => {
    if (mounted && isConnected && address) {
      const id = requestAnimationFrame(() => {
        void fetchUnifiedBalance();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [mounted, isConnected, address, fetchUnifiedBalance]);

  useEffect(() => {
    if (activeTab === "spend" && isConnected && address) {
      const id = requestAnimationFrame(() => {
        void fetchUnifiedBalance();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [activeTab, isConnected, address, fetchUnifiedBalance]);

  const { data: usdcBal, refetch: refetchUsdc } = useUsdcBalance(address, depositChain.id);
  const balanceText = (mounted && isConnected) ? parseFloat(formatUnits(usdcBal || 0n, 6)).toFixed(2) : "0.00";

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !walletClient) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSuccessTx(null);
    try {
      const res = await depositToUnifiedBalance({
        fromChain: depositChain.appKitId as SupportedChain,
        amount,
        walletClient,
      });
      
      const depositRes = getTransactionResult(res);
      const hash = depositRes.transactionHash || depositRes.txHash || depositRes.hash || "";
      if (hash) {
        const url = getExplorerUrl(depositChain.id, hash);
        setSuccessTx({ hash, url });
      }

      setSuccessMsg(`Successfully deposited ${amount} USDC into Unified Balance.`);
      setAmount("");
      // Refresh balances
      void fetchUnifiedBalance();
      if (refetchUsdc) refetchUsdc();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Deposit failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !recipient || !walletClient) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSuccessTx(null);
    try {
      const res = await spendFromUnifiedBalance({
        amount,
        recipientAddress: recipient,
        toChain: spendChain.appKitId as SupportedChain,
        walletClient,
      });

      const spendRes = getTransactionResult(res);
      const hash = spendRes.txHash || spendRes.transactionHash || spendRes.hash || "";
      const url = spendRes.explorerUrl || (hash ? getExplorerUrl(spendChain.id, hash) : "");
      if (hash) {
        setSuccessTx({ hash, url });
      }

      setSuccessMsg(`Successfully spent ${amount} USDC to recipient on ${spendChain.name}.`);
      setAmount("");
      setRecipient("");
      // Refresh balances
      void fetchUnifiedBalance();
      if (refetchUsdc) refetchUsdc();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Spend transaction failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="defi-card flex max-h-full w-full max-w-md mx-auto flex-col overflow-y-auto rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <span>Unified Balance</span>
          <span className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
            Gateway
          </span>
        </h2>
      </div>

      <div className="mb-4 flex gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-1.5">
        <button
          onClick={() => { setActiveTab("deposit"); setError(null); setSuccessMsg(null); setSuccessTx(null); }}
          className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "deposit"
              ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 shadow"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Deposit USDC
        </button>
        <button
          onClick={() => { setActiveTab("spend"); setError(null); setSuccessMsg(null); setSuccessTx(null); }}
          className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "spend"
              ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 shadow"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Instant Spend
        </button>
      </div>

      {activeTab === "deposit" ? (
        <form onSubmit={handleDeposit} className="flex flex-1 flex-col justify-between gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Source Network</span>
            <select
              value={depositChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) setDepositChain(found);
              }}
              className="defi-focus w-full cursor-pointer bg-transparent text-sm font-semibold text-zinc-200"
            >
              {BRIDGE_CHAINS.filter(c => c.appKitId !== "Arc_Testnet").map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5">
            <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
              <span>Amount to Deposit</span>
              <span>Balance: {balanceText} USDC</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none [appearance:textfield]"
                required
                min="0.01"
                step="any"
                disabled={loading}
              />
              <span className="text-sm font-semibold text-zinc-400">USDC</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-xs text-zinc-400">
            <HelpCircle className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />
            <span>
              Depositing funds locks USDC into the Gateway account, allowing sub-second payments and instant cross-chain liquidity.
            </span>
          </div>

          {(!mounted || !isConnected) ? (
            <div className="w-full rounded-lg border border-dashed border-white/15 px-4 py-3 text-center text-sm text-zinc-500">
              Please connect wallet to deposit
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || !amount}
              className="defi-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 py-3.5 font-bold text-slate-950 transition-all hover:bg-cyan-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Depositing...</span>
                </>
              ) : (
                <span>Deposit into Gateway</span>
              )}
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={handleSpend} className="flex flex-1 flex-col justify-between gap-3">
          {/* Destination Chain Selector */}
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Destination Network</span>
            <select
              value={spendChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) setSpendChain(found);
              }}
              className="defi-focus w-full cursor-pointer bg-transparent text-sm font-semibold text-zinc-200"
              disabled={loading}
            >
              {BRIDGE_CHAINS.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5">
            <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
              <span>Amount to Spend</span>
              <span>Unified Balance: {unifiedBalance} USDC</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none [appearance:textfield]"
                required
                min="0.01"
                step="any"
                disabled={loading}
              />
              <span className="text-sm font-semibold text-zinc-400">USDC</span>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition-all focus-within:border-emerald-300/50">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Recipient Address ({spendChain.name})</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-xs text-zinc-400">
            <ArrowRightLeft className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />
            <span>
              Spending USDC transfers directly from the Unified Balance to the recipient on {spendChain.name} in &lt;500ms.
            </span>
          </div>

          {(!mounted || !isConnected) ? (
            <div className="w-full rounded-lg border border-dashed border-white/15 px-4 py-3 text-center text-sm text-zinc-500">
              Please connect wallet to spend
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || !amount || !recipient}
              className="defi-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 py-3.5 font-bold text-slate-950 transition-all hover:bg-cyan-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Spend...</span>
                </>
              ) : (
                <span>Spend USDC Instantly</span>
              )}
            </button>
          )}
        </form>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center text-xs font-medium text-emerald-300">
          <div>{successMsg}</div>
          {successTx && (
            <div className="pt-2 border-t border-emerald-500/10 flex flex-col items-center gap-1.5 text-[10px]">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Transaction Hash</span>
              <a
                href={successTx.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-emerald-400 hover:text-emerald-300 hover:underline transition-all break-all select-all block px-2 py-1 rounded bg-emerald-500/10 max-w-full truncate"
              >
                {successTx.hash}
              </a>
              {successTx.url && (
                <span className="mt-0.5 text-[9px] italic text-zinc-500">Click to view on Explorer</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
