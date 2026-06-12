import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBridge } from "@/hooks/useBridge";
import { useMounted } from "@/hooks/useMounted";
import { BRIDGE_CHAINS } from "@/config/tokens";
import { estimateBridgeFee, type SupportedChain } from "@/services/bridgeService";
import { useUsdcBalance, useEurcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { ArrowRight, Loader2, Info, User } from "lucide-react";
import { TxStatus } from "./TxStatus";

export function BridgeWidget() {
  const mounted = useMounted();
  const { isConnected, address, chain } = useAccount();
  const { bridge, loading, error, result } = useBridge();

  const [fromChain, setFromChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[0]); // Arc Testnet
  const [toChain, setToChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[1]); // Ethereum Sepolia
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [speedMode, setSpeedMode] = useState<"fast" | "standard">("fast");
  const [estimatedFee, setEstimatedFee] = useState<string>("0.01");
  const [txStep, setTxStep] = useState<"pending" | "attesting" | "minting" | "complete" | "failed">("pending");

  // Load user's balance
  const { data: usdcBal } = useUsdcBalance(address, fromChain.id);
  const { data: eurcBal } = useEurcBalance(address, fromChain.id);

  const getBalance = () => {
    if (token === "USDC") return usdcBal ? formatUnits(usdcBal, 6) : "0";
    if (token === "EURC") return eurcBal ? formatUnits(eurcBal, 6) : "0";
    return "0";
  };

  const balanceText = (mounted && isConnected) ? parseFloat(getBalance()).toFixed(2) : "0.00";

  // Pre-fill recipient address with active account
  useEffect(() => {
    if (address && !recipient) {
      const id = requestAnimationFrame(() => setRecipient(address));
      return () => cancelAnimationFrame(id);
    }
  }, [address, recipient]);

  // Update estimated fee when chains change
  useEffect(() => {
    const fetchFee = async () => {
      const fee = await estimateBridgeFee({
        fromChain: fromChain.appKitId as SupportedChain,
        toChain: toChain.appKitId as SupportedChain,
        token,
        amount: amount || "0",
      });
      setEstimatedFee(fee);
    };
    fetchFee();
  }, [fromChain, toChain, token, amount]);

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !recipient) return;

    setTxStep("pending");
    try {
      const res = await bridge({
        fromChain: fromChain.appKitId as SupportedChain,
        toChain: toChain.appKitId as SupportedChain,
        token,
        amount,
      });

      if (res && res.sourceTxHash) {
        // Mocking stages of CCTP for visual feedback during testnet demonstration
        setTxStep("attesting");
        setTimeout(() => {
          setTxStep("minting");
          setTimeout(() => {
            setTxStep("complete");
          }, speedMode === "fast" ? 6000 : 15000);
        }, speedMode === "fast" ? 4000 : 10000);
      } else {
        setTxStep("failed");
      }
    } catch {
      setTxStep("failed");
    }
  };

  const isChainMismatched = mounted && isConnected && chain?.id !== fromChain.id;

  return (
    <div className="defi-card w-full max-h-full max-w-md mx-auto overflow-y-auto rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <span>Bridge Stablecoin</span>
          <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-200">
            Circle CCTP
          </span>
        </h2>
      </div>

      <form onSubmit={handleBridge} className="space-y-3">
        {/* Chain Selector (From / To) */}
        <div className="grid grid-cols-9 items-center gap-2">
          <div className="col-span-4 rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Source Chain</span>
            <select
              value={fromChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) {
                  setFromChain(found);
                  if (toChain.id === id) {
                    setToChain(BRIDGE_CHAINS.find(c => c.id !== id) || fromChain);
                  }
                }
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

          <div className="col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwapChains}
              disabled={loading}
              className="defi-focus cursor-pointer rounded-lg border border-white/10 bg-slate-950 p-1.5 text-zinc-400 hover:text-cyan-300"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="col-span-4 rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Dest Chain</span>
            <select
              value={toChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) {
                  setToChain(found);
                  if (fromChain.id === id) {
                    setFromChain(BRIDGE_CHAINS.find(c => c.id !== id) || toChain);
                  }
                }
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
        </div>

        {/* Token and Amount Input */}
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5">
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>Send Amount</span>
            <span>Balance: {balanceText} {token}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none [appearance:textfield]"
              required
              min="0.000001"
              step="any"
              disabled={loading}
            />
            <select
              value={token}
              onChange={(e) => setToken(e.target.value as "USDC" | "EURC")}
              className="defi-focus cursor-pointer rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-zinc-200"
              disabled={loading}
            >
              <option value="USDC" className="bg-zinc-950 text-zinc-200">USDC</option>
              <option value="EURC" className="bg-zinc-950 text-zinc-200">EURC</option>
            </select>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-1.5 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition-all focus-within:border-cyan-300/50">
          <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-zinc-600" />
            Recipient Address
          </label>
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

        {/* Speed Selection */}
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-1.5">
          <button
            type="button"
            onClick={() => setSpeedMode("fast")}
            className={`cursor-pointer rounded-lg py-2 text-xs font-semibold transition-all ${
              speedMode === "fast"
                ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
            disabled={loading}
          >
            Fast (~15s)
          </button>
          <button
            type="button"
            onClick={() => setSpeedMode("standard")}
            className={`cursor-pointer rounded-lg py-2 text-xs font-semibold transition-all ${
              speedMode === "standard"
                ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
            disabled={loading}
          >
            Standard (~15 min)
          </button>
        </div>

        {/* Fee estimation and timing information */}
        <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Bridge Gas Fee</span>
            <span className="font-semibold text-zinc-200">
              {fromChain.appKitId === "Arc_Testnet" 
                ? `~ ${estimatedFee} USDC (Paid in USDC, NO ETH required!)` 
                : `~ ${fromChain.appKitId === "Ethereum_Sepolia" ? "0.0015" : "0.0001"} ETH (Paid in ETH)`}
            </span>
          </div>
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="flex justify-between border-t border-zinc-800/50 pt-2 font-medium">
              <span className="text-zinc-300">You Receive (Estimated)</span>
              <span className="text-emerald-400 font-bold">
                {Math.max(0, parseFloat(amount) - (token === "USDC" ? parseFloat(estimatedFee) : 0)).toFixed(2)} {token}
              </span>
            </div>
          )}
          <div className="flex justify-between items-start gap-1 border-t border-zinc-800/50 pt-2">
            <span className="flex items-center gap-1">
              Bridge Protocol <Info className="h-3 w-3 text-zinc-600" />
            </span>
            <span className="text-zinc-500 text-right">No wrapping, mints native asset on destination via CCTP</span>
          </div>
        </div>

        {/* Submit Button */}
        {(!mounted || !isConnected) ? (
          <div className="w-full rounded-lg border border-dashed border-white/15 px-4 py-3 text-center text-sm text-zinc-500">
            Please connect wallet to bridge
          </div>
        ) : isChainMismatched ? (
          <div className="w-full rounded-lg border border-dashed border-rose-400/30 bg-rose-500/5 px-4 py-3 text-center text-sm text-rose-300/80">
            Switch chain to {fromChain.name} to send
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !amount || !recipient}
            className="defi-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-300/10 transition-all hover:bg-cyan-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Bridge...</span>
              </>
            ) : (
              <span>Bridge stablecoin</span>
            )}
          </button>
        )}
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* CCTP Progress visualizer */}
      {result && result.sourceTxHash && (
        <TxStatus txHash={result.sourceTxHash} status={txStep} type="bridge" />
      )}
    </div>
  );
}
