"use client";

import React, { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmiConfig";
import "@rainbow-me/rainbowkit/styles.css";

function isExternalDomRemovalError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  return (
    message.includes("removeChild") &&
    message.includes("not a child")
  );
}

function ClientRuntimeGuards() {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function proxyCircleFetch(input, init) {
      let url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.includes("api.circle.com")) {
        url = url.replace("https://api.circle.com", "/api/circle");

        if (typeof input === "string") {
          input = url;
        } else if (input instanceof URL) {
          input = new URL(url, window.location.origin);
        } else {
          input = new Request(url, input);
        }
      }

      return originalFetch(input, init);
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (isExternalDomRemovalError(event.error) || isExternalDomRemovalError(new Error(event.message))) {
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isExternalDomRemovalError(event.reason)) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0ea5e9", // Sky-500
            accentColorForeground: "white",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          <ClientRuntimeGuards />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
