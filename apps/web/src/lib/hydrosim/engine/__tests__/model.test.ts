import { describe, expect, it } from "vitest";

import { cityProfiles, getCityProfile } from "../city-profiles";
import {
  createInitialState,
  run,
  SCENARIO_INITIAL_RESERVOIR,
  step,
} from "../model";
import {
  PNR_THRESHOLD_PCT,
  RATIONING_REDUCTION,
  RATIONING_THRESHOLD_PCT,
  type SimParams,
} from "../types";

const TUNJA = cityProfiles.tunja;

const baselineParams = (): SimParams => ({
  oni: 0,
  rainMm: 85,
  runoffCoefficient: 0.48,
  demandLpcd: TUNJA.perCapitaDemandLpcd,
  industrialDemandMcmMonth: TUNJA.industrialDemandMcmMonth,
  agriculturalDemandMcmMonth: TUNJA.agriculturalDemandMcmMonth,
  efficiencyPct: 62,
  evaporationFactor: 1,
  birthRateAnnual: TUNJA.birthRateAnnual,
  migrationRateAnnual: TUNJA.migrationRateAnnual,
  rationingActive: false,
});

describe("simulation engine: createInitialState", () => {
  it("starts each scenario at its declared reservoir percentage", () => {
    expect(createInitialState(TUNJA, "baseline").reservoirPct).toBe(
      SCENARIO_INITIAL_RESERVOIR.baseline,
    );
    expect(createInitialState(TUNJA, "moderate").reservoirPct).toBe(
      SCENARIO_INITIAL_RESERVOIR.moderate,
    );
    expect(createInitialState(TUNJA, "extreme").reservoirPct).toBe(
      SCENARIO_INITIAL_RESERVOIR.extreme,
    );
  });

  it("initializes healthy aquifer and paramo stocks", () => {
    const state = createInitialState(TUNJA, "baseline");
    expect(state.aquiferLevel).toBeGreaterThan(0.5);
    expect(state.paramoCoverage).toBeGreaterThan(0.7);
    expect(state.pnrTriggered).toBe(false);
    expect(state.collapse).toBe(false);
    expect(state.consecutivePnrMonths).toBe(0);
  });
});

describe("simulation engine: scenario calibration", () => {
  it("baseline is approximately stable over 5 years (5y/60 months)", () => {
    const history = run(
      createInitialState(TUNJA, "baseline"),
      baselineParams(),
      TUNJA,
      60,
    );
    const initial = history[0]?.reservoirPct ?? 0;
    const final = history.at(-1)?.reservoirPct ?? 0;
    expect(final).toBeGreaterThan(initial - 8);
    expect(final).toBeLessThan(initial + 4);
  });

  it("moderate Nino drifts the reservoir downward over 5 years", () => {
    const history = run(
      createInitialState(TUNJA, "baseline"),
      { ...baselineParams(), oni: 1.4 },
      TUNJA,
      60,
    );
    const final = history.at(-1)?.reservoirPct ?? 0;
    expect(final).toBeLessThan(SCENARIO_INITIAL_RESERVOIR.baseline - 5);
  });

  it("extreme Nino crashes through PNR and triggers collapse", () => {
    const history = run(
      createInitialState(TUNJA, "baseline"),
      { ...baselineParams(), oni: 2.6 },
      TUNJA,
      60,
    );
    const final = history.at(-1);
    expect(final).toBeDefined();
    expect(final?.reservoirPct).toBeLessThanOrEqual(PNR_THRESHOLD_PCT);
    expect(final?.collapse).toBe(true);
  });
});

describe("simulation engine: PNR and rationing loops", () => {
  it("PNR is triggered after two consecutive months below the threshold", () => {
    let state = createInitialState(TUNJA, "extreme");
    state = { ...state, reservoirPct: 14, consecutivePnrMonths: 1 };
    const next = step(state, baselineParams(), TUNJA);
    expect(next.consecutivePnrMonths).toBe(2);
    expect(next.pnrTriggered).toBe(true);
  });

  it("PNR counter resets when reserves climb back above the threshold", () => {
    const state = createInitialState(TUNJA, "baseline");
    const after = step(state, baselineParams(), TUNJA);
    expect(after.consecutivePnrMonths).toBe(0);
    expect(after.pnrTriggered).toBe(false);
  });

  it("rationing reduces extraction when reserves are below threshold", () => {
    const state = createInitialState(TUNJA, "extreme");
    const withoutRationing = step(
      state,
      { ...baselineParams(), rationingActive: false },
      TUNJA,
    );
    const withRationing = step(
      state,
      { ...baselineParams(), rationingActive: true },
      TUNJA,
    );
    expect(withRationing.flows.extraction).toBeLessThan(
      withoutRationing.flows.extraction,
    );
    const ratio =
      withRationing.flows.extraction / withoutRationing.flows.extraction;
    expect(ratio).toBeCloseTo(1 - RATIONING_REDUCTION, 5);
  });

  it("rationing has no effect when reserves are above the threshold", () => {
    const state = createInitialState(TUNJA, "baseline");
    const without = step(
      state,
      { ...baselineParams(), rationingActive: false },
      TUNJA,
    );
    const withR = step(
      state,
      { ...baselineParams(), rationingActive: true },
      TUNJA,
    );
    expect(withR.flows.extraction).toBeCloseTo(without.flows.extraction, 5);
    expect(withR.reservoirPct).toBeCloseTo(without.reservoirPct, 5);
  });

  it("rationing threshold is respected", () => {
    expect(RATIONING_THRESHOLD_PCT).toBe(20);
  });
});

