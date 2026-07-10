export type FarmType = "Ground-mount" | "Agrivoltaic" | "Open Access";

export interface Farm {
  id: string;
  name: string;
  location: string;
  type: FarmType;
  capacityMw: number;
  /** slow-moving 0..1 weather multiplier, evolves via random walk */
  weatherFactor: number;
  payoutRatePerKwh: number; // INR paid to farm operator per kWh matched
  signedAt?: string;
}

export type ClientSector =
  | "Manufacturing"
  | "IT Park"
  | "Hospital"
  | "College Campus"
  | "Data Center";

export interface Client {
  id: string;
  name: string;
  sector: ClientSector;
  contractedMw: number; // VPPA contracted capacity
  baseLoadMw: number;
  peakLoadMw: number;
  tariffRatePerKwh: number; // what they currently pay the grid, INR
  offsetRatePerKwh: number; // VPPA settlement rate, INR (cheaper)
  priority: number; // matching priority, lower = served first
  signedAt?: string; // ISO timestamp, set when onboarded via the contract flow
}

export interface NewClientInput {
  name: string;
  sector: ClientSector;
  contractedMw: number;
  baseLoadMw: number;
  peakLoadMw: number;
  tariffRatePerKwh: number;
  offsetRatePerKwh: number;
  priority: number;
}

export interface NewFarmInput {
  name: string;
  location: string;
  type: FarmType;
  capacityMw: number;
  payoutRatePerKwh: number;
}

export interface HistoryPoint {
  t: number; // simulated minute-of-day
  label: string; // HH:MM
  value: number;
}

export interface FarmTick {
  farmId: string;
  generationMw: number;
}

export interface ClientTick {
  clientId: string;
  consumptionMw: number;
  allocatedMw: number;
}

export interface FarmRuntime extends Farm {
  currentGenerationMw: number;
  history: HistoryPoint[]; // generation history
  utilizationPct: number; // % of generation matched vs curtailed, rolling
  todayPayoutINR: number;
  alert: string | null;
}

export interface ClientRuntime extends Client {
  currentConsumptionMw: number;
  currentAllocatedMw: number;
  generationHistory: HistoryPoint[];
  consumptionHistory: HistoryPoint[];
  offsetPct: number; // current tick offset %
  todayConsumptionKwh: number;
  todayOffsetKwh: number;
  todaySavingsINR: number;
  todayGridBillINR: number;
  todayOffsetBillINR: number;
  carbonOffsetKg: number;
}

export interface AnomalyEvent {
  id: string;
  t: number;
  label: string;
  entity: string;
  severity: "info" | "warning" | "critical";
  message: string;
}