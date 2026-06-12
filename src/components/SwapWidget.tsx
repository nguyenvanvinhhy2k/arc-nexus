import React, { useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSwap } from "@/hooks/useSwap";
import { useMounted } from "@/hooks/useMounted";
import { ARC_TESTNET_TOKENS, type TokenConfig } from "@/config/tokens";
import { useUsdcBalance, useEurcBalance, useCirBtcBalance } from "@/hooks/useTokenBalance";
import { estimateSwapOnArc } from "@/services/swapService";
import { formatUnits } from "viem";
import { ArrowDownUp, BarChart3, HelpCircle, Loader2, Repeat2 } from "lucide-react";
import { TxStatus } from "./TxStatus";
import { TradeChart } from "./TradeChart";

export function SwapWidget() {
  const { isConnected, address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { swap, loading, error, result } = useSwap();

  const mounted = useMounted();
  const [isEstimating, setIsEstimating] = useState(false);
  const [tokenIn, setTokenIn] = useState<TokenConfig>(ARC_TESTNET_TOKENS[0]); // USDC
  const [tokenOut, setTokenOut] = useState<TokenConfig>(ARC_TESTNET_TOKENS[1]); // EURC
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [txStatus, setTxStatus] = useState<"pending" | "complete" | "failed">("pending");
  const [viewMode, setViewMode] = useState<"trade" | "chart">("trade");

  const [btcPrice, setBtcPrice] = useState<number>(68500); // Live BTC price fallback
  const [eurPrice, setEurPrice] = useState<number>(1.085); // Live EUR price fallback

  const { data: usdcBal, refetch: refetchUsdc } = useUsdcBalance(address);
  const { data: eurcBal, refetch: refetchEur } = useEurcBalance(address);
  const { data: cirBtcBal, refetch: refetchCirBtc } = useCirBtcBalance(address);

  const ARC_TESTNET_CHAIN_ID = 5042002;
  const isCorrectChain = chain?.id === ARC_TESTNET_CHAIN_ID;

  // Poll live exchange rates from public Coinbase APIs (zero CORS, zero API keys)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const btcRes = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
        const btcData = await btcRes.json();
        if (btcData?.data?.amount) {
          setBtcPrice(parseFloat(btcData.data.amount));
        }

        const eurRes = await fetch("https://api.coinbase.com/v2/prices/EUR-USD/spot");
        if (eurRes.ok) {
          const eurData = await eurRes.json();
          if (eurData?.data?.amount) {
            setEurPrice(parseFloat(eurData.data.amount));
          }
        }
      } catch (err) {
        console.error("Error fetching live rates:", err);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 25000);
    return () => clearInterval(interval);
  }, []);

  // Simple token balance helper
  const getTokenBalance = (symbol: string) => {
    if (symbol === "USDC") return usdcBal ? formatUnits(usdcBal, 6) : "0";
    if (symbol === "EURC") return eurcBal ? formatUnits(eurcBal, 6) : "0";
    if (symbol === "cirBTC") return cirBtcBal ? formatUnits(cirBtcBal, 8) : "0";
    return "0";
  };

  const balanceIn = (mounted && isConnected) ? parseFloat(getTokenBalance(tokenIn.symbol)).toFixed(tokenIn.symbol === "cirBTC" ? 6 : 2) : "0.00";
  const balanceOut = (mounted && isConnected) ? parseFloat(getTokenBalance(tokenOut.symbol)).toFixed(tokenOut.symbol === "cirBTC" ? 6 : 2) : "0.00";
  const chartPair = `${tokenIn.symbol}/${tokenOut.symbol}`;
  const chartPrice = useMemo(() => {
    if (amountIn && amountOut) {
      const input = Number(amountIn);
      const output = Number(amountOut);

      if (Number.isFinite(input) && input > 0 && Number.isFinite(output) && output > 0) {
        return output / input;
      }
    }

    if (tokenIn.symbol === tokenOut.symbol) return 1;
    if (tokenIn.symbol === "USDC" && tokenOut.symbol === "EURC") return 1 / eurPrice;
    if (tokenIn.symbol === "EURC" && tokenOut.symbol === "USDC") return eurPrice;
    if (tokenIn.symbol === "USDC" && tokenOut.symbol === "cirBTC") return 1 / btcPrice;
    if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "USDC") return btcPrice;
    if (tokenIn.symbol === "EURC" && tokenOut.symbol === "cirBTC") return eurPrice / btcPrice;
    if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "EURC") return btcPrice / eurPrice;

    return 1;
  }, [amountIn, amountOut, btcPrice, eurPrice, tokenIn.symbol, tokenOut.symbol]);

  // Calculate dynamic exchange rates based on live on-chain quoting & public price feeds
  useEffect(() => {
    if (!amountIn || isNaN(parseFloat(amountIn))) {
      return;
    }

    const getQuote = async () => {
      setIsEstimating(true);

      try {
        if (walletClient && isConnected && isCorrectChain) {
          // Attempt real-time ON-CHAIN quotation via SDK!
          const realQuote = await estimateSwapOnArc({
            tokenIn: tokenIn.symbol,
            tokenOut: tokenOut.symbol,
            amount: amountIn,
            walletClient,
          });
          setAmountOut(parseFloat(realQuote).toFixed(tokenOut.symbol === "cirBTC" ? 8 : 6));
          setIsEstimating(false);
          return;
        }
      } catch (err) {
        console.warn("On-chain estimate fallback to Coinbase price feeds...", err);
      }

      // Fallback calculation using live Coinbase market spot prices if not connected
      const val = parseFloat(amountIn);
      if (tokenIn.symbol === "USDC" && tokenOut.symbol === "EURC") {
        setAmountOut((val / eurPrice).toFixed(6));
      } else if (tokenIn.symbol === "EURC" && tokenOut.symbol === "USDC") {
        setAmountOut((val * eurPrice).toFixed(6));
      } else if (tokenIn.symbol === "USDC" && tokenOut.symbol === "cirBTC") {
        setAmountOut((val / btcPrice).toFixed(8));
      } else if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "USDC") {
        setAmountOut((val * btcPrice).toFixed(6));
      } else if (tokenIn.symbol === "EURC" && tokenOut.symbol === "cirBTC") {
        setAmountOut(((val * eurPrice) / btcPrice).toFixed(8));
      } else if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "EURC") {
        setAmountOut(((val * btcPrice) / eurPrice).toFixed(6));
      } else {
        setAmountOut(val.toFixed(6));
      }
      setIsEstimating(false);
    };

    // Debounce to optimize API queries naturally
    const timer = setTimeout(getQuote, 500);
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut, btcPrice, eurPrice, walletClient, isConnected, isCorrectChain]);

  const handleFlip = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountIn || isNaN(parseFloat(amountIn))) return;
    
    setTxStatus("pending");
    try {
      const res = await swap({
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amount: amountIn,
      });
      if (res && res.txHash) {
        setTxStatus("complete");
        // Dynamic balance refresh
        refetchUsdc();
        refetchEur();
        refetchCirBtc();
      } else {
        setTxStatus("failed");
      }
    } catch {
      setTxStatus("failed");
    }
  };

  return (
    <div className={`defi-card flex max-h-full w-full ${viewMode === "chart" ? "max-w-5xl" : "max-w-md"} mx-auto flex-col overflow-y-auto rounded-lg p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <span>Swap Tokens</span>
          <span className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
            Arc Testnet
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setViewMode((current) => current === "trade" ? "chart" : "trade")}
          className="defi-focus inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 text-xs font-black text-slate-300 transition hover:border-emerald-300/35 hover:text-white"
        >
          {viewMode === "trade" ? (
            <>
              <BarChart3 className="h-4 w-4 text-emerald-300" />
              Chart
            </>
          ) : (
            <>
              <Repeat2 className="h-4 w-4 text-emerald-300" />
              Trade
            </>
          )}
        </button>
      </div>

      {viewMode === "chart" ? (
        <TradeChart
          key={chartPair}
          title="DEX market chart"
          pair={chartPair}
          value={chartPrice}
          suffix={tokenOut.symbol}
        />
      ) : (
      <form onSubmit={handleSwap} className="flex flex-1 flex-col justify-between gap-3">
        {/* Token In Input */}
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5 transition-all focus-within:border-emerald-300/50">
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>Pay</span>
            <span>Balance: {balanceIn} {tokenIn.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => {
                setAmountIn(e.target.value);
                if (!e.target.value || isNaN(parseFloat(e.target.value))) {
                  setAmountOut("");
                }
              }}
              className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
              min="0.000001"
              step="any"
              disabled={loading}
            />
            <select
              value={tokenIn.symbol}
              onChange={(e) => {
                const sym = e.target.value;
                const found = ARC_TESTNET_TOKENS.find(t => t.symbol === sym);
                if (found) {
                  setTokenIn(found);
                  if (tokenOut.symbol === sym) {
                    setTokenOut(ARC_TESTNET_TOKENS.find(t => t.symbol !== sym) || tokenIn);
                  }
                }
              }}
              className="defi-focus rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-zinc-200"
              disabled={loading}
            >
              {ARC_TESTNET_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-zinc-950 text-zinc-200">
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flip Button */}
        <div className="relative z-10 -my-2 flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            disabled={loading}
            className="defi-focus cursor-pointer rounded-lg border border-white/10 bg-slate-950 p-2 text-zinc-400 shadow-md transition-all hover:scale-105 hover:border-cyan-300/30 hover:text-cyan-300 active:scale-95 disabled:opacity-50"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* Token Out Input */}
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5">
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>Receive (Estimated)</span>
            <span>Balance: {balanceOut} {tokenOut.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder={isEstimating ? "Estimating..." : "0.0"}
              value={isEstimating ? "" : amountOut}
              readOnly
              className={`w-full bg-transparent text-xl font-bold focus:outline-none transition-all duration-300 ${isEstimating ? "text-zinc-600 animate-pulse" : "text-zinc-400"}`}
            />
            <select
              value={tokenOut.symbol}
              onChange={(e) => {
                const sym = e.target.value;
                const found = ARC_TESTNET_TOKENS.find(t => t.symbol === sym);
                if (found) {
                  setTokenOut(found);
                  if (tokenIn.symbol === sym) {
                    setTokenIn(ARC_TESTNET_TOKENS.find(t => t.symbol !== sym) || tokenOut);
                  }
                }
              }}
              className="defi-focus rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-zinc-200"
              disabled={loading}
            >
              {ARC_TESTNET_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-zinc-950 text-zinc-200">
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fee & Network details */}
        <div className="space-y-1.5 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              Estimated Fee <HelpCircle className="h-3 w-3 text-zinc-600" />
            </span>
            <span className="font-semibold text-zinc-200">~ 0.01 USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span className="text-emerald-400 font-medium">&lt; 0.05%</span>
          </div>
        </div>

        {/* Submit Swap */}
        {(!mounted || !isConnected) ? (
          <div className="w-full rounded-lg border border-dashed border-white/15 px-4 py-3 text-center text-sm text-zinc-500">
            Please connect wallet to swap
          </div>
        ) : !isCorrectChain ? (
          <div className="w-full rounded-lg border border-dashed border-rose-400/30 bg-rose-500/5 px-4 py-3 text-center text-sm text-rose-300/80">
            Please switch chain to Arc Testnet
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !amountIn}
            className="defi-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-300/10 transition-all hover:bg-cyan-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Executing Swap...</span>
              </>
            ) : (
              <span>Swap Tokens</span>
            )}
          </button>
        )}
      </form>
      )}

      {/* Error Output */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Transaction Status Tracker */}
      {result && result.txHash && (
        <TxStatus txHash={result.txHash} status={txStatus} type="swap" />
      )}
    </div>
  );
}
