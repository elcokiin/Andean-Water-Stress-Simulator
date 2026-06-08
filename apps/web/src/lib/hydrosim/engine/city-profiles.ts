import type { CityProfile } from "./types";

export const cityProfiles: Record<CityProfile["id"], CityProfile> = {
  tunja: {
    id: "tunja",
    name: "Tunja",
    population: 180_000,
    growthRateAnnual: 0.014,
    birthRateAnnual: 0.01,
    migrationRateAnnual: 0.004,
    basinAreaKm2: 30,
    perCapitaDemandLpcd: 148,
    industrialDemandMcmMonth: 0.01,
    agriculturalDemandMcmMonth: 0.005,
  },
  duitama: {
    id: "duitama",
    name: "Duitama",
    population: 130_000,
    growthRateAnnual: 0.011,
    birthRateAnnual: 0.008,
    migrationRateAnnual: 0.003,
    basinAreaKm2: 22,
    perCapitaDemandLpcd: 132,
    industrialDemandMcmMonth: 0.02,
    agriculturalDemandMcmMonth: 0.005,
  },
  sogamoso: {
    id: "sogamoso",
    name: "Sogamoso",
    population: 115_000,
    growthRateAnnual: 0.009,
    birthRateAnnual: 0.007,
    migrationRateAnnual: 0.002,
    basinAreaKm2: 18,
    perCapitaDemandLpcd: 140,
    industrialDemandMcmMonth: 0.025,
    agriculturalDemandMcmMonth: 0.005,
  },
};

export function getCityProfile(id: CityProfile["id"]): CityProfile {
  return cityProfiles[id];
}
