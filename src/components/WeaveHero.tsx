"use client";

import { useSimulation } from "@/lib/simulation-context";

const farmY = [64, 140, 216];
const clientY = [40, 108, 176, 244];

export default function WeaveHero() {
  const { farms, clients, totalGenerationMw, totalAllocatedMw } = useSimulation();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <svg viewBox="0 0 720 288" className="h-auto w-full" role="img" aria-label="Live diagram of solar farms matching to corporate clients">
        {/* connecting weave lines */}
        {farms.map((f, fi) =>
          clients.map((c, ci) => {
            const active = f.currentGenerationMw > 0.3 && c.currentAllocatedMw > 0.05;
            return (
              <path
                key={`${f.id}-${c.id}`}
                d={`M 150 ${farmY[fi]} C 320 ${farmY[fi]}, 320 ${clientY[ci]}, 560 ${clientY[ci]}`}
                fill="none"
                stroke={active ? "#2DD4C8" : "#1A2231"}
                strokeWidth={active ? 1.4 : 1}
                className={active ? "weave-line" : ""}
                opacity={active ? 0.85 : 0.4}
              />
            );
          })
        )}

        {/* farm nodes */}
        {farms.map((f, fi) => {
          const pct = f.capacityMw > 0 ? f.currentGenerationMw / f.capacityMw : 0;
          return (
            <g key={f.id} transform={`translate(70, ${farmY[fi]})`}>
              <circle r={22} fill="#171E2C" stroke="#F5A623" strokeWidth={1.5} opacity={0.9} />
              <circle r={22} fill="none" stroke="#F5A623" strokeWidth={3} strokeDasharray={`${pct * 138} 138`} strokeLinecap="round" transform="rotate(-90)" />
              <text textAnchor="middle" dy={4} className="font-mono-num" fontSize={10} fill="#F5A623">
                {f.currentGenerationMw.toFixed(1)}
              </text>
              <text textAnchor="middle" dy={40} fontSize={10.5} fill="#7C8CAA" className="font-sans">
                {f.name.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          );
        })}

        {/* matching engine node */}
        <g transform="translate(355, 144)">
          <circle r={30} fill="#10151F" stroke="#2DD4C8" strokeWidth={1.5} />
          <circle r={30} className="pulse-glow" fill="none" stroke="#2DD4C8" strokeWidth={1} opacity={0.5} />
          <text textAnchor="middle" dy={-2} fontSize={9.5} fill="#EAF0FA" fontWeight={600}>
            MATCHING
          </text>
          <text textAnchor="middle" dy={10} fontSize={9.5} fill="#EAF0FA" fontWeight={600}>
            ENGINE
          </text>
        </g>

        {/* client nodes */}
        {clients.map((c, ci) => {
          const pct = Math.min(1, c.offsetPct / 100);
          return (
            <g key={c.id} transform={`translate(600, ${clientY[ci]})`}>
              <circle r={19} fill="#171E2C" stroke="#2DD4C8" strokeWidth={1.5} opacity={0.9} />
              <circle r={19} fill="none" stroke="#2DD4C8" strokeWidth={3} strokeDasharray={`${pct * 119} 119`} strokeLinecap="round" transform="rotate(-90)" />
              <text textAnchor="middle" dy={4} className="font-mono-num" fontSize={9.5} fill="#2DD4C8">
                {c.offsetPct.toFixed(0)}%
              </text>
              <text textAnchor="start" x={28} dy={4} fontSize={10.5} fill="#7C8CAA">
                {c.name.length > 22 ? c.name.slice(0, 20) + "…" : c.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-between border-t border-border-soft px-5 py-3 text-[12px]">
        <span className="text-text-muted">
          Pool generation <span className="font-mono-num text-solar">{totalGenerationMw.toFixed(1)} MW</span>
        </span>
        <span className="text-text-muted">
          Matched to demand <span className="font-mono-num text-grid">{totalAllocatedMw.toFixed(1)} MW</span>
        </span>
      </div>
    </div>
  );
}