import { Client } from "./types";

export interface MatchInput {
  clientId: string;
  contractedMw: number;
  consumptionMw: number;
  priority: number;
}

export interface MatchResult {
  clientId: string;
  allocatedMw: number;
  offsetPct: number; // allocatedMw / consumptionMw
}

export interface MatchSummary {
  results: MatchResult[];
  totalGenerationMw: number;
  totalAllocatedMw: number;
  curtailedMw: number; // generation that found no home this tick
}

/**
 * Allocates a shared pool of solar generation across contracted clients.
 * Rules (mirrors the "AI matching / optimization" module in the concept doc):
 *  1. A client can never be allocated more than it is currently consuming
 *     (can't offset power you didn't draw) or more than its VPPA contract cap.
 *  2. Priority clients (e.g. hospitals) are served first, then remaining
 *     pool is split proportionally to contract size among the rest.
 */
export function matchGeneration(
  totalGenerationMw: number,
  clients: MatchInput[]
): MatchSummary {
  let pool = totalGenerationMw;
  const results: MatchResult[] = [];
  const sorted = [...clients].sort((a, b) => a.priority - b.priority);

  // Pass 1: serve by priority, each capped at min(contract, consumption)
  const caps = new Map(
    sorted.map((c) => [c.clientId, Math.min(c.contractedMw, c.consumptionMw)])
  );

  for (const c of sorted) {
    const cap = caps.get(c.clientId) ?? 0;
    const give = Math.min(cap, pool);
    results.push({ clientId: c.clientId, allocatedMw: give, offsetPct: 0 });
    pool -= give;
    if (pool <= 0) break;
  }

  // Any clients not yet reached (pool ran out) get zero
  for (const c of sorted) {
    if (!results.find((r) => r.clientId === c.clientId)) {
      results.push({ clientId: c.clientId, allocatedMw: 0, offsetPct: 0 });
    }
  }

  // compute offset %
  const byId = new Map(clients.map((c) => [c.clientId, c]));
  for (const r of results) {
    const c = byId.get(r.clientId);
    r.offsetPct = c && c.consumptionMw > 0 ? (r.allocatedMw / c.consumptionMw) * 100 : 0;
  }

  const totalAllocatedMw = results.reduce((s, r) => s + r.allocatedMw, 0);

  return {
    results,
    totalGenerationMw,
    totalAllocatedMw,
    curtailedMw: Math.max(0, totalGenerationMw - totalAllocatedMw),
  };
}

export function priorityLabel(client: Pick<Client, "priority">): string {
  if (client.priority === 0) return "Critical load";
  if (client.priority === 1) return "High priority";
  if (client.priority === 2) return "Standard";
  return "Flexible";
}