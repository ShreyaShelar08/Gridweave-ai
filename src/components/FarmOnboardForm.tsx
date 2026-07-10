"use client";

import { useState } from "react";
import { FarmType, NewFarmInput } from "@/lib/types";

const types: FarmType[] = ["Ground-mount", "Agrivoltaic", "Open Access"];

interface Props {
  onSubmit: (input: NewFarmInput) => void;
  onCancel: () => void;
}

const emptyState = {
  name: "",
  location: "",
  type: "Ground-mount" as FarmType,
  capacityMw: "",
  payoutRatePerKwh: "",
};

export default function FarmOnboardForm({ onSubmit, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyState);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validateStep1(): string | null {
    if (!form.name.trim()) return "Farm name is required.";
    if (!form.location.trim()) return "Location is required.";
    return null;
  }

  function validateStep2(): string | null {
    const capacityMw = parseFloat(form.capacityMw);
    const payout = parseFloat(form.payoutRatePerKwh);
    if (!(capacityMw > 0)) return "Capacity must be greater than 0.";
    if (!(payout > 0)) return "Payout rate must be greater than 0.";
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
    const input: NewFarmInput = {
      name: form.name.trim(),
      location: form.location.trim(),
      type: form.type,
      capacityMw: parseFloat(form.capacityMw),
      payoutRatePerKwh: parseFloat(form.payoutRatePerKwh),
    };
    onSubmit(input);
  }

  return (
    <div className="rounded-xl border border-solar/30 bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full font-mono-num text-[10px] ${
                s <= step ? "bg-solar text-bg" : "border border-border-soft text-text-dim"
              }`}
            >
              {s}
            </span>
            {s < 3 && <span className="h-px w-8 bg-border-soft" />}
          </div>
        ))}
        <span className="ml-3 text-[12px] text-text-muted">
          {step === 1 ? "Farm details" : step === 2 ? "Capacity & payout" : "Review & connect"}
        </span>
      </div>

      <div className="mt-5">
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Farm name
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Dhule Ridge Solar"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Location
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Dhule, MH"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted sm:col-span-2">
              Farm type
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as FarmType)}
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Capacity (MW)
              <input
                type="number"
                step="0.1"
                value={form.capacityMw}
                onChange={(e) => set("capacityMw", e.target.value)}
                placeholder="5.0"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] text-text-muted">
              Payout rate (₹/kWh matched)
              <input
                type="number"
                step="0.05"
                value={form.payoutRatePerKwh}
                onChange={(e) => set("payoutRatePerKwh", e.target.value)}
                placeholder="2.80"
                className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-solar/60"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-lg border border-border-soft bg-surface px-4 py-3.5 text-[13px]">
            <p className="font-display text-[14px] font-semibold">{form.name}</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-text-muted">
              <dt>Type</dt>
              <dd className="text-right text-text">{form.type}</dd>
              <dt>Location</dt>
              <dd className="text-right text-text">{form.location}</dd>
              <dt>Capacity</dt>
              <dd className="text-right font-mono-num text-text">{form.capacityMw} MW</dd>
              <dt>Payout rate</dt>
              <dd className="text-right font-mono-num text-solar">
                ₹{form.payoutRatePerKwh}/kWh matched
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
              className="rounded-full bg-solar px-4 py-2 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={sign}
              className="rounded-full bg-solar px-5 py-2 text-[12.5px] font-medium text-bg transition-opacity hover:opacity-90"
            >
              Connect telemetry & activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}