describe("simulation engine: stocks evolution", () => {
  it("paramo coverage degrades under stress", () => {
    const start = createInitialState(TUNJA, "baseline");
    const baselineRun = run(start, baselineParams(), TUNJA, 60);
    const stressedRun = run(start, { ...baselineParams(), oni: 2 }, TUNJA, 60);
    const baselineFinal = baselineRun.at(-1)?.paramoCoverage ?? 1;
    const stressedFinal = stressedRun.at(-1)?.paramoCoverage ?? 1;
    expect(stressedFinal).toBeLessThan(baselineFinal);
  });

  it("aquifer level changes between scenarios", () => {
    const start = createInitialState(TUNJA, "baseline");
    const baselineFinal =
      run(start, baselineParams(), TUNJA, 60).at(-1)?.aquiferLevel ?? 0;
    const stressedFinal =
      run(start, { ...baselineParams(), oni: 2 }, TUNJA, 60).at(-1)
        ?.aquiferLevel ?? 0;
    expect(baselineFinal).not.toBe(stressedFinal);
  });

  it("population grows monotonically under the configured growth rate", () => {
    const history = run(
      createInitialState(TUNJA, "baseline"),
      baselineParams(),
      TUNJA,
      24,
    );
    for (let index = 1; index < history.length; index += 1) {
      const previous = history[index - 1];
      const current = history[index];
      if (!previous || !current) continue;
      expect(current.population).toBeGreaterThan(previous.population);
    }
  });
});

describe("simulation engine: parameters influence flows", () => {
  it("higher ONI reduces inflow via the rain factor", () => {
    const state = createInitialState(TUNJA, "baseline");
    const neutral = step(state, baselineParams(), TUNJA);
    const ninio = step(state, { ...baselineParams(), oni: 2 }, TUNJA);
    expect(ninio.flows.inflow).toBeLessThan(neutral.flows.inflow);
  });

  it("higher per-capita demand increases extraction", () => {
    const state = createInitialState(TUNJA, "baseline");
    const low = step(state, { ...baselineParams(), demandLpcd: 100 }, TUNJA);
    const high = step(state, { ...baselineParams(), demandLpcd: 200 }, TUNJA);
    expect(high.flows.extraction).toBeGreaterThan(low.flows.extraction);
  });

  it("higher sector demands increase total demand and extraction", () => {
    const state = createInitialState(TUNJA, "baseline");
    const low = step(
      state,
      {
        ...baselineParams(),
        industrialDemandMcmMonth: 0.1,
        agriculturalDemandMcmMonth: 0.1,
      },
      TUNJA,
    );
    const high = step(
      state,
      {
        ...baselineParams(),
        industrialDemandMcmMonth: 0.8,
        agriculturalDemandMcmMonth: 0.6,
      },
      TUNJA,
    );
    expect(high.flows.totalDemand).toBeGreaterThan(low.flows.totalDemand);
    expect(high.flows.extraction).toBeGreaterThan(low.flows.extraction);
  });

  it("lower efficiency inflates gross extraction to compensate for losses", () => {
    const state = createInitialState(TUNJA, "baseline");
    const efficient = step(
      state,
      { ...baselineParams(), efficiencyPct: 90 },
      TUNJA,
    );
    const leaky = step(
      state,
      { ...baselineParams(), efficiencyPct: 50 },
      TUNJA,
    );
    expect(leaky.flows.extraction).toBeGreaterThan(efficient.flows.extraction);
  });

  it("higher rainfall increases inflow and recharge", () => {
    const state = createInitialState(TUNJA, "baseline");
    const dry = step(state, { ...baselineParams(), rainMm: 40 }, TUNJA);
    const wet = step(state, { ...baselineParams(), rainMm: 180 }, TUNJA);
    expect(wet.flows.inflow).toBeGreaterThan(dry.flows.inflow);
    expect(wet.flows.recharge).toBeGreaterThan(dry.flows.recharge);
  });

  it("higher runoff coefficient increases inflow without changing recharge", () => {
    const state = createInitialState(TUNJA, "baseline");
    const low = step(
      state,
      { ...baselineParams(), runoffCoefficient: 0.2 },
      TUNJA,
    );
    const high = step(
      state,
      { ...baselineParams(), runoffCoefficient: 0.8 },
      TUNJA,
    );
    expect(high.flows.inflow).toBeGreaterThan(low.flows.inflow);
    expect(high.flows.recharge).toBeCloseTo(low.flows.recharge, 5);
  });

  it("higher evaporation factor increases evaporative loss", () => {
    const state = createInitialState(TUNJA, "baseline");
    const low = step(
      state,
      { ...baselineParams(), evaporationFactor: 0.5 },
      TUNJA,
    );
    const high = step(
      state,
      { ...baselineParams(), evaporationFactor: 1.8 },
      TUNJA,
    );
    expect(high.flows.evaporation).toBeGreaterThan(low.flows.evaporation);
  });

  it("birth and migration rates control population growth", () => {
    const state = createInitialState(TUNJA, "baseline");
    const shrinking = step(
      state,
      {
        ...baselineParams(),
        birthRateAnnual: 0,
        migrationRateAnnual: -0.01,
      },
      TUNJA,
    );
    const growing = step(
      state,
      {
        ...baselineParams(),
        birthRateAnnual: 0.02,
        migrationRateAnnual: 0.01,
      },
      TUNJA,
    );
    expect(growing.population).toBeGreaterThan(state.population);
    expect(shrinking.population).toBeLessThan(state.population);
  });
});

