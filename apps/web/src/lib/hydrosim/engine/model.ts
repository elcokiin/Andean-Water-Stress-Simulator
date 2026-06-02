import { cityProfiles, getCityProfile } from "./city-profiles";
import {
  AQUIFER_STRESS_DENOMINATOR_PCT,
  PNR_CONSECUTIVE_MONTHS,
  PNR_THRESHOLD_PCT,
  RATIONING_REDUCTION,
  RATIONING_THRESHOLD_PCT,
  RECHARGE_COLLAPSE_RATIO,
  type CityProfile,
  type SimFlows,
  type SimParams,
  type SimSnapshot,
  type SimState,
} from "./types";

const ONI_TO_RAIN_SLOPE = 0.3;
const ONI_RAIN_FACTOR_MIN = 0.25;
const ONI_RAIN_FACTOR_MAX = 1.3;
const PARAMO_RETENTION_MIN = 0.5;
const PARAMO_RETENTION_MAX = 1;
const RECHARGE_COEFFICIENT = 0.15;
const EVAP_MM_PER_MONTH = 35;
const EVAP_ONI_SLOPE_MM = 18;
const EVAP_BASIN_FRACTION = 0.18;
const FILTRATION_FRACTION_OF_CAPACITY = 0.0001;
const AQUIFER_BASE_EXTRACTION_FRACTION = 0.0001;
const AQUIFER_STRESS_GAIN = 0.8;
const PARAMO_DEGRADATION_SLOPE = 0.015;
const PARAMO_DEGRADATION_BIAS = 0.5;
const PARAMO_MIN_COVERAGE = 0.05;
const AQUIFER_NORMALIZATION = 0.35;
const M3_PER_MCM = 1_000_000;
const DEFAULT_RUNOFF_COEFFICIENT = 0.48;
const DEFAULT_EVAPORATION_FACTOR = 1;
const STARTING_RESERVOIR_PCT_BY_SCENARIO: Record<
  "baseline" | "moderate" | "extreme",
  number
> = {
  baseline: 68,
  moderate: 38,
  extreme: 14,
};

