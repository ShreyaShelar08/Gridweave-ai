import { ClientRuntime } from "./types";

/**
 * Generates a plain-English "why did my bill drop" summary from live
 * billing + matching numbers.
 *
 * This is a deterministic template rather than a live LLM call, so the
 * MVP demo runs with zero API keys and zero backend. In the production
 * architecture (see concept doc §7/§4) this function's output shape is
 * exactly what would be handed to Gemini / GitHub Models as grounding
 * data, with a prompt like "explain these numbers to a non-technical
 * facilities manager" — swap the return statement for that API call
 * and nothing else in the UI needs to change.
 */
export function generateClientReport(client: ClientRuntime): string {
  const savingsPct =
    client.todayGridBillINR > 0
      ? (client.todaySavingsINR / client.todayGridBillINR) * 100
      : 0;
  const offsetSharePct =
    client.todayConsumptionKwh > 0
      ? (client.todayOffsetKwh / client.todayConsumptionKwh) * 100
      : 0;

  const trees = Math.round(client.carbonOffsetKg / 21); // ~21kg CO2/tree/yr equivalent, illustrative

  const lines: string[] = [];

  lines.push(
    `${client.name}'s bill is tracking ${savingsPct.toFixed(1)}% lower today because ${offsetSharePct.toFixed(
      0
    )}% of your electricity was sourced from matched solar farms instead of the grid.`
  );

  lines.push(
    `GridWeave matched ${client.todayOffsetKwh.toFixed(0)} kWh of your ${client.todayConsumptionKwh.toFixed(
      0
    )} kWh consumption so far today against your ${client.contractedMw} MW VPPA contract, settled at ₹${client.offsetRatePerKwh.toFixed(
      2
    )}/kWh versus your ₹${client.tariffRatePerKwh.toFixed(2)}/kWh grid tariff.`
  );

  if (client.currentAllocatedMw < client.currentConsumptionMw * 0.3) {
    lines.push(
      `Right now allocation is thin (${client.offsetPct.toFixed(
        0
      )}% of live demand) — likely lower irradiance or contended demand across the pool. Offset typically recovers as solar output rises through midday.`
    );
  } else if (client.offsetPct > 85) {
    lines.push(
      `Right now you're being matched at ${client.offsetPct.toFixed(
        0
      )}% of live demand — close to full contract utilization for this hour.`
    );
  }

  lines.push(
    `Cumulative impact today: ₹${client.todaySavingsINR.toFixed(
      0
    )} saved, ${client.carbonOffsetKg.toFixed(0)} kg CO₂ offset — roughly equivalent to ${trees} tree-years of carbon capture.`
  );

  return lines.join(" ");
}