"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSimulation } from "@/lib/simulation-context";

const links = [
  { href: "/", label: "Overview" },
  { href: "/client", label: "Client Dashboard" },
  { href: "/farm", label: "Farm Operator" },
  { href: "/contracts", label: "Contracts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { clockLabel, running, toggleRunning } = useSimulation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-solar/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-solar pulse-glow" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            GridWeave <span className="text-grid">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border-soft bg-surface/60 p-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ease-out ${
                  active
                    ? "scale-105 bg-grid/15 text-grid shadow-[0_0_14px_-3px_rgba(45,212,200,0.6)]"
                    : "text-text-muted hover:scale-[1.03] hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleRunning}
            className="flex items-center gap-2 rounded-full border border-border-soft bg-surface/60 px-3 py-1.5 text-[12px] text-text-muted transition-colors hover:text-text"
            title={running ? "Pause simulated telemetry" : "Resume simulated telemetry"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                running ? "bg-success" : "bg-text-dim"
              }`}
            />
            <span className="font-mono-num tabular-nums">{clockLabel}</span>
            <span className="hidden text-text-dim md:inline">
              {running ? "live" : "paused"}
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-surface/60 text-text-muted sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M0 1H15" stroke="currentColor" strokeWidth="1.4" />
              <path d="M0 5.5H15" stroke="currentColor" strokeWidth="1.4" />
              <path d="M0 10H15" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border-soft bg-bg px-6 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3.5 py-2 text-[14px] font-medium transition-all duration-200 ease-out ${
                    active
                      ? "scale-[1.02] bg-grid/15 text-grid shadow-[0_0_14px_-3px_rgba(45,212,200,0.55)]"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}