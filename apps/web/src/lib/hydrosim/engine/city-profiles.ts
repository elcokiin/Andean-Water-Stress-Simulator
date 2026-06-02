import type { CityProfile } from "./types";

export const cityProfiles: Record<CityProfile["id"], CityProfile> = {
  tunja: {
    id: "tunja",
    name: "Tunja",
    population: 180_000,
    growthRateAnnual: 0.014,
    basinAreaKm2: 30,
    perCapitaDemandLpcd: 148,
  },
  duitama: {
    id: "duitama",
    name: "Duitama",
    population: 130_000,
    growthRateAnnual: 0.011,
    basinAreaKm2: 22,
    perCapitaDemandLpcd: 132,
  },
  sogamoso: {
    id: "sogamoso",
    name: "Sogamoso",
    population: 115_000,
    growthRateAnnual: 0.009,
    basinAreaKm2: 18,
    perCapitaDemandLpcd: 140,
  },
};

export function getCityProfile(id: CityProfile["id"]): CityProfile {
  return cityProfiles[id];
}
