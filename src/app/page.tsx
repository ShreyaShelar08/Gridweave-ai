import Link from "next/link";
import WeaveHero from "@/components/WeaveHero";

const modules = [
  {
    n: "Verification",
    title: "AI Monitoring & Verification",
    body: "Ingests real-time inverter and smart-meter telemetry from every farm and produces a tamper-proof, minute-by-minute generation record — the ground truth for billing.",
  },
  {
    n: "Matching",
    title: "Matching Engine",
    body: "Allocates pooled farm output to contracted demand, weighing weather forecasts, consumption patterns, and VPPA terms — priority loads served first, remainder split proportionally.",
  },
  {
    n: "Billing",
    title: "Billing Automation",
    body: "Reconciles matched generation against grid tariffs and each client's actual bill, applying a renewable offset automatically — no manual settlement.",
  },
  {
    n: "Reporting",
    title: "Plain-Language Reporting",
    body: "Turns raw generation and billing data into audit-ready ESG summaries a facilities manager — not an energy analyst — can actually read.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <div className="max-w-2xl">
            <p className="font-mono-num text-[12px] uppercase tracking-[0.14em] text-grid">
              Software-only virtual power marketplace
            </p>
            <h1 className="font-display mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              GridWeave never
              <br />
              owns a panel.
              <br />
              <span className="text-solar">It owns the weave.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-muted">
              Independent solar farms have generation with nowhere automated to go.
              Corporate buyers want clean, predictable power without the capex of
              owning a plant. GridWeave is the matching, verification, and billing
              layer that connects them — settled entirely as a virtual PPA, with
              zero physical infrastructure of its own.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/client"
                className="rounded-full bg-solar px-5 py-2.5 text-[13px] font-medium text-bg transition-opacity hover:opacity-90"
              >
                View client dashboard
              </Link>
              <Link
                href="/farm"
                className="rounded-full border border-border-soft bg-surface px-5 py-2.5 text-[13px] font-medium text-text transition-colors hover:border-grid/60"
              >
                View farm operator view
              </Link>
            </div>
          </div>

          <WeaveHero />
        </div>
      </section>

      <section className="border-t border-border-soft bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="font-display text-xl font-semibold">
            Four modules, one settlement layer
          </h2>
          <p className="mt-2 max-w-xl text-[14px] text-text-muted">
            Everything below runs on simulated live telemetry in this prototype —
            the same shape of pipeline a production deployment would run on real
            inverter and smart-meter feeds.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {modules.map((m) => (
              <div
                key={m.n}
                className="flex h-full flex-col rounded-xl border border-border-soft bg-surface px-5 py-5"
              >
                <span className="font-mono-num text-[11px] text-solar">{m.n}</span>
                <h3 className="font-display mt-2 text-[15px] font-semibold">
                  {m.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="font-display text-xl font-semibold">How a MW moves</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Solar farms connect inverter/smart-meter telemetry and register capacity.",
            "AI verification logs generation minute-by-minute into an auditable record.",
            "C&I clients register consumption and sign a VPPA for contracted MW.",
            "The matching engine allocates available generation across demand each tick.",
            "Billing automation reconciles allocation against tariffs into an offset invoice.",
            "Clients get a dashboard: savings, offset %, and audit-ready ESG proof.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-border-soft bg-surface/60 p-4"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-grid/50 bg-bg font-mono-num text-[10px] text-grid">
                {i + 1}
              </span>
              <span className="text-[13.5px] leading-relaxed text-text-muted">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}