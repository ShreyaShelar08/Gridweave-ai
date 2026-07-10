"use client";

import { useState } from "react";
import { useSimulation } from "@/lib/simulation-context";
import StatCard from "@/components/StatCard";
import LiveChart from "@/components/LiveChart";

const severityColor: Record<string, string> = {
  info: "text-grid border-grid/40",
  warning: "text-solar border-solar/40",
  critical: "text-danger border-danger/40",
};

export default function FarmDashboard() {
  const { farms, anomalies } = useSimulation();
  const [selectedId, setSelectedId] = useState(farms[0]?.id);
  const farm = farms.find((f) => f.id === selectedId) ?? farms[0];

  if (!farm) return null;

  const utilizationDisplay = Number.isFinite(farm.utilizationPct) ? farm.utilizationPct : 0;

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-solar">
            Farm Operator Dashboard
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
            {farm.name}
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            {farm.type} · {farm.location} · Capacity {farm.capacityMw} MW
          </p>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
        >
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {farm.alert && (
        <div className="mt-5 rounded-lg border border-solar/40 bg-solar/10 px-4 py-2.5 text-[13px] text-solar">
          {farm.alert}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Live output"
          value={farm.currentGenerationMw.toFixed(2)}
          unit="MW"
          accent="solar"
        />
        <StatCard
          label="Capacity"
          value={farm.capacityMw.toFixed(1)}
          unit="MW"
          accent="neutral"
        />
        <StatCard
          label="Matched utilization"
          value={utilizationDisplay.toFixed(0)}
          unit="%"
          accent={utilizationDisplay > 70 ? "success" : "solar"}
        />
        <StatCard
          label="Today's payout"
          value={`₹${farm.todayPayoutINR.toFixed(0)}`}
          sub={`@ ₹${farm.payoutRatePerKwh.toFixed(2)}/kWh matched`}
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border-soft bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold">
              Generation output
            </h2>
            <span className="text-[11px] text-text-muted">
              Weather factor{" "}
              <span className="font-mono-num text-text">
                {(farm.weatherFactor * 100).toFixed(0)}%
              </span>
            </span>
          </div>
          <div className="mt-3">
            <LiveChart
              series={[{ data: farm.history, color: "#F5A623", name: "Generation" }]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-surface p-5">
          <h2 className="font-display text-[15px] font-semibold">
            System anomaly feed
          </h2>
          <p className="mt-1 text-[12px] text-text-muted">
            Auto-flagged by the AI monitoring layer across all farms and clients.
          </p>
          <div className="mt-4 scrollbar-thin max-h-[280px] space-y-2 overflow-y-auto pr-1">
            {anomalies.length === 0 && (
              <p className="text-[12.5px] text-text-dim">No anomalies detected yet.</p>
            )}
            {[...anomalies].reverse().map((a) => (
              <div
                key={a.id}
                className={`rounded-lg border bg-surface-raised px-3 py-2 text-[12.5px] ${severityColor[a.severity]}`}
              >
                <div className="flex items-center justify-between text-[10.5px] text-text-dim">
                  <span>{a.entity}</span>
                  <span className="font-mono-num">{a.label}</span>
                </div>
                <p className="mt-1 text-text-muted">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border-soft bg-surface p-5">
        <h2 className="font-display text-[15px] font-semibold">All farms — fleet snapshot</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-soft text-text-dim">
                <th className="pb-2 font-medium">Farm</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Output</th>
                <th className="pb-2 font-medium">Utilization</th>
                <th className="pb-2 font-medium">Payout today</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((f) => (
                <tr key={f.id} className="border-b border-border-soft/60 last:border-0">
                  <td className="py-2.5">{f.name}</td>
                  <td className="py-2.5 text-text-muted">{f.type}</td>
                  <td className="py-2.5 font-mono-num text-solar">
                    {f.currentGenerationMw.toFixed(2)} / {f.capacityMw} MW
                  </td>
                  <td className="py-2.5 font-mono-num">
                    {Number.isFinite(f.utilizationPct) ? f.utilizationPct.toFixed(0) : 0}%
                  </td>
                  <td className="py-2.5 font-mono-num text-success">
                    ₹{f.todayPayoutINR.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}