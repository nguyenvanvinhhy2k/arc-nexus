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
  Wifi,
} from "lucide-react";

type TabId = "swap" | "bridge" | "gateway" | "lend" | "pool" | "borrow" | "docs";

const tabConfig = {
  swap: {
    label: "Swap",
    eyebrow: "Market order",
    title: "Token exchange desk",
    description: "Quote and execute Arc-native USDC, EURC, and cirBTC routes from a focused trading workspace.",
    icon: ArrowLeftRight,
    accentClass: "nav-icon-active",
    headerGradient: "from-cyan-400/20 to-blue-500/10",
    pillColor: "bg-cyan-400/15 text-cyan-300 border-cyan-400/20",
  },
  bridge: {
    label: "Bridge",
    eyebrow: "CCTP route",
    title: "Cross-chain transfer lane",
    description: "Move stablecoins between Arc, Ethereum Sepolia, and Base Sepolia with route and fee context nearby.",
    icon: ArrowUpRight,
    accentClass: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]",
    headerGradient: "from-violet-500/20 to-purple-600/10",
    pillColor: "bg-violet-400/15 text-violet-300 border-violet-400/20",
  },
  gateway: {
    label: "Gateway",
    eyebrow: "Unified balance",
    title: "Liquidity command center",
    description: "Deposit once, then spend USDC through Circle Gateway across supported destinations.",
    icon: Layers,
    accentClass: "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-[0_0_20px_rgba(232,121,249,0.4)]",
    headerGradient: "from-fuchsia-500/20 to-pink-500/10",
    pillColor: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/20",
  },
  lend: {
    label: "Lend",
    eyebrow: "Supply APY",
    title: "Lending supply market",
    description: "Review Arc testnet money markets, compare utilization, and prepare wallet-first supply actions.",
    icon: PiggyBank,
    accentClass: "bg-gradient-to-br from-green-400 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(74,222,128,0.3)]",
    headerGradient: "from-green-400/20 to-emerald-500/10",
    pillColor: "bg-green-400/15 text-green-300 border-green-400/20",
  },
  pool: {
    label: "Pool",
    eyebrow: "LP routes",
    title: "Liquidity pool explorer",
    description: "Compare trading pairs, fee tiers, TVL, and estimated APR before adding balanced liquidity.",
    icon: PackageOpen,
    accentClass: "bg-gradient-to-br from-sky-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]",
    headerGradient: "from-sky-400/20 to-blue-500/10",
    pillColor: "bg-sky-400/15 text-sky-300 border-sky-400/20",
  },
  borrow: {
    label: "Borrow",
    eyebrow: "Collateral",
    title: "Borrow risk workspace",
    description: "Inspect available liquidity, borrow APR, collateral limits, and health-factor guardrails.",
    icon: HandCoins,
    accentClass: "bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-[0_0_20px_rgba(251,113,133,0.35)]",
    headerGradient: "from-rose-400/20 to-red-500/10",
    pillColor: "bg-rose-400/15 text-rose-300 border-rose-400/20",
  },
  docs: {
    label: "Docs",
    eyebrow: "Protocol guide",
    title: "Lend Pool Borrow Docs",
    description: "A compact product guide for lending, pooling, borrowing, risk notes, and future contract integration.",
    icon: BookOpen,
    accentClass: "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.3)]",
    headerGradient: "from-amber-400/20 to-orange-500/10",
    pillColor: "bg-amber-400/15 text-amber-300 border-amber-400/20",
  },
} satisfies Record<TabId, {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  headerGradient: string;
  pillColor: string;
}>;

const metrics = [
  { label: "Native gas", value: "USDC", icon: BadgeDollarSign, color: "text-amber-300" },
  { label: "Chains", value: "3", icon: RadioTower, color: "text-cyan-300" },
  { label: "Mode", value: "Testnet", icon: ShieldCheck, color: "text-violet-300" },
];

