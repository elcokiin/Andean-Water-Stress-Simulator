import { describe, expect, it } from "vitest";

import {
  getRainIntensity,
  ONI_STRONG_NINA,
  ONI_STRONG_NINO,
  RAIN_HIGH_MM,
  RAIN_LOW_MM,
  RAIN_VERY_HIGH_MM,
} from "../rain-intensity";

describe("getRainIntensity: strong El Nino suppression", () => {
  it("returns suppressed (0) for any precipitation when ONI is strong Nino", () => {
    expect(getRainIntensity({ rainMm: 0, oni: ONI_STRONG_NINO }).value).toBe(0);
    expect(
      getRainIntensity({ rainMm: RAIN_LOW_MM, oni: ONI_STRONG_NINO }).value,
    ).toBe(0);
    expect(
      getRainIntensity({ rainMm: RAIN_HIGH_MM, oni: ONI_STRONG_NINO }).value,
    ).toBe(0);
    expect(getRainIntensity({ rainMm: 300, oni: 2.6 }).value).toBe(0);
  });

  it("labels the suppression category explicitly", () => {
    expect(getRainIntensity({ rainMm: 300, oni: 2.6 }).category).toBe(
      "suppressed",
    );
  });
});

describe("getRainIntensity: strong La Nina amplification", () => {
  it("returns heavy (1.0) when Nina is strong and rain is high", () => {
    const result = getRainIntensity({ rainMm: 180, oni: -2.0 });
    expect(result.category).toBe("heavy");
    expect(result.value).toBe(1);
  });

  it("returns moderate (0.7) when Nina is strong and rain is at the low threshold", () => {
    const result = getRainIntensity({
      rainMm: RAIN_LOW_MM,
      oni: ONI_STRONG_NINA,
    });
    expect(result.category).toBe("moderate");
    expect(result.value).toBe(0.7);
  });

  it("returns drizzle (0.3) when Nina is strong but rain is below the low threshold", () => {
    const result = getRainIntensity({ rainMm: 60, oni: -2.0 });
    expect(result.category).toBe("drizzle");
    expect(result.value).toBe(0.3);
  });
});

describe("getRainIntensity: neutral / mild ONI tiers", () => {
  it("returns none (0) when neutral and rain is below the low threshold", () => {
    const result = getRainIntensity({ rainMm: 50, oni: 0 });
    expect(result.category).toBe("none");
    expect(result.value).toBe(0);
  });

  it("returns drizzle (0.3) when neutral and rain is at the low threshold", () => {
    const result = getRainIntensity({ rainMm: RAIN_LOW_MM, oni: 0 });
    expect(result.category).toBe("drizzle");
    expect(result.value).toBe(0.3);
  });

  it("returns moderate (0.6) when neutral and rain is at the high threshold", () => {
    const result = getRainIntensity({ rainMm: RAIN_HIGH_MM, oni: 0 });
    expect(result.category).toBe("moderate");
    expect(result.value).toBe(0.6);
  });

  it("returns heavy (0.85) when neutral and rain is at the very-high threshold", () => {
    const result = getRainIntensity({ rainMm: RAIN_VERY_HIGH_MM, oni: 0 });
    expect(result.category).toBe("heavy");
    expect(result.value).toBe(0.85);
  });

  it("treats mild Nino (below strong threshold) the same as neutral for tiering", () => {
    expect(getRainIntensity({ rainMm: 50, oni: 0.8 }).value).toBe(0);
    expect(getRainIntensity({ rainMm: RAIN_HIGH_MM, oni: 0.8 }).value).toBe(
      0.6,
    );
  });
});

describe("getRainIntensity: purity", () => {
  it("is deterministic: same inputs always return the same output", () => {
    const a = getRainIntensity({ rainMm: 175, oni: -1.8 });
    const b = getRainIntensity({ rainMm: 175, oni: -1.8 });
    expect(a).toEqual(b);
  });
});
