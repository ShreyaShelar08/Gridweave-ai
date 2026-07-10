"use client";

import { useState } from "react";
import { useSimulation } from "@/lib/simulation-context";
import StatCard from "@/components/StatCard";
import LiveChart from "@/components/LiveChart";
import { generateClientReport } from "@/lib/report";

export default function ClientDashboard() {
  const { clients } = useSimulation();
  const [selectedId, setSelectedId] = useState(clients[0]?.id);
  const client = clients.find((c) => c.id === selectedId) ?? clients[0];

  if (!client) return null;

  const report = generateClientReport(client);
  const savingsPct =
    client.todayGridBillINR > 0
      ? (client.todaySavingsINR / client.todayGridBillINR) * 100
      : 0;

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-grid">
            Client Dashboard
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
            {client.name}
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            {client.sector} · VPPA contracted {client.contractedMw} MW · Priority:{" "}
            {client.priority === 0 ? "Critical load" : client.priority === 1 ? "High" : "Standard"}
          </p>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Live demand"
          value={client.currentConsumptionMw.toFixed(2)}
          unit="MW"
          accent="neutral"
        />
        <StatCard
          label="Live allocation"
          value={client.currentAllocatedMw.toFixed(2)}
          unit="MW"
          accent="grid"
        />
        <StatCard
          label="Offset now"
          value={client.offsetPct.toFixed(0)}
          unit="%"
          accent={client.offsetPct > 50 ? "success" : "solar"}
        />
        <StatCard
          label="Today's savings"
          value={`₹${client.todaySavingsINR.toFixed(0)}`}
          sub={`${savingsPct.toFixed(1)}% below grid-only bill`}
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border-soft bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold">
              Consumption vs. matched allocation
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CAA]" />
                Demand
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-grid" />
                Allocated
              </span>
            </div>
          </div>
          <div className="mt-3">
            <LiveChart
              series={[
                { data: client.consumptionHistory, color: "#7C8CAA", name: "Demand" },
                { data: client.generationHistory, color: "#2DD4C8", name: "Allocated" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-surface p-5">
          <h2 className="font-display text-[15px] font-semibold">
            Billing reconciliation — today
          </h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-muted">Grid-only cost</dt>
              <dd className="font-mono-num">₹{client.todayGridBillINR.toFixed(0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Offset invoice (actual)</dt>
              <dd className="font-mono-num text-grid">
                ₹{client.todayOffsetBillINR.toFixed(0)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border-soft pt-3">
              <dt className="font-medium text-text">Net savings</dt>
              <dd className="font-mono-num font-medium text-success">
                ₹{client.todaySavingsINR.toFixed(0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Energy offset</dt>
              <dd className="font-mono-num">{client.todayOffsetKwh.toFixed(0)} kWh</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Carbon offset</dt>
              <dd className="font-mono-num">{client.carbonOffsetKg.toFixed(0)} kg CO₂</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Settlement rate</dt>
              <dd className="font-mono-num">₹{client.offsetRatePerKwh.toFixed(2)}/kWh</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border-soft bg-surface p-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-solar pulse-glow" />
          <h2 className="font-display text-[15px] font-semibold">
            Why your bill changed
          </h2>
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-text-muted">{report}</p>
      </div>
    </main>
  );
}