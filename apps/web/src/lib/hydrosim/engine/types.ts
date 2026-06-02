export interface CityProfile {
  id: "tunja" | "duitama" | "sogamoso";
  name: string;
  population: number;
  growthRateAnnual: number;
  birthRateAnnual: number;
  migrationRateAnnual: number;
  basinAreaKm2: number;
  perCapitaDemandLpcd: number;
  industrialDemandMcmMonth: number;
  agriculturalDemandMcmMonth: number;
}

export interface SimParams {
  oni: number;
  rainMm: number;
  runoffCoefficient: number;
  demandLpcd: number;
  industrialDemandMcmMonth: number;
  agriculturalDemandMcmMonth: number;
  efficiencyPct: number;
  evaporationFactor: number;
  birthRateAnnual: number;
  migrationRateAnnual: number;
  rationingActive: boolean;
}

export interface SimFlows {
  inflow: number;
  recharge: number;
  domesticDemand: number;
  industrialDemand: number;
  agriculturalDemand: number;
  totalDemand: number;
  networkLoss: number;
  extraction: number;
  evaporation: number;
  filtration: number;
  aquiferExtraction: number;
  fireProbability: number;
}

export interface SimState {
  month: number;
  reservoirPct: number;
  aquiferLevel: number;
  paramoCoverage: number;
  population: number;
  consecutivePnrMonths: number;
  pnrTriggered: boolean;
  collapse: boolean;
  flows: SimFlows;
}

export interface SimSnapshot extends SimState {
  date: { year: number; month: number };
}

export const PNR_THRESHOLD_PCT = 15;
export const PNR_CONSECUTIVE_MONTHS = 2;
export const RATIONING_THRESHOLD_PCT = 20;
export const RATIONING_REDUCTION = 0.3;
export const AQUIFER_STRESS_DENOMINATOR_PCT = 50;
export const RECHARGE_COLLAPSE_RATIO = 0.2;
export const BASELINE_RAIN_MM = 85;
