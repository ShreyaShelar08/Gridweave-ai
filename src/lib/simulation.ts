import { Farm, Client } from "./types";

export const SIM_START_MINUTE = 5 * 60; // simulation starts at 05:00
export const MINUTES_PER_TICK = 6; // each tick advances simulated clock by 6 minutes
export const TICK_MS = 1800; // real-world ms between ticks

export const FARMS: Farm[] = [
  {
    id: "farm-nashik-1",
    name: "Nashik Ridge Solar",
    location: "Nashik, MH",
    type: "Ground-mount",
    capacityMw: 8.5,
    weatherFactor: 0.9,
    payoutRatePerKwh: 2.85,
  },
  {
    id: "farm-ahmednagar-1",
    name: "Ahmednagar Agrivoltaic Farm",
    location: "Ahmednagar, MH",
    type: "Agrivoltaic",
    capacityMw: 4.2,
    weatherFactor: 0.85,
    payoutRatePerKwh: 2.95,
  },
  {
    id: "farm-solapur-1",
    name: "Solapur Open-Access Array",
    location: "Solapur, MH",
    type: "Open Access",
    capacityMw: 12,
    weatherFactor: 0.95,
    payoutRatePerKwh: 2.7,
  },
];

export const CLIENTS: Client[] = [
  {
    id: "client-vantage-mfg",
    name: "Vantage Auto Components",
    sector: "Manufacturing",
    contractedMw: 6,
    baseLoadMw: 2.4,
    peakLoadMw: 7.5,
    tariffRatePerKwh: 9.8,
    offsetRatePerKwh: 6.4,
    priority: 1,
  },
  {
    id: "client-orbit-it",
    name: "Orbit IT Park",
    sector: "IT Park",
    contractedMw: 4.5,
    baseLoadMw: 3.2,
    peakLoadMw: 5.4,
    tariffRatePerKwh: 10.4,
    offsetRatePerKwh: 6.6,
    priority: 2,
  },
  {
    id: "client-lakeside-hosp",
    name: "Lakeside Multispecialty Hospital",
    sector: "Hospital",
    contractedMw: 2.2,
    baseLoadMw: 1.8,
    peakLoadMw: 2.6,
    tariffRatePerKwh: 9.2,
    offsetRatePerKwh: 6.2,
    priority: 0, // hospitals served first
  },
  {
    id: "client-sapkal-college",
    name: "LGNSC Engineering Campus",
    sector: "College Campus",
    contractedMw: 1.4,
    baseLoadMw: 0.5,
    peakLoadMw: 1.6,
    tariffRatePerKwh: 8.6,
    offsetRatePerKwh: 6.0,
    priority: 3,
  },
];

export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.82; // India grid average

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function minuteToLabel(minute: number): string {
  const m = ((minute % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Bell-shaped solar irradiance curve, sunrise ~06:00, sunset ~18:30, peak at solar noon.
 * Returns 0..1
 */
export function irradianceFactor(minuteOfDay: number): number {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  const sunrise = 6 * 60;
  const sunset = 18.5 * 60;
  if (m <= sunrise || m >= sunset) return 0;
  const solarNoon = (sunrise + sunset) / 2;
  const halfWindow = (sunset - sunrise) / 2;
  const x = (m - solarNoon) / halfWindow; // -1..1
  const base = Math.cos((x * Math.PI) / 2); // bell curve, 0 at edges, 1 at noon
  return clamp(base, 0, 1) ** 1.3;
}

/** Random-walk weather multiplier that drifts slowly, simulating passing cloud cover */
export function stepWeather(current: number, rng: () => number = Math.random): number {
  const drift = (rng() - 0.5) * 0.06;
  return clamp(current + drift, 0.35, 1.0);
}

export function farmGenerationMw(
  capacityMw: number,
  minuteOfDay: number,
  weatherFactor: number,
  rng: () => number = Math.random
): number {
  const irr = irradianceFactor(minuteOfDay);
  const noise = 1 + (rng() - 0.5) * 0.04;
  return clamp(capacityMw * irr * weatherFactor * noise, 0, capacityMw);
}

/**
 * Load curve per client sector: base load + daytime bump shaped by sector.
 * Manufacturing/IT/College peak during working hours; hospital stays near-flat;
 * data centers implied within IT-like flat-heavy profile.
 */
export function clientConsumptionMw(
  client: Pick<Client, "sector" | "baseLoadMw" | "peakLoadMw">,
  minuteOfDay: number,
  rng: () => number = Math.random
): number {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  const hour = m / 60;
  const { baseLoadMw, peakLoadMw, sector } = client;
  const span = peakLoadMw - baseLoadMw;
  let shape = 0;

  switch (sector) {
    case "Hospital":
      // near-constant load, gentle daytime bump
      shape = 0.75 + 0.25 * Math.max(0, Math.cos(((hour - 13) / 12) * Math.PI));
      break;
    case "Manufacturing":
      // two shifts: 8-16 and 16-24, dips overnight
      shape =
        hour >= 7.5 && hour <= 22.5
          ? 0.55 + 0.45 * Math.max(0, Math.cos(((hour - 14) / 15) * Math.PI))
          : 0.25;
      break;
    case "IT Park":
    case "Data Center":
      // servers run ~flat, small business-hours bump
      shape = 0.7 + 0.3 * Math.max(0, Math.cos(((hour - 14) / 14) * Math.PI));
      break;
    case "College Campus":
      // active 8-17, quiet nights
      shape = hour >= 8 && hour <= 17 ? 0.6 + 0.4 * Math.max(0, Math.cos(((hour - 12.5) / 9) * Math.PI)) : 0.15;
      break;
    default:
      shape = 0.6;
  }

  const noise = 1 + (rng() - 0.5) * 0.05;
  return clamp((baseLoadMw + span * shape) * noise, baseLoadMw * 0.5, peakLoadMw * 1.05);
}