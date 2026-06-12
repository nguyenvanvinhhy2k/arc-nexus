"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WalletConnect } from "@/components/WalletConnect";
import { SwapWidget } from "@/components/SwapWidget";
import { BridgeWidget } from "@/components/BridgeWidget";
import { GatewayWidget } from "@/components/GatewayWidget";
import { DeFiWorkspace } from "@/components/DeFiWorkspace";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeDollarSign,
  BookOpen,
  ChevronRight,
  CircleDot,
  Gauge,
  HandCoins,
  Landmark,
  Layers,
  PackageOpen,
  PiggyBank,
  RadioTower,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

type TabId = "swap" | "bridge" | "gateway" | "lend" | "pool" | "borrow" | "docs";

const tabConfig = {
  swap: {
    label: "Swap",
    eyebrow: "Market order",
    title: "Token exchange desk",
    description: "Quote and execute Arc-native USDC, EURC, and cirBTC routes from a focused trading workspace.",
    icon: ArrowLeftRight,
    accent: "bg-emerald-300 text-slate-950 shadow-[0_0_28px_rgba(52,245,198,0.28)]",
  },
  bridge: {
    label: "Bridge",
    eyebrow: "CCTP route",
    title: "Cross-chain transfer lane",
    description: "Move stablecoins between Arc, Ethereum Sepolia, and Base Sepolia with route and fee context nearby.",
    icon: ArrowUpRight,
    accent: "bg-cyan-300 text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.24)]",
  },
  gateway: {
    label: "Gateway",
    eyebrow: "Unified balance",
    title: "Liquidity command center",
    description: "Deposit once, then spend USDC through Circle Gateway across supported destinations.",
    icon: Layers,
    accent: "bg-indigo-300 text-slate-950 shadow-[0_0_28px_rgba(165,180,252,0.22)]",
  },
  lend: {
    label: "Lend",
    eyebrow: "Supply APY",
    title: "Lending supply market",
    description: "Review Arc testnet money markets, compare utilization, and prepare wallet-first supply actions.",
    icon: PiggyBank,
    accent: "bg-lime-300 text-slate-950 shadow-[0_0_28px_rgba(190,242,100,0.18)]",
  },
  pool: {
    label: "Pool",
    eyebrow: "LP routes",
    title: "Liquidity pool explorer",
    description: "Compare trading pairs, fee tiers, TVL, and estimated APR before adding balanced liquidity.",
    icon: PackageOpen,
    accent: "bg-cyan-300 text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.24)]",
  },
  borrow: {
    label: "Borrow",
    eyebrow: "Collateral",
    title: "Borrow risk workspace",
    description: "Inspect available liquidity, borrow APR, collateral limits, and health-factor guardrails.",
    icon: HandCoins,
    accent: "bg-rose-300 text-slate-950 shadow-[0_0_28px_rgba(253,164,175,0.2)]",
  },
  docs: {
    label: "Docs",
    eyebrow: "Protocol guide",
    title: "Lend Pool Borrow Docs",
    description: "A compact product guide for lending, pooling, borrowing, risk notes, and future contract integration.",
    icon: BookOpen,
    accent: "bg-amber-300 text-slate-950 shadow-[0_0_28px_rgba(252,211,77,0.18)]",
  },
} satisfies Record<TabId, {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}>;

const metrics = [
  { label: "Native gas", value: "USDC", icon: BadgeDollarSign },
  { label: "Chains", value: "3", icon: RadioTower },
  { label: "Mode", value: "Testnet", icon: ShieldCheck },
];

