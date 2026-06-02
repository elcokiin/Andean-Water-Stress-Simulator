import { describe, expect, it } from "vitest";

import { snapshot } from "../model";
import {
  clearHistoryBuffer,
  createEmptyHistory,
  HISTORY_CAPACITY,
  pushHistory,
  snapshotToEntry,
  toSimState,
} from "../history";
import { createInitialState } from "../model";
import { cityProfiles } from "../city-profiles";
import { step } from "../model";

const tunja = cityProfiles.tunja;

const baseParams = {
  oni: 0,
  rainMm: 85,
  runoffCoefficient: 0.48,
  demandLpcd: tunja.perCapitaDemandLpcd,
  industrialDemandMcmMonth: tunja.industrialDemandMcmMonth,
  agriculturalDemandMcmMonth: tunja.agriculturalDemandMcmMonth,
  efficiencyPct: 62,
  evaporationFactor: 1,
  birthRateAnnual: tunja.birthRateAnnual,
  migrationRateAnnual: tunja.migrationRateAnnual,
  rationingActive: false,
};

function seed(scenario: "baseline" | "moderate" | "extreme", months: number) {
  let state = createInitialState(tunja, scenario);
  for (let i = 0; i < months; i += 1) {
    state = step(state, baseParams, tunja);
  }
  return state;
}

describe("history: createEmptyHistory", () => {
  it("returns a map with empty buffers for every scenario", () => {
    const map = createEmptyHistory();
    expect(map.baseline).toEqual([]);
    expect(map.moderate).toEqual([]);
    expect(map.extreme).toEqual([]);
  });
});

describe("history: pushHistory", () => {
  it("appends entries when below capacity", () => {
    const start = snapshot(seed("baseline", 3));
    const one = pushHistory([], start);
    expect(one).toHaveLength(1);
    expect(one[0]?.month).toBe(3);
    const two = pushHistory(one, snapshot(seed("baseline", 4)));
    expect(two).toHaveLength(2);
    expect(two[1]?.month).toBe(4);
  });

  it("drops the oldest entry once at capacity", () => {
    let buffer: ReturnType<typeof pushHistory> = [];
    for (let i = 0; i < HISTORY_CAPACITY; i += 1) {
      buffer = pushHistory(buffer, snapshot(seed("baseline", i + 1)));
    }
    expect(buffer).toHaveLength(HISTORY_CAPACITY);
    const before = buffer[0]?.month;
    buffer = pushHistory(
      buffer,
      snapshot(seed("baseline", HISTORY_CAPACITY + 5)),
    );
    expect(buffer).toHaveLength(HISTORY_CAPACITY);
    expect(buffer[0]?.month).toBe((before ?? 0) + 1);
  });

  it("honors a custom capacity argument", () => {
    let buffer: ReturnType<typeof pushHistory> = [];
    for (let i = 0; i < 5; i += 1) {
      buffer = pushHistory(buffer, snapshot(seed("baseline", i + 1)), 3);
    }
    expect(buffer).toHaveLength(3);
    expect(buffer.map((b) => b.month)).toEqual([3, 4, 5]);
  });

  it("does not mutate the input buffer", () => {
    const original: ReturnType<typeof pushHistory> = [];
    const next = pushHistory(original, snapshot(seed("baseline", 1)));
    expect(original).toHaveLength(0);
    expect(next).toHaveLength(1);
  });
});

describe("history: clearHistoryBuffer", () => {
  it("returns an empty buffer regardless of input", () => {
    const state = snapshot(seed("baseline", 5));
    const result = clearHistoryBuffer();
    expect(result).toEqual([]);
    expect(state.month).toBe(5);
  });
});

describe("history: toSimState / snapshotToEntry", () => {
  it("round-trips a state through snapshot and back", () => {
    const state = seed("moderate", 12);
    const entry = snapshotToEntry(state);
    expect(entry.month).toBe(state.month);
    expect(entry.reservoirPct).toBe(state.reservoirPct);
    expect(entry.date.year).toBe(2025);
    expect(entry.date.month).toBe(1);
    const back = toSimState(entry);
    expect(back).toEqual(state);
    expect((back as unknown as { date?: unknown }).date).toBeUndefined();
  });
});
