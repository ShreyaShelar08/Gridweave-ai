"use client";

import { useState } from "react";
import { ClientSector, NewClientInput } from "@/lib/types";

const sectors: ClientSector[] = [
  "Manufacturing",
  "IT Park",
  "Hospital",
  "College Campus",
  "Data Center",
];

const priorities = [
  { value: 0, label: "Critical load (served first)" },
  { value: 1, label: "High priority" },
  { value: 2, label: "Standard" },
  { value: 3, label: "Flexible" },
];

interface Props {
  onSubmit: (input: NewClientInput) => void;
  onCancel: () => void;
}

const emptyState = {
  name: "",
  sector: "Manufacturing" as ClientSector,
  contractedMw: "",
  baseLoadMw: "",
  peakLoadMw: "",
  tariffRatePerKwh: "",
  offsetRatePerKwh: "",
  priority: 2,
};

export default function ClientOnboardForm({ onSubmit, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyState);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validateStep1(): string | null {
    if (!form.name.trim()) return "Client name is required.";
    return null;
  }

  function validateStep2(): string | null {
    const contractedMw = parseFloat(form.contractedMw);
    const baseLoadMw = parseFloat(form.baseLoadMw);
    const peakLoadMw = parseFloat(form.peakLoadMw);
    const tariff = parseFloat(form.tariffRatePerKwh);
    const offset = parseFloat(form.offsetRatePerKwh);
    if (!(contractedMw > 0)) return "Contracted MW must be greater than 0.";
    if (!(baseLoadMw > 0)) return "Base load must be greater than 0.";
    if (!(peakLoadMw >= baseLoadMw)) return "Peak load must be at least base load.";
    if (!(tariff > 0)) return "Grid tariff rate must be greater than 0.";
    if (!(offset > 0)) return "Offset settlement rate must be greater than 0.";
    if (offset >= tariff) return "Offset rate should be lower than the grid tariff to generate savings.";
    return null;
  }

  function next() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    setError(err);
    if (err) return;
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function sign() {
    const input: NewClientInput = {
      name: form.name.trim(),
      sector: form.sector,
      contractedMw: parseFloat(form.contractedMw),
      baseLoadMw: parseFloat(form.baseLoadMw),
      peakLoadMw: parseFloat(form.peakLoadMw),
      tariffRatePerKwh: parseFloat(form.tariffRatePerKwh),
      offsetRatePerKwh: parseFloat(form.offsetRatePerKwh),
      priority: form.priority,
    };
    onSubmit(input);
  }

  return (
    <div className="rounded-xl border border-grid/30 bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full font-mono-num text-[10px] ${
                s <= step ? "bg-grid text-bg" : "border border-border-soft text-text-dim"
              }`}
            >
              {s}
            </span>
            {s < 3 && <span className="h-px w-8 bg-border-soft" />}
          </div>
        ))}
        <span className="ml-3 text-[12px] text-text-muted">
          {step === 1 ? "Client details" : step === 2 ? "Load & contract terms" : "Review & sign"}
        </span>
      </div>

      <div className="mt-5">
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Client name
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kalpana Textiles"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Sector
              <select
                value={form.sector}
                onChange={(e) => set("sector", e.target.value as ClientSector)}
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Contracted capacity (MW)
              <input
                type="number"
                step="0.1"
                value={form.contractedMw}
                onChange={(e) => set("contractedMw", e.target.value)}
                placeholder="3.0"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Priority
              <select
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Base load (MW)
              <input
                type="number"
                step="0.1"
                value={form.baseLoadMw}
                onChange={(e) => set("baseLoadMw", e.target.value)}
                placeholder="1.2"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Peak load (MW)
              <input
                type="number"
                step="0.1"
                value={form.peakLoadMw}
                onChange={(e) => set("peakLoadMw", e.target.value)}
                placeholder="3.6"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Current grid tariff (₹/kWh)
              <input
                type="number"
                step="0.1"
                value={form.tariffRatePerKwh}
                onChange={(e) => set("tariffRatePerKwh", e.target.value)}
                placeholder="9.5"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              VPPA settlement rate (₹/kWh)
              <input
                type="number"
                step="0.1"
                value={form.offsetRatePerKwh}
                onChange={(e) => set("offsetRatePerKwh", e.target.value)}
                placeholder="6.3"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-grid/60"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-lg border border-border-soft bg-surface px-4 py-3.5 text-[13px]">
            <p className="font-display text-[14px] font-semibold">{form.name}</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-text-muted">
              <dt>Sector</dt>
              <dd className="text-right text-text">{form.sector}</dd>
              <dt>Contracted</dt>
              <dd className="text-right font-mono-num text-text">{form.contractedMw} MW</dd>
              <dt>Load range</dt>
              <dd className="text-right font-mono-num text-text">
                {form.baseLoadMw}–{form.peakLoadMw} MW
              </dd>
              <dt>Grid tariff</dt>
              <dd className="text-right font-mono-num text-text">₹{form.tariffRatePerKwh}/kWh</dd>
              <dt>Settlement rate</dt>
              <dd className="text-right font-mono-num text-grid">₹{form.offsetRatePerKwh}/kWh</dd>
              <dt>Priority</dt>
              <dd className="text-right text-text">
                {priorities.find((p) => p.value === form.priority)?.label}
              </dd>
            </dl>
          </div>
        )}

        {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}

        <div className="mt-4 flex justify-between">
          <button
            onClick={step === 1 ? onCancel : back}
            className="rounded-full border border-border-soft px-4 py-2 text-[12.5px] text-text-muted transition-colors hover:text-text"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              onClick={next}
              className="rounded-full bg-grid px-4 py-2 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={sign}
              className="rounded-full bg-grid px-5 py-2 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-90"
            >
              Sign VPPA & activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}