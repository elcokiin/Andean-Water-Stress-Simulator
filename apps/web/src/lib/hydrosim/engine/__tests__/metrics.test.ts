import { describe, expect, it } from "vitest";

import { cityProfiles } from "../city-profiles";
import { buildDisplayMetrics, formatM3PerSecond, formatMcm } from "../metrics";
import { createInitialState, run, step } from "../model";

const baseParams = {
  oni: 0,
  rainMm: 85,
  runoffCoefficient: 0.48,
  fireProbability: 0,
  demandLpcd: cityProfiles.tunja.perCapitaDemandLpcd,
  industrialDemandMcmMonth: cityProfiles.tunja.industrialDemandMcmMonth,
  agriculturalDemandMcmMonth: cityProfiles.tunja.agriculturalDemandMcmMonth,
  efficiencyPct: 62,
  evaporationFactor: 1,
  birthRateAnnual: cityProfiles.tunja.birthRateAnnual,
  migrationRateAnnual: cityProfiles.tunja.migrationRateAnnual,
  rationingActive: false,
} as const;

describe("metrics: buildDisplayMetrics", () => {
  it("reports the initial state without a previous delta", () => {
    const state = createInitialState(cityProfiles.tunja, "baseline");
    const metrics = buildDisplayMetrics(state, null, cityProfiles.tunja);
    expect(metrics.reservoirPct).toBe(68);
    expect(metrics.reservoirPctDelta).toBe(0);
    expect(metrics.month).toBe(0);
    expect(metrics.pnrTriggered).toBe(false);
    expect(metrics.collapse).toBe(false);
  });

  it("reports a negative delta after a step that loses water", () => {
    const start = createInitialState(cityProfiles.tunja, "moderate");
    const next = step(start, { ...baseParams, oni: 1.4 }, cityProfiles.tunja);
    const metrics = buildDisplayMetrics(next, start, cityProfiles.tunja);
    expect(metrics.reservoirPctDelta).toBeLessThan(0);
  });

  it("reflects a positive net balance when rain exceeds demand", () => {
    const state = createInitialState(cityProfiles.tunja, "baseline");
    const next = step(
      state,
      { ...baseParams, rainMm: 250 },
      cityProfiles.tunja,
    );
    const metrics = buildDisplayMetrics(next, state, cityProfiles.tunja);
    expect(metrics.netBalanceMcmPerMonth).toBeGreaterThan(0);
  });

  it("returns monthsToPnr as null when reserves are healthy", () => {
    const state = createInitialState(cityProfiles.tunja, "baseline");
    const metrics = buildDisplayMetrics(state, null, cityProfiles.tunja);
    expect(metrics.monthsToPnr).toBeNull();
  });

  it("returns monthsToPnr as 0 when PNR is already triggered", () => {
    const state = createInitialState(cityProfiles.tunja, "extreme");
    state.pnrTriggered = true;
    const metrics = buildDisplayMetrics(state, null, cityProfiles.tunja);
    expect(metrics.monthsToPnr).toBe(0);
  });

  it("tracks population growth across a short run", () => {
    const history = run(
      createInitialState(cityProfiles.tunja, "baseline"),
      baseParams,
      cityProfiles.tunja,
      12,
    );
    const last = history.at(-1);
    const metrics = buildDisplayMetrics(
      last ?? history[0]!,
      null,
      cityProfiles.tunja,
    );
    expect(metrics.population).toBeGreaterThan(cityProfiles.tunja.population);
  });

  it("reports separated demand and fire-event metrics", () => {
    const state = createInitialState(cityProfiles.tunja, "baseline");
    const next = step(
      state,
      { ...baseParams, fireProbability: 1 },
      cityProfiles.tunja,
    );
    const metrics = buildDisplayMetrics(next, state, cityProfiles.tunja);
    expect(metrics.domesticDemandMcmPerMonth).toBeGreaterThan(0);
    expect(metrics.industrialDemandMcmPerMonth).toBeGreaterThan(0);
    expect(metrics.agriculturalDemandMcmPerMonth).toBeGreaterThan(0);
    expect(metrics.totalDemandMcmPerMonth).toBeGreaterThan(
      metrics.domesticDemandMcmPerMonth,
    );
    expect(metrics.fireProbabilityPct).toBe(100);
    expect(metrics.fireImpactPct).toBeGreaterThan(0);
    expect(metrics.fireReservoirLossMcm).toBeGreaterThan(0);
    expect(metrics.fireParamoLossPct).toBeGreaterThan(0);
  });
});

describe("metrics: formatters", () => {
  it("formats MCM with one decimal when |x| >= 1", () => {
    expect(formatMcm(0.5)).toBe("0.50");
    expect(formatMcm(1.234)).toBe("1.2");
    expect(formatMcm(-2.5)).toBe("-2.5");
  });

  it("formats m3/s with sensible precision", () => {
    expect(formatM3PerSecond(0.5)).toBe("0.50");
    expect(formatM3PerSecond(15.42)).toBe("15.4");
  });
});
