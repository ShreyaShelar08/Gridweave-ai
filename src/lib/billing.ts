import { GRID_EMISSION_FACTOR_KG_PER_KWH, MINUTES_PER_TICK } from "./simulation";

export interface TickBillingInput {
  consumptionMw: number;
  allocatedMw: number;
  tariffRatePerKwh: number;
  offsetRatePerKwh: number;
}

export interface TickBillingResult {
  consumptionKwh: number;
  offsetKwh: number;
  gridCostINR: number; // what the full consumption would have cost at grid tariff
  offsetCostINR: number; // what the offset portion costs at the VPPA rate
  savingsINR: number; // gridCost - (offsetCost + remaining grid cost)
  carbonOffsetKg: number;
}

const hoursPerTick = MINUTES_PER_TICK / 60;

/** Computes the automated billing delta for a single simulated tick. */
export function computeTickBilling(input: TickBillingInput): TickBillingResult {
  const { consumptionMw, allocatedMw, tariffRatePerKwh, offsetRatePerKwh } = input;
  const consumptionKwh = consumptionMw * 1000 * hoursPerTick;
  const offsetKwh = Math.min(allocatedMw, consumptionMw) * 1000 * hoursPerTick;
  const remainingGridKwh = Math.max(0, consumptionKwh - offsetKwh);

  const gridCostINR = consumptionKwh * tariffRatePerKwh;
  const offsetCostINR = offsetKwh * offsetRatePerKwh;
  const remainingGridCostINR = remainingGridKwh * tariffRatePerKwh;
  const newBillINR = offsetCostINR + remainingGridCostINR;
  const savingsINR = gridCostINR - newBillINR;

  return {
    consumptionKwh,
    offsetKwh,
    gridCostINR,
    offsetCostINR: newBillINR,
    savingsINR,
    carbonOffsetKg: offsetKwh * GRID_EMISSION_FACTOR_KG_PER_KWH,
  };
}