const activity = [
  { label: "Arc RPC", value: "Online", dotClass: "status-dot-online", valueClass: "text-green-400" },
  { label: "CCTP lane", value: "Ready", dotClass: "status-dot-ready", valueClass: "text-cyan-400" },
  { label: "Gateway", value: "Standby", dotClass: "status-dot-standby", valueClass: "text-fuchsia-400" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("swap");
  const active = tabConfig[activeTab];
  const ActiveIcon = active.icon;

  return (
    <div className="defi-shell min-h-[100dvh] overflow-hidden text-slate-50 lg:h-screen">

      {/* ── SPACE CANVAS ── */}
      <div className="space-canvas" aria-hidden="true">
        <div className="stars-layer" />
        <div className="stars-layer-2" />
        <div className="nebula-left" />
        <div className="nebula-right" />
        <div className="nebula-bottom" />
        <div className="cosmos-grid" />
        <div className="shooting-star" />
        <div className="shooting-star-2" />
      </div>

      {/* ── 3D ORBITAL SYSTEM (desktop only) ── */}
      <div className="orbital-system hidden lg:block" aria-hidden="true">
        <div className="orbit-ring">
          <div className="orbit-dot" />
        </div>
        <div className="orbit-ring-2" />
        <div className="orbit-ring-3" />
      </div>
      <div className="cosmos-crystal hidden lg:block" aria-hidden="true" />

      {/* ── MAIN GRID ── */}
      <div className="relative z-10 grid min-h-[100dvh] lg:h-screen lg:min-h-0 lg:grid-cols-[260px_1fr]">

        {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
        <aside className="sidebar-panel border-b border-white/[0.08] px-4 py-4 lg:m-3 lg:h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:rounded-xl lg:border">

          {/* Brand */}
          <div className="flex items-center justify-between gap-4 lg:block">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-slate-950/80 shadow-[0_0_24px_rgba(0,229,255,0.2)]">
                {/* Glowing ring behind logo */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-violet-600/10" />
                <Image
                  src="/arc-nexus-logo.svg"
                  alt="Arc Nexus"
                  width={24}
                  height={24}
                  className="relative rounded"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white tracking-tight">Arc Nexus</p>
                <p className="text-[11px] font-semibold text-cyan-300/60 tracking-wide">DeFi execution layer</p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:mt-6 lg:block">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                      id={`nav-${tab}`}
                      onClick={() => setActiveTab(tab)}
                      className={`defi-focus group relative flex w-full cursor-pointer items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all duration-200 ${
                        isActive
                          ? "nav-item-active text-white"
                          : "border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      {isActive && (
                        <span className="nav-item-active-dot absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full" />
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                          isActive
                            ? item.accentClass
                            : "bg-white/[0.05] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{item.label}</span>
                        <span className={`block text-[11px] truncate ${isActive ? "text-cyan-200/60" : "text-slate-600"}`}>
                          {item.eyebrow}
                        </span>
                      </span>
                      <ChevronRight
                        className={`ml-auto h-3.5 w-3.5 shrink-0 transition-all ${
                          isActive
                            ? "translate-x-0 text-cyan-300"
                            : "-translate-x-1 text-slate-700 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Metric tiles */}
          <div className="mt-5 grid grid-cols-3 gap-2 lg:grid-cols-1">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="metric-tile rounded-xl p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{metric.label}</span>
                    <Icon className={`h-3.5 w-3.5 ${metric.color}`} />
                  </div>
                  <p className="text-base font-black tracking-tight text-white">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ══════════════════════════════════════
            MAIN CONTENT AREA
        ══════════════════════════════════════ */}
        <div className="flex min-h-0 min-w-0 flex-col">

          {/* Header */}
          <header className="cosmos-header sticky top-0 z-40 lg:mr-3 lg:mt-3 lg:rounded-xl">
            <div className="flex min-h-14 flex-col justify-between gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:px-5 lg:px-5">
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <div className="relative flex h-2 w-2 items-center justify-center">
                    <span className="absolute h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300/70">
                    Live testnet workspace
                  </span>
                </div>
                <h1 className="text-base font-black tracking-tight text-white sm:text-lg">
                  Arc Nexus Command Center
                </h1>
              </div>
              <WalletConnect />
            </div>

            {/* Mobile tab scroll */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5 lg:hidden">
              {(Object.keys(tabConfig) as TabId[]).map((tab) => {
                const item = tabConfig[tab];
                const Icon = item.icon;
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    id={`mobile-tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`defi-focus flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "tab-active-cosmic border-transparent"
                        : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/15 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          {/* ── MAIN WORKSPACE ── */}
          <main className="grid flex-1 gap-3 px-3 py-3 sm:px-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_288px] lg:pr-3">

            {/* Left column: context card + execution panel */}
            <section className="flex min-h-0 min-w-0 flex-col">

              {/* Context card */}
              <div className="cosmos-section mb-3 shrink-0 overflow-hidden rounded-xl">
                <div className={`bg-gradient-to-r ${active.headerGradient} px-4 py-0.5`} />
                <div className="grid gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active.accentClass}`}>
                      <ActiveIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-0.5">
                        {active.eyebrow}
                      </p>
                      <h2 className="text-base font-black tracking-tight text-white sm:text-lg leading-tight">
                        {active.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium leading-5 text-slate-400 max-w-xl">
                        {active.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Fee asset", value: "USDC", cls: "border-amber-400/15 bg-amber-400/8 text-amber-100" },
                      { label: "Slippage", value: "<0.05%", cls: "border-cyan-400/15 bg-cyan-400/8 text-cyan-100" },
                      { label: "Network", value: "Arc", cls: "border-violet-400/15 bg-violet-400/8 text-violet-100" },
                    ].map((pill) => (
                      <div key={pill.label} className={`rounded-lg border px-3 py-2 ${pill.cls}`}>
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{pill.label}</p>
                        <p className="text-sm font-black">{pill.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution panel */}
              <div className="defi-card-strong flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-xl p-3 sm:p-4 lg:min-h-0">
                {/* Window chrome */}
                <div className="mb-3 flex shrink-0 items-center justify-between border-b border-white/[0.07] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3 w-3 text-cyan-400/60" />
                    <p className="text-[10px] font-bold tracking-wider text-slate-600">Execution module</p>
                  </div>
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

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="min-h-0 space-y-3 overflow-y-auto lg:h-full">

              {/* Route Health */}
              <section className="cosmos-section rounded-xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">Status</p>
                    <h3 className="text-sm font-black text-white mt-0.5">Route Health</h3>
                  </div>
                  <Gauge className="h-4 w-4 text-cyan-400" />
                </div>

                <div className="space-y-2">
                  {activity.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                        <span className="text-sm font-semibold text-slate-400">{item.label}</span>
                      </div>
                      <span className={`text-xs font-black ${item.valueClass}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Wallet-first flow */}
              <section className="cosmos-section-highlight rounded-xl p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_16px_rgba(0,229,255,0.35)]">
                  <WalletCards className="h-4 w-4 text-slate-950" />
                </div>
                <h3 className="text-sm font-black text-white">Wallet-first flow</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-400">
                  Connect once, then swap, bridge, or manage unified balance operations across the Arc ecosystem.
                </p>
              </section>

              {/* Quick Links */}
              <section className="cosmos-section rounded-xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-fuchsia-400" />
                  <h3 className="text-sm font-black text-white">Quick Links</h3>
                </div>
                <div className="grid gap-1.5">
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
                      className="defi-focus flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-xs font-bold text-slate-300 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                    >
                      {label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-600" />
                    </a>
                  ))}
                </div>
              </section>

              {/* Settlement */}
              <section className="cosmos-section rounded-xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white">Settlement</h3>
                </div>
                <div className="space-y-2 text-xs font-medium leading-5 text-slate-500">
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
