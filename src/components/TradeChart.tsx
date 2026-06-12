"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3 } from "lucide-react";

type TradeChartProps = {
  title: string;
  pair: string;
  value: number;
  suffix?: string;
  mode?: "price" | "pool";
  compact?: boolean;
};

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const POINTS = 42;
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h"] as const;

function clampNumber(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createTicks(baseValue: number, mode: "price" | "pool"): Candle[] {
  const base = clampNumber(baseValue, mode === "pool" ? 100 : 1);
  let previousClose = base;

  return Array.from({ length: POINTS }, (_, index) => {
    const wave = Math.sin(index * 0.72) * 0.012;
    const pulse = Math.cos(index * 0.31) * 0.007;
    const drift = (index - POINTS / 2) * (mode === "pool" ? 0.0009 : 0.0005);
    const close = base * (1 + wave + pulse + drift);
    const open = previousClose;
    const spread = base * (0.0038 + Math.abs(Math.sin(index * 0.41)) * 0.006);
    const high = Math.max(open, close) + spread;
    const low = Math.max(0, Math.min(open, close) - spread * 0.82);

    previousClose = close;

    return {
      open,
      high,
      low,
      close,
      volume: 34 + Math.abs(Math.sin(index * 0.9)) * 52 + (index % 5) * 4,
    };
  });
}

function formatValue(value: number, suffix: string) {
  if (!Number.isFinite(value)) {
    return suffix ? `0.00 ${suffix}` : "0.00";
  }

  const decimals = value >= 1000 ? 2 : value >= 1 ? 4 : 8;
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: value >= 1 ? 2 : 4,
  })}${suffix ? ` ${suffix}` : ""}`;
}

export function TradeChart({
  title,
  pair,
  value,
  suffix = "",
  mode = "price",
  compact = false,
}: TradeChartProps) {
  const [ticks, setTicks] = useState(() => createTicks(value, mode));
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("1m");

  useEffect(() => {
    const id = window.setInterval(() => {
      setTicks((current) => {
        const previous = current.at(-1)?.close ?? clampNumber(value, 1);
        const wobble = Math.sin(Date.now() / 1400) * 0.0018 + (Math.random() - 0.5) * 0.0038;
        const anchor = clampNumber(value, previous);
        const close = previous * 0.72 + anchor * 0.28 * (1 + wobble);
        const spread = anchor * (0.003 + Math.random() * 0.007);
        const nextVolume = 36 + Math.random() * 66;

        return [
          ...current.slice(1),
          {
            open: previous,
            high: Math.max(previous, close) + spread,
            low: Math.max(0, Math.min(previous, close) - spread * 0.75),
            close,
            volume: nextVolume,
          },
        ];
      });
    }, 2200);

    return () => window.clearInterval(id);
  }, [value]);

  const chart = useMemo(() => {
    const width = 760;
    const height = compact ? 218 : 390;
    const padLeft = 12;
    const padRight = 78;
    const padTop = 16;
    const padBottom = 74;
    const prices = ticks.flatMap((tick) => [tick.high, tick.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;
    const step = plotWidth / ticks.length;
    const candleWidth = Math.max(5, step * 0.56);
    const yFor = (price: number) => padTop + (1 - (price - min) / range) * plotHeight;
    const last = ticks.at(-1)?.close ?? value;
    const first = ticks[0]?.open ?? last;
    const change = first ? ((last - first) / first) * 100 : 0;
    const volumeMax = Math.max(...ticks.map((tick) => tick.volume), 1);
    const levels = Array.from({ length: 5 }, (_, index) => {
      const price = min + (range / 4) * index;
      return {
        price,
        y: yFor(price),
      };
    }).reverse();

    const candles = ticks.map((tick, index) => {
      const x = padLeft + index * step + step / 2;
      const openY = yFor(tick.open);
      const closeY = yFor(tick.close);
      const highY = yFor(tick.high);
      const lowY = yFor(tick.low);
      const up = tick.close >= tick.open;

      return {
        ...tick,
        x,
        openY,
        closeY,
        highY,
        lowY,
        up,
        bodyY: Math.min(openY, closeY),
        bodyHeight: Math.max(2, Math.abs(openY - closeY)),
        volumeHeight: Math.max(7, (tick.volume / volumeMax) * 46),
      };
    });

    return { width, height, padLeft, padRight, padTop, padBottom, plotWidth, plotHeight, candleWidth, levels, candles, last, change };
  }, [compact, ticks, value]);

  const isUp = chart.change >= 0;
  const latest = ticks.at(-1);
  const high = Math.max(...ticks.map((tick) => tick.high));
  const low = Math.min(...ticks.map((tick) => tick.low));
  const volume = ticks.reduce((total, tick) => total + tick.volume, 0);

  return (
    <section className="rounded-lg border border-emerald-300/20 bg-slate-950/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-200/70">
            <Activity className="h-3.5 w-3.5" />
            {title}
          </p>
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <h3 className="text-lg font-black text-white">{pair}</h3>
            <p className="font-mono text-base font-black text-white">{formatValue(chart.last, suffix)}</p>
            <p className={`pb-0.5 text-sm font-black ${isUp ? "text-emerald-300" : "text-rose-300"}`}>
              {isUp ? "+" : ""}{chart.change.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-slate-950/70 p-1">
          {TIMEFRAMES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTimeframe(item)}
              className={`defi-focus h-8 cursor-pointer rounded-md px-2.5 text-xs font-black transition ${
                timeframe === item
                  ? "bg-emerald-300 text-slate-950"
                  : "text-slate-500 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          ["Open", latest ? formatValue(latest.open, suffix) : "0"],
          ["High", formatValue(high, suffix)],
          ["Low", formatValue(low, suffix)],
          ["Volume", volume.toFixed(0)],
        ].map(([label, item]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-2">
            <p className="font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 truncate font-mono font-black text-slate-100">{item}</p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(52,245,198,0.055),rgba(255,255,255,0.012))]">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className={compact ? "h-[238px] w-full" : "h-[420px] w-full"}
          role="img"
          aria-label={`${pair} realtime DEX candlestick chart`}
          preserveAspectRatio="none"
        >
          {chart.levels.map((level) => (
            <g key={level.price}>
              <line
                x1={chart.padLeft}
                x2={chart.width - chart.padRight + 4}
                y1={level.y}
                y2={level.y}
                stroke="rgba(255,255,255,0.075)"
                strokeDasharray="5 7"
              />
              <text x={chart.width - chart.padRight + 12} y={level.y + 4} fill="rgba(148,163,184,0.88)" fontSize="11" fontFamily="monospace">
                {formatValue(level.price, "").replace(/\.?0+$/, "")}
              </text>
            </g>
          ))}

          {chart.candles.map((tick, index) => {
            const color = tick.up ? "#34f5c6" : "#fda4af";
            const volumeY = chart.height - chart.padBottom + 54 - tick.volumeHeight;

            return (
              <g key={`${tick.x}-${index}`}>
                <line x1={tick.x} x2={tick.x} y1={tick.highY} y2={tick.lowY} stroke={color} strokeWidth="1.4" />
                <rect
                  x={tick.x - chart.candleWidth / 2}
                  y={tick.bodyY}
                  width={chart.candleWidth}
                  height={tick.bodyHeight}
                  rx="1.5"
                  fill={tick.up ? "rgba(52,245,198,0.95)" : "rgba(253,164,175,0.95)"}
                />
                <rect
                  x={tick.x - chart.candleWidth / 2}
                  y={volumeY}
                  width={chart.candleWidth}
                  height={tick.volumeHeight}
                  rx="1.5"
                  fill={tick.up ? "rgba(52,245,198,0.22)" : "rgba(253,164,175,0.22)"}
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 font-mono text-[11px] font-bold text-slate-400">
          ARC DEX · {timeframe}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Live ticks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          1m simulated depth
        </span>
      </div>
    </section>
  );
}