const activity = [
  { label: "Arc RPC", value: "Online", tone: "text-emerald-700", dot: "bg-emerald-500" },
  { label: "CCTP lane", value: "Ready", tone: "text-sky-700", dot: "bg-sky-500" },
  { label: "Gateway", value: "Standby", tone: "text-violet-700", dot: "bg-violet-500" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("swap");
  const active = tabConfig[activeTab];
  const ActiveIcon = active.icon;

  return (
    <div className="defi-shell min-h-[100dvh] overflow-hidden text-slate-50 lg:h-screen">
      <div className="defi-grid" />
      <div className="defi-orbit hidden lg:block" />
      <div className="defi-cube hidden lg:block" />

      <div className="grid min-h-[100dvh] lg:h-screen lg:min-h-0 lg:grid-cols-[252px_1fr]">
        <aside className="defi-card border-b border-white/10 px-4 py-4 lg:m-3 lg:h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:rounded-lg lg:border">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/25 bg-slate-950 shadow-[0_0_32px_rgba(52,245,198,0.18)]">
                <Image
                  src="/arc-nexus-logo.svg"
                  alt="Arc Nexus"
                  width={24}
                  height={24}
                  className="rounded"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">Arc Nexus</p>
                <p className="text-xs font-semibold text-slate-400">DeFi execution layer</p>
              </div>
            </div>

            <div className="hidden lg:mt-5 lg:block">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200/60">
                Operations
              </p>
              <nav className="space-y-1">
                {(Object.keys(tabConfig) as TabId[]).map((tab) => {
                  const item = tabConfig[tab];
                  const Icon = item.icon;
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`defi-focus group relative flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition ${
                        isActive
                          ? "border-emerald-300/35 bg-emerald-300/12 text-white shadow-[0_0_34px_rgba(52,245,198,0.12)]"
                          : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-emerald-300" />
                      )}
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-md ${
                          isActive ? "bg-emerald-300 text-slate-950" : "bg-white/[0.06] text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold">{item.label}</span>
                        <span className={`block text-xs ${isActive ? "text-emerald-100/70" : "text-slate-500"}`}>
                          {item.eyebrow}
                        </span>
                      </span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition ${
                          isActive
                            ? "translate-x-0 text-emerald-300"
                            : "-translate-x-1 text-slate-600 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 lg:mt-5 lg:grid-cols-1">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{metric.label}</span>
                    <Icon className="h-4 w-4 text-emerald-300/80" />
                  </div>
                  <p className="text-lg font-black tracking-tight text-white">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl lg:mr-3 lg:mt-3 lg:rounded-lg lg:border">
            <div className="flex min-h-14 flex-col justify-between gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:px-6 lg:px-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-200/70">
                  <CircleDot className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300" />
                  Live testnet workspace
                </div>
                <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  Arc Nexus Command Center
                </h1>
              </div>
              <WalletConnect />
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
              {(Object.keys(tabConfig) as TabId[]).map((tab) => {
                const item = tabConfig[tab];
                const Icon = item.icon;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`defi-focus flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-extrabold ${
                      activeTab === tab
                        ? "border-emerald-300/40 bg-emerald-300 text-slate-950"
                        : "border-white/10 bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          <main className="grid flex-1 gap-3 px-4 py-3 sm:px-6 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_292px] lg:px-3">
            <section className="flex min-h-0 min-w-0 flex-col">
              <div className="defi-card mb-3 shrink-0 overflow-hidden rounded-lg">
                <div className="grid gap-3 p-3.5 lg:p-4">
                  <div>
                    <div className="mb-2.5 flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active.accent}`}>
                        <ActiveIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                          {active.eyebrow}
                        </p>
                        <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
                          {active.title}
                        </h2>
                      </div>
                    </div>
                    <p className="max-w-3xl text-sm font-medium leading-5 text-slate-400">
                      {active.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-amber-300/15 bg-amber-300/10 px-3 py-2">
                      <p className="text-[11px] font-black uppercase text-amber-100/60">Fee asset</p>
                      <p className="text-base font-black text-amber-100">USDC</p>
                    </div>
                    <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-3 py-2">
                      <p className="text-[11px] font-black uppercase text-emerald-100/60">Slippage</p>
                      <p className="text-base font-black text-emerald-100">&lt;0.05%</p>
                    </div>
                    <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-2">
                      <p className="text-[11px] font-black uppercase text-cyan-100/60">Network</p>
                      <p className="text-base font-black text-cyan-100">Arc</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="defi-card-strong flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-lg p-3 sm:p-3.5 lg:min-h-0">
                <div className="mb-2.5 flex shrink-0 items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">Execution module</p>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "swap" && <SwapWidget />}
                  {activeTab === "bridge" && <BridgeWidget />}
                  {activeTab === "gateway" && <GatewayWidget />}
                  {activeTab === "lend" && <DeFiWorkspace mode="lend" />}
                  {activeTab === "pool" && <DeFiWorkspace mode="pool" />}
                  {activeTab === "borrow" && <DeFiWorkspace mode="borrow" />}
                  {activeTab === "docs" && <DeFiWorkspace mode="docs" />}
                </div>
              </div>
            </section>

            <aside className="min-h-0 space-y-3 overflow-y-auto lg:h-full">
              <section className="defi-card rounded-lg p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Status</p>
                    <h3 className="text-base font-black text-white">Route Health</h3>
                  </div>
                  <Gauge className="h-5 w-5 text-emerald-300" />
                </div>

                <div className="space-y-2">
                  {activity.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                        <span className="text-sm font-bold text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3.5 text-white shadow-[0_0_50px_rgba(52,245,198,0.08)]">
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
                  <WalletCards className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black">Wallet-first flow</h3>
                <p className="mt-2 text-sm font-medium leading-5 text-emerald-50/75">
                  Connect once, then use the same workspace to swap, bridge, or manage unified balance operations.
                </p>
              </section>

              <section className="defi-card rounded-lg p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                  <h3 className="text-base font-black text-white">Quick Links</h3>
                </div>
                <div className="grid gap-2">
                  {[
                    ["RPC", "https://rpc.testnet.arc.network"],
                    ["ArcScan", "https://testnet.arcscan.app"],
                    ["Faucet", "https://faucet.circle.com"],
                  ].map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="defi-focus flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm font-extrabold text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                    >
                      {label}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </section>

              <section className="defi-card rounded-lg p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-amber-300" />
                  <h3 className="text-base font-black text-white">Settlement</h3>
                </div>
                <div className="space-y-2 text-sm font-medium leading-5 text-slate-400">
                  <p>Arc Testnet uses USDC as native gas for transaction execution.</p>
                  <p>Bridge operations mint native assets on the destination chain through Circle infrastructure.</p>
                </div>
              </section>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
