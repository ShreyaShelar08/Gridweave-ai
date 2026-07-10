"use client";

import { useState } from "react";
import { useSimulation } from "@/lib/simulation-context";
import ClientOnboardForm from "@/components/ClientOnboardForm";
import FarmOnboardForm from "@/components/FarmOnboardForm";
import { priorityLabel } from "@/lib/matching";

type Tab = "clients" | "farms";

export default function ContractsPage() {
  const { clients, farms, addClient, addFarm } = useSimulation();
  const [tab, setTab] = useState<Tab>("clients");
  const [formOpen, setFormOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  function flashNew(id: string) {
    setJustAddedId(id);
    setTimeout(() => setJustAddedId((cur) => (cur === id ? null : cur)), 2600);
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-10">
      <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-grid">
        Contract Management
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
        VPPAs &amp; supply agreements
      </h1>
      <p className="mt-1.5 max-w-xl text-[13.5px] text-text-muted">
        Every row below is live in the matching pool — onboard a new client or
        farm and it starts being simulated and matched on the next tick.
      </p>

      <div className="mt-6 flex items-center gap-1 rounded-full border border-border-soft bg-surface p-1 w-fit">
        {(["clients", "farms"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setFormOpen(false);
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ease-out ${
              tab === t
                ? "scale-105 bg-grid/15 text-grid shadow-[0_0_14px_-3px_rgba(45,212,200,0.6)]"
                : "text-text-muted hover:scale-[1.03] hover:text-text"
            }`}
          >
            {t === "clients" ? "Corporate Clients" : "Solar Farms"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className={`rounded-full px-4 py-2 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-90 ${
              tab === "clients" ? "bg-grid" : "bg-solar"
            }`}
          >
            {tab === "clients" ? "+ New VPPA" : "+ Onboard farm"}
          </button>
        )}
      </div>

      {formOpen && tab === "clients" && (
        <div className="mt-3">
          <ClientOnboardForm
            onCancel={() => setFormOpen(false)}
            onSubmit={(input) => {
              addClient(input);
              setFormOpen(false);
              flashNew(input.name);
            }}
          />
        </div>
      )}

      {formOpen && tab === "farms" && (
        <div className="mt-3">
          <FarmOnboardForm
            onCancel={() => setFormOpen(false)}
            onSubmit={(input) => {
              addFarm(input);
              setFormOpen(false);
              flashNew(input.name);
            }}
          />
        </div>
      )}

      {tab === "clients" ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border-soft bg-surface">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-soft text-text-dim">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Sector</th>
                <th className="px-5 py-3 font-medium">Contracted</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Tariff</th>
                <th className="px-5 py-3 font-medium">Settlement</th>
                <th className="px-5 py-3 font-medium">Live offset</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-border-soft/60 last:border-0 transition-colors ${
                    justAddedId === c.name ? "bg-grid/10" : ""
                  }`}
                >
                  <td className="px-5 py-3">{c.name}</td>
                  <td className="px-5 py-3 text-text-muted">{c.sector}</td>
                  <td className="px-5 py-3 font-mono-num">{c.contractedMw} MW</td>
                  <td className="px-5 py-3 text-text-muted">{priorityLabel(c)}</td>
                  <td className="px-5 py-3 font-mono-num text-text-muted">
                    ₹{c.tariffRatePerKwh.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 font-mono-num text-grid">
                    ₹{c.offsetRatePerKwh.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 font-mono-num">{c.offsetPct.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border-soft bg-surface">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-soft text-text-dim">
                <th className="px-5 py-3 font-medium">Farm</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Capacity</th>
                <th className="px-5 py-3 font-medium">Payout rate</th>
                <th className="px-5 py-3 font-medium">Live output</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((f) => (
                <tr
                  key={f.id}
                  className={`border-b border-border-soft/60 last:border-0 transition-colors ${
                    justAddedId === f.name ? "bg-solar/10" : ""
                  }`}
                >
                  <td className="px-5 py-3">{f.name}</td>
                  <td className="px-5 py-3 text-text-muted">{f.type}</td>
                  <td className="px-5 py-3 text-text-muted">{f.location}</td>
                  <td className="px-5 py-3 font-mono-num">{f.capacityMw} MW</td>
                  <td className="px-5 py-3 font-mono-num text-solar">
                    ₹{f.payoutRatePerKwh.toFixed(2)}/kWh
                  </td>
                  <td className="px-5 py-3 font-mono-num">
                    {f.currentGenerationMw.toFixed(2)} MW
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}