describe("simulation engine: city profiles", () => {
  it("exposes the three documented cities", () => {
    expect(Object.keys(cityProfiles).sort()).toEqual(
      ["duitama", "sogamoso", "tunja"].sort(),
    );
  });

  it("uses per-city per-capita demand and growth rates from the docs", () => {
    expect(cityProfiles.tunja.perCapitaDemandLpcd).toBe(148);
    expect(cityProfiles.duitama.perCapitaDemandLpcd).toBe(132);
    expect(cityProfiles.sogamoso.perCapitaDemandLpcd).toBe(140);
    expect(cityProfiles.tunja.growthRateAnnual).toBeCloseTo(0.014, 5);
    expect(cityProfiles.duitama.growthRateAnnual).toBeCloseTo(0.011, 5);
    expect(cityProfiles.sogamoso.growthRateAnnual).toBeCloseTo(0.009, 5);
  });

  it("getCityProfile returns the matching profile by id", () => {
    expect(getCityProfile("duitama")).toBe(cityProfiles.duitama);
  });
});

describe("simulation engine: numeric guards", () => {
  it("never lets reservoir exceed 0-100 bounds", () => {
    const history = run(
      createInitialState(TUNJA, "extreme"),
      { ...baselineParams(), rainMm: 300, oni: -3, rationingActive: true },
      TUNJA,
      60,
    );
    for (const state of history) {
      expect(state.reservoirPct).toBeGreaterThanOrEqual(0);
      expect(state.reservoirPct).toBeLessThanOrEqual(100);
      expect(state.aquiferLevel).toBeGreaterThanOrEqual(0);
      expect(state.aquiferLevel).toBeLessThanOrEqual(1);
      expect(state.paramoCoverage).toBeGreaterThanOrEqual(0);
      expect(state.paramoCoverage).toBeLessThanOrEqual(1);
    }
  });

  it("reaching collapse halts the simulation (state stops changing)", () => {
    const history = run(
      createInitialState(TUNJA, "extreme"),
      { ...baselineParams(), oni: 2.6 },
      TUNJA,
      120,
    );
    const collapseIndex = history.findIndex((entry) => entry.collapse);
    expect(collapseIndex).toBeGreaterThan(0);
    const last = history.at(-1);
    const previous = history.at(collapseIndex - 1);
    expect(last).toBeDefined();
    expect(previous).toBeDefined();
    expect(last?.month).toBe((previous?.month ?? 0) + 1);
    const lastAfter = step(
      last as ReturnType<typeof createInitialState>,
      { ...baselineParams(), oni: 2.6 },
      TUNJA,
    );
    expect(lastAfter).toBe(last);
  });
});
