"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FARMS,
  CLIENTS,
  SIM_START_MINUTE,
  MINUTES_PER_TICK,
  TICK_MS,
  minuteToLabel,
  irradianceFactor,
  stepWeather,
  farmGenerationMw,
  clientConsumptionMw,
} from "./simulation";
import { matchGeneration } from "./matching";
import { computeTickBilling } from "./billing";
import {
  AnomalyEvent,
  ClientRuntime,
  FarmRuntime,
  NewClientInput,
  NewFarmInput,
} from "./types";

const HISTORY_LEN = 40;

interface SimState {
  clockMinute: number;
  farms: FarmRuntime[];
  clients: ClientRuntime[];
  totalGenerationMw: number;
  totalAllocatedMw: number;
  curtailedMw: number;
  anomalies: AnomalyEvent[];
  ticks: number;
}

function initState(): SimState {
  const farms: FarmRuntime[] = FARMS.map((f) => ({
    ...f,
    currentGenerationMw: 0,
    history: [],
    utilizationPct: 0,
    todayPayoutINR: 0,
    alert: null,
  }));
  const clients: ClientRuntime[] = CLIENTS.map((c) => ({
    ...c,
    currentConsumptionMw: 0,
    currentAllocatedMw: 0,
    generationHistory: [],
    consumptionHistory: [],
    offsetPct: 0,
    todayConsumptionKwh: 0,
    todayOffsetKwh: 0,
    todaySavingsINR: 0,
    todayGridBillINR: 0,
    todayOffsetBillINR: 0,
    carbonOffsetKg: 0,
  }));
  return {
    clockMinute: SIM_START_MINUTE,
    farms,
    clients,
    totalGenerationMw: 0,
    totalAllocatedMw: 0,
    curtailedMw: 0,
    anomalies: [],
    ticks: 0,
  };
}

function pushHistory(
  hist: { t: number; label: string; value: number }[],
  t: number,
  label: string,
  value: number
) {
  const next = [...hist, { t, label, value }];
  return next.length > HISTORY_LEN ? next.slice(next.length - HISTORY_LEN) : next;
}

let anomalyCounter = 0;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);
}

function makeClientRuntime(input: NewClientInput): ClientRuntime {
  return {
    id: `client-${slugify(input.name)}-${Date.now()}`,
    ...input,
    signedAt: new Date().toISOString(),
    currentConsumptionMw: 0,
    currentAllocatedMw: 0,
    generationHistory: [],
    consumptionHistory: [],
    offsetPct: 0,
    todayConsumptionKwh: 0,
    todayOffsetKwh: 0,
    todaySavingsINR: 0,
    todayGridBillINR: 0,
    todayOffsetBillINR: 0,
    carbonOffsetKg: 0,
  };
}

function makeFarmRuntime(input: NewFarmInput): FarmRuntime {
  return {
    id: `farm-${slugify(input.name)}-${Date.now()}`,
    ...input,
    weatherFactor: 0.85,
    signedAt: new Date().toISOString(),
    currentGenerationMw: 0,
    history: [],
    utilizationPct: 0,
    todayPayoutINR: 0,
    alert: null,
  };
}