const CAPACITY_M3: Record<CityProfile["id"], number> = {
  tunja: 41_200_000,
  duitama: 35_000_000,
  sogamoso: 60_000_000,
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function monthToDate(month: number): { year: number; month: number } {
  const startYear = 2024;
  const totalMonths = startYear * 12 + month;
  return {
    year: Math.floor(totalMonths / 12),
    month: (totalMonths % 12) + 1,
  };
}

export function createInitialState(
  city: CityProfile,
  scenario: keyof typeof STARTING_RESERVOIR_PCT_BY_SCENARIO = "baseline",
): SimState {
  return {
    month: 0,
    reservoirPct: STARTING_RESERVOIR_PCT_BY_SCENARIO[scenario],
    aquiferLevel: 0.7,
    paramoCoverage: 0.9,
    population: city.population,
    consecutivePnrMonths: 0,
    pnrTriggered: false,
    collapse: false,
    flows: {
      inflow: 0,
      recharge: 0,
      domesticDemand: 0,
      industrialDemand: 0,
      agriculturalDemand: 0,
      totalDemand: 0,
      networkLoss: 0,
      extraction: 0,
      evaporation: 0,
      filtration: 0,
      aquiferExtraction: 0,
      fireProbability: 0,
    },
  };
}

interface StepResult {
  state: SimState;
  flows: SimFlows;
}

function computeFlows(
  state: SimState,
  params: SimParams,
  city: CityProfile,
): StepResult {
  const capacityM3 = CAPACITY_M3[city.id];
  const oniRainFactor = clamp(
    1 - params.oni * ONI_TO_RAIN_SLOPE,
    ONI_RAIN_FACTOR_MIN,
    ONI_RAIN_FACTOR_MAX,
  );
  const paramoRetention =
    PARAMO_RETENTION_MIN +
    (PARAMO_RETENTION_MAX - PARAMO_RETENTION_MIN) * state.paramoCoverage;
  const effectiveRainMm = params.rainMm * oniRainFactor * paramoRetention;

  const basinAreaM2 = city.basinAreaKm2 * 1_000_000;
  const rainVolumeM3 = (effectiveRainMm / 1000) * basinAreaM2;
  const runoffCoefficient = clamp(params.runoffCoefficient, 0, 1);
  const inflow = rainVolumeM3 * runoffCoefficient;
  const recharge = rainVolumeM3 * RECHARGE_COEFFICIENT;

  const populationGrowthAnnual =
    params.birthRateAnnual + params.migrationRateAnnual;
  const populationMonthly =
    state.population * (1 + populationGrowthAnnual / 12);
  const perCapitaM3PerMonth = (params.demandLpcd * 30) / 1000;
  const domesticDemand = populationMonthly * perCapitaM3PerMonth;
  const industrialDemand = params.industrialDemandMcmMonth * M3_PER_MCM;
  const agriculturalDemand = params.agriculturalDemandMcmMonth * M3_PER_MCM;
  const totalDemand = domesticDemand + industrialDemand + agriculturalDemand;
  const rationingActive =
    params.rationingActive && state.reservoirPct < RATIONING_THRESHOLD_PCT;
  const deliveredDemand = rationingActive
    ? totalDemand * (1 - RATIONING_REDUCTION)
    : totalDemand;
  const extraction = deliveredDemand / (params.efficiencyPct / 100);
  const networkLoss = Math.max(0, extraction - deliveredDemand);

  const evapMm = Math.max(
    0,
    EVAP_MM_PER_MONTH + params.oni * EVAP_ONI_SLOPE_MM,
  );
  const evaporation =
    (evapMm / 1000) *
    basinAreaM2 *
    EVAP_BASIN_FRACTION *
    params.evaporationFactor;

  const filtration = capacityM3 * FILTRATION_FRACTION_OF_CAPACITY;

  const stressIndex = clamp(
    1 - state.reservoirPct / AQUIFER_STRESS_DENOMINATOR_PCT,
    0,
    1,
  );
  const aquiferExtraction =
    capacityM3 *
    AQUIFER_BASE_EXTRACTION_FRACTION *
    (1 + AQUIFER_STRESS_GAIN * stressIndex);
  const rainDeficit = clamp(
    1 - effectiveRainMm / Math.max(params.rainMm, 1),
    0,
    1,
  );
  const fireProbability = clamp(
    Math.max(0, params.oni) * 0.16 +
      stressIndex * 0.28 +
      (1 - state.paramoCoverage) * 0.2 +
      rainDeficit * 0.26,
    0,
    1,
  );

  return {
    state: { ...state, population: populationMonthly },
    flows: {
      inflow,
      recharge,
      domesticDemand,
      industrialDemand,
      agriculturalDemand,
      totalDemand,
      networkLoss,
      extraction,
      evaporation,
      filtration,
      aquiferExtraction,
      fireProbability,
    },
  };
}

export function step(
  state: SimState,
  params: SimParams,
  city: CityProfile,
): SimState {
  if (state.collapse) {
    return state;
  }

  const { state: preFlowState, flows } = computeFlows(state, params, city);
  const capacityM3 = CAPACITY_M3[city.id];
  const netReservoirM3 =
    flows.inflow +
    flows.recharge -
    flows.extraction -
    flows.evaporation -
    flows.filtration;
  const deltaPct = (netReservoirM3 / capacityM3) * 100;
  const reservoirPct = clamp(preFlowState.reservoirPct + deltaPct, 0, 100);

  const aquiferDelta = flows.recharge - flows.aquiferExtraction;
  const aquiferLevel = clamp(
    preFlowState.aquiferLevel +
      (aquiferDelta / capacityM3) * AQUIFER_NORMALIZATION,
    0,
    1,
  );

  const stressIndex = clamp(
    1 - preFlowState.reservoirPct / AQUIFER_STRESS_DENOMINATOR_PCT,
    0,
    1,
  );
  const oniStress = Math.max(0, params.oni);
  const paramoStress = stressIndex + oniStress * 0.3;
  const degradation =
    Math.max(0, paramoStress - PARAMO_DEGRADATION_BIAS) *
      PARAMO_DEGRADATION_SLOPE +
    flows.fireProbability * 0.004;
  const paramoCoverage = clamp(
    preFlowState.paramoCoverage - degradation,
    PARAMO_MIN_COVERAGE,
    1,
  );

  const consecutivePnrMonths =
    reservoirPct < PNR_THRESHOLD_PCT
      ? preFlowState.consecutivePnrMonths + 1
      : 0;
  const pnrTriggered =
    preFlowState.pnrTriggered || consecutivePnrMonths >= PNR_CONSECUTIVE_MONTHS;

  const baselineRecharge =
    ((params.rainMm * PARAMO_RETENTION_MAX) / 1000) *
    city.basinAreaKm2 *
    1_000_000 *
    RECHARGE_COEFFICIENT;
  const rechargeRatio =
    baselineRecharge > 0 ? flows.recharge / baselineRecharge : 1;
  const collapse = pnrTriggered && rechargeRatio < RECHARGE_COLLAPSE_RATIO;

  return {
    month: preFlowState.month + 1,
    reservoirPct,
    aquiferLevel,
    paramoCoverage,
    population: preFlowState.population,
    consecutivePnrMonths,
    pnrTriggered,
    collapse,
    flows,
  };
}

export function run(
  start: SimState,
  params: SimParams,
  city: CityProfile,
  steps: number,
): SimState[] {
  const history: SimState[] = [start];
  let current = start;
  for (let index = 0; index < steps; index += 1) {
    current = step(current, params, city);
    history.push(current);
    if (current.collapse) break;
  }
  return history;
}

export function snapshot(state: SimState): SimSnapshot {
  return {
    ...state,
    date: monthToDate(state.month),
  };
}

export function formatMonth(snapshot: SimSnapshot): string {
  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${monthNames[snapshot.date.month - 1] ?? "?"} ${snapshot.date.year}`;
}

export function getCapacityM3(cityId: CityProfile["id"]): number {
  return CAPACITY_M3[cityId];
}

export const SCENARIO_INITIAL_RESERVOIR = STARTING_RESERVOIR_PCT_BY_SCENARIO;
export const BASE_RUNOFF_COEFFICIENT = DEFAULT_RUNOFF_COEFFICIENT;
export const BASE_EVAPORATION_FACTOR = DEFAULT_EVAPORATION_FACTOR;

export { cityProfiles, getCityProfile };
