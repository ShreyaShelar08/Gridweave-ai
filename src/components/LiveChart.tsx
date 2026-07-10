"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HistoryPoint } from "@/lib/types";

interface Series {
  data: HistoryPoint[];
  color: string;
  name: string;
}

interface LiveChartProps {
  series: Series[];
  height?: number;
  unit?: string;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border-soft bg-surface-raised px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1 font-mono-num text-text-dim">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono-num" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value} {unit}
        </p>
      ))}
    </div>
  );
}

export default function LiveChart({ series, height = 220, unit = "MW" }: LiveChartProps) {
  const labels = series[0]?.data.map((d) => d.label) ?? [];

  if (labels.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-soft text-center"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-dim" />
        <p className="text-[12.5px] text-text-dim">Waiting for telemetry — first reading in a few seconds</p>
      </div>
    );
  }

  const merged = labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    series.forEach((s) => {
      row[s.name] = s.data[i]?.value ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={merged} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.name} id={`grad-${s.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="#1A2231" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#4C596F"
          tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
          tickLine={false}
          axisLine={{ stroke: "#232C3D" }}
          minTickGap={30}
        />
        <YAxis
          stroke="#4C596F"
          tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        {series.map((s) => (
          <Area
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.name})`}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}