function advance(prev: SimState): SimState {
  const nextMinute = prev.clockMinute + MINUTES_PER_TICK;
  const wrapped = nextMinute % 1440;
  const dayRolled = nextMinute >= 1440;
  const label = minuteToLabel(wrapped);
  const irr = irradianceFactor(wrapped);

  // --- Farms ---
  const farms: FarmRuntime[] = prev.farms.map((f) => {
    const weatherFactor = stepWeather(f.weatherFactor);
    const generationMw = farmGenerationMw(f.capacityMw, wrapped, weatherFactor);
    const history = pushHistory(f.history, wrapped, label, generationMw);

    let alert: string | null = null;
    if (irr > 0.5 && generationMw < f.capacityMw * 0.2) {
      alert = "Output well below expected for current irradiance — possible sensor fault";
    } else if (weatherFactor < 0.5) {
      alert = "Heavy cloud cover reducing output";
    }

    return {
      ...f,
      weatherFactor,
      currentGenerationMw: generationMw,
      history,
      todayPayoutINR: dayRolled ? 0 : f.todayPayoutINR,
      alert,
    };
  });

  const totalGenerationMw = farms.reduce((s, f) => s + f.currentGenerationMw, 0);

  // --- Clients: consumption ---
  const consumptions = prev.clients.map((c) => ({
    clientId: c.id,
    consumptionMw: clientConsumptionMw(c, wrapped),
  }));

  const matchInputs = prev.clients.map((c) => {
    const cons = consumptions.find((x) => x.clientId === c.id)!;
    return {
      clientId: c.id,
      contractedMw: c.contractedMw,
      consumptionMw: cons.consumptionMw,
      priority: c.priority,
    };
  });

  const matchSummary = matchGeneration(totalGenerationMw, matchInputs);

  // --- Farm payout attribution (proportional to each farm's share of the pool) ---
  const hoursPerTick = MINUTES_PER_TICK / 60;
  const farmsWithPayout = farms.map((f) => {
    const share = totalGenerationMw > 0 ? f.currentGenerationMw / totalGenerationMw : 0;
    const matchedMw = share * matchSummary.totalAllocatedMw;
    const payoutDelta = matchedMw * 1000 * hoursPerTick * f.payoutRatePerKwh;
    const utilizationPct =
      f.currentGenerationMw > 0 ? (matchedMw / f.currentGenerationMw) * 100 : 0;
    return {
      ...f,
      todayPayoutINR: f.todayPayoutINR + payoutDelta,
      utilizationPct,
    };
  });

  // --- Clients: allocation + billing ---
  const anomalies = [...prev.anomalies];
  const clients: ClientRuntime[] = prev.clients.map((c) => {
    const cons = consumptions.find((x) => x.clientId === c.id)!.consumptionMw;
    const match = matchSummary.results.find((r) => r.clientId === c.id)!;
    const billing = computeTickBilling({
      consumptionMw: cons,
      allocatedMw: match.allocatedMw,
      tariffRatePerKwh: c.tariffRatePerKwh,
      offsetRatePerKwh: c.offsetRatePerKwh,
    });

    const resetToday = dayRolled;

    if (!resetToday && match.offsetPct < 20 && cons > c.baseLoadMw * 0.5) {
      anomalyCounter += 1;
      anomalies.push({
        id: `a-${anomalyCounter}`,
        t: wrapped,
        label,
        entity: c.name,
        severity: "warning",
        message: `${c.name} offset dropped to ${match.offsetPct.toFixed(
          0
        )}% of live demand — pool may be oversubscribed this hour.`,
      });
    }

    return {
      ...c,
      currentConsumptionMw: cons,
      currentAllocatedMw: match.allocatedMw,
      offsetPct: match.offsetPct,
      generationHistory: pushHistory(c.generationHistory, wrapped, label, match.allocatedMw),
      consumptionHistory: pushHistory(c.consumptionHistory, wrapped, label, cons),
      todayConsumptionKwh: resetToday
        ? billing.consumptionKwh
        : c.todayConsumptionKwh + billing.consumptionKwh,
      todayOffsetKwh: resetToday ? billing.offsetKwh : c.todayOffsetKwh + billing.offsetKwh,
      todaySavingsINR: resetToday ? billing.savingsINR : c.todaySavingsINR + billing.savingsINR,
      todayGridBillINR: resetToday
        ? billing.gridCostINR
        : c.todayGridBillINR + billing.gridCostINR,
      todayOffsetBillINR: resetToday
        ? billing.offsetCostINR
        : c.todayOffsetBillINR + billing.offsetCostINR,
      carbonOffsetKg: resetToday
        ? billing.carbonOffsetKg
        : c.carbonOffsetKg + billing.carbonOffsetKg,
    };
  });

  if (matchSummary.curtailedMw > 1.5) {
    anomalyCounter += 1;
    anomalies.push({
      id: `a-${anomalyCounter}`,
      t: wrapped,
      label,
      entity: "Matching Engine",
      severity: "info",
      message: `${matchSummary.curtailedMw.toFixed(
        1
      )} MW of generation went unmatched this tick — surplus pool capacity available for new demand.`,
    });
  }

  const trimmedAnomalies = anomalies.slice(-8);

  return {
    clockMinute: wrapped,
    farms: farmsWithPayout,
    clients,
    totalGenerationMw,
    totalAllocatedMw: matchSummary.totalAllocatedMw,
    curtailedMw: matchSummary.curtailedMw,
    anomalies: trimmedAnomalies,
    ticks: prev.ticks + 1,
  };
}

interface SimulationContextValue extends SimState {
  clockLabel: string;
  running: boolean;
  toggleRunning: () => void;
  addClient: (input: NewClientInput) => void;
  addFarm: (input: NewFarmInput) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimState>(initState);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    // Seed a bit of initial history so charts aren't empty on first paint
    let seed = initState();
    for (let i = 0; i < 12; i++) {
      seed = advance(seed);
    }
    setState(seed);

    const interval = setInterval(() => {
      if (!runningRef.current) return;
      setState((prev) => advance(prev));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const addClient = (input: NewClientInput) => {
    setState((prev) => ({ ...prev, clients: [...prev.clients, makeClientRuntime(input)] }));
  };

  const addFarm = (input: NewFarmInput) => {
    setState((prev) => ({ ...prev, farms: [...prev.farms, makeFarmRuntime(input)] }));
  };

  const value: SimulationContextValue = {
    ...state,
    clockLabel: minuteToLabel(state.clockMinute),
    running,
    toggleRunning: () => setRunning((r) => !r),
    addClient,
    addFarm,
  };

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}