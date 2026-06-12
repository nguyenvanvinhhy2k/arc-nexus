import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useUsdcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { ShieldAlert } from "lucide-react";

export function WalletConnect() {
  const [mounted, setMounted] = React.useState(false);
  const { isConnected, address, chain } = useAccount();
  const { data: usdcBalanceRaw } = useUsdcBalance(address);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const SUPPORTED_CHAIN_IDS = [5042002, 11155111, 84532];
  const isSupportedChain = chain?.id ? SUPPORTED_CHAIN_IDS.includes(chain.id) : false;

  const usdcBalance = usdcBalanceRaw 
    ? parseFloat(formatUnits(usdcBalanceRaw, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

  if (!mounted) {
    return (
      <div className="h-10 w-[152px] rounded-lg bg-white/10" aria-hidden="true" />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {isConnected && !isSupportedChain && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
          <ShieldAlert className="h-4.5 w-4.5" />
          <span>Unsupported Network</span>
        </div>
      )}

      {isConnected && isSupportedChain && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-zinc-300">
          <div className="h-2 w-2 rounded-full bg-emerald-300"></div>
          <span className="font-semibold text-zinc-400">Gas Balance:</span>
          <span className="font-bold text-zinc-100">{usdcBalance} USDC</span>
        </div>
      )}

      <div className="flex justify-center">
        <ConnectButton 
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </div>
  );
}
