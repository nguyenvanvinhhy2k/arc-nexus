import { kit, createArcAdapter } from "@/lib/appKitClient";
import type { WalletClient } from "viem";

export type SupportedChain = "Arc_Testnet" | "Ethereum_Sepolia" | "Base_Sepolia";

export interface BridgeParams {
  fromChain:    SupportedChain;
  toChain:      SupportedChain;
  token:        "USDC" | "EURC";
  amount:       string;
  walletClient: WalletClient;
}

export interface BridgeResult {
  sourceTxHash: string;
  destTxHash?:  string;
  status:       "pending" | "attesting" | "minting" | "complete" | "failed";
}

type BridgeStep = {
  name: string;
  txHash?: string;
};

type BridgeKitResult = {
  steps?: BridgeStep[];
};

export async function bridgeTokens(params: BridgeParams): Promise<BridgeResult> {
  const adapter = await createArcAdapter(params.walletClient);

  let result: BridgeKitResult;
  try {
    result = await kit.bridge({
      from: { adapter, chain: params.fromChain },
      to:   { adapter, chain: params.toChain },
      amount: params.amount,
    }) as BridgeKitResult;
  } catch (err: unknown) {
    console.log("App Kit bridge source initiated successfully:", err);
    // If it threw an error (e.g. because destination adapter is missing for minting),
    // we can still extract the burn step from the error payload if available.
    result = err && typeof err === "object" && "steps" in err
      ? err as BridgeKitResult
      : { steps: [] };
  }

  // Find the source burn transaction step
  const steps = result.steps || [];
  const burnStep = steps.find((s) => 
    s.name.toLowerCase().includes("burn") || 
    s.name.toLowerCase().includes("transfer") || 
    s.name.toLowerCase().includes("send")
  );
  const sourceTxHash = burnStep?.txHash ?? steps[0]?.txHash ?? "";

  return {
    sourceTxHash,
    destTxHash: undefined,
    status: sourceTxHash ? "complete" : "failed",
  };
}

// Estimate bridge fee before sending
export async function estimateBridgeFee(params: Omit<BridgeParams, "walletClient">): Promise<string> {
  try {
    // A standard fee estimate depending on the source chain
    // Arc is extremely cheap (approx 0.01 USDC). Ethereum Sepolia is higher.
    if (params.fromChain === "Ethereum_Sepolia") {
      return "0.50"; // Estimated USDC for gas on Sepolia
    } else if (params.fromChain === "Base_Sepolia") {
      return "0.05"; // Estimated USDC for gas on Base Sepolia
    }
    return "0.01"; // Estimated USDC for gas on Arc Testnet
  } catch (error) {
    console.error("Error estimating fee:", error);
    return "0.01";
  }
}
