export type RainCategory =
  | "none"
  | "drizzle"
  | "moderate"
  | "heavy"
  | "suppressed";

export interface RainInputs {
  rainMm: number;
  oni: number;
}

export interface RainIntensity {
  category: RainCategory;
  value: number;
}

export const RAIN_HIGH_MM = 150;
export const RAIN_VERY_HIGH_MM = 200;
export const RAIN_LOW_MM = 100;
export const ONI_STRONG_NINO = 1.5;
export const ONI_STRONG_NINA = -1.5;

const SUPPRESSED: RainIntensity = { category: "suppressed", value: 0 };
const NONE: RainIntensity = { category: "none", value: 0 };

export function getRainIntensity({ rainMm, oni }: RainInputs): RainIntensity {
  if (oni >= ONI_STRONG_NINO) {
    return SUPPRESSED;
  }

  if (oni <= ONI_STRONG_NINA) {
    if (rainMm >= RAIN_HIGH_MM) {
      return { category: "heavy", value: 1 };
    }
    if (rainMm >= RAIN_LOW_MM) {
      return { category: "moderate", value: 0.7 };
    }
    return { category: "drizzle", value: 0.3 };
  }

  if (rainMm >= RAIN_VERY_HIGH_MM) {
    return { category: "heavy", value: 0.85 };
  }
  if (rainMm >= RAIN_HIGH_MM) {
    return { category: "moderate", value: 0.6 };
  }
  if (rainMm >= RAIN_LOW_MM) {
    return { category: "drizzle", value: 0.3 };
  }
  return NONE;
}
