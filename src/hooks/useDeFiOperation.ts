import { useState } from "react";
import { useWalletClient } from "wagmi";
import {
  executeDeFiOperation,
  type DeFiParams,
  type DeFiResult,
} from "@/services/defiService";

type ViemLikeError = {
  shortMessage?: string;
  details?: string;
  message?: string;
  cause?: unknown;
};

function getErrorText(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "DeFi transaction failed";
  }

  const err = error as ViemLikeError;
  const nested = err.cause && typeof err.cause === "object" ? err.cause as ViemLikeError : undefined;
  const text = [
    err.shortMessage,
    err.details,
    nested?.shortMessage,
    nested?.details,
    err.message,
  ].find((value) => typeof value === "string" && value.length > 0);

  if (!text) {
    return "DeFi transaction failed";
  }

  if (
    text.toLowerCase().includes("user rejected") ||
    text.toLowerCase().includes("denied request signature") ||
    text.includes("4001")
  ) {
    return "Transaction was cancelled in your wallet.";
  }

  return text;
}

export function useDeFiOperation() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeFiResult | null>(null);

  async function execute(params: Omit<DeFiParams, "walletClient">) {
    if (!walletClient) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await executeDeFiOperation({ ...params, walletClient });
      setResult(res);
      return res;
    } catch (error) {
      setError(getErrorText(error));
    } finally {
      setLoading(false);
    }
  }

  return { execute, loading, error, result };
}
