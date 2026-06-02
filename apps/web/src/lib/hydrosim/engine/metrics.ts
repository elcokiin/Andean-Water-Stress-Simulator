import type { CityProfile, SimFlows, SimState } from "./types";

const M3_PER_MCM = 1_000_000;
const SECONDS_PER_MONTH = 30 * 24 * 3600;

export interface DisplayMetrics {
  reservoirPct: number;
  reservoirPctDelta: number;
  inflowMcmPerMonth: number;
  rechargeMcmPerMonth: number;
  domesticDemandMcmPerMonth: number;
  industrialDemandMcmPerMonth: number;
  agriculturalDemandMcmPerMonth: number;
  totalDemandMcmPerMonth: number;
  networkLossMcmPerMonth: number;
  extractionMcmPerMonth: number;
  evaporationMcmPerMonth: number;
  filtrationMcmPerMonth: number;
  aquiferExtractionMcmPerMonth: number;
  fireProbabilityPct: number;
  netBalanceMcmPerMonth: number;
  extractionM3PerSecond: number;
  inflowM3PerSecond: number;
  population: number;
  aquiferLevel: number;
  paramoCoverage: number;
  pnrTriggered: boolean;
  collapse: boolean;
  month: number;
  consecutivePnrMonths: number;
  monthsToPnr: number | null;
}

function monthsUntilPnr(state: SimState): number | null {
  if (state.pnrTriggered) return 0;
  if (state.collapse) return 0;
  if (state.reservoirPct >= 20) return null;
  return Math.max(0, 20 - state.reservoirPct);
}

function flowsToMcm(flows: SimFlows) {
  return {
    inflow: flows.inflow / M3_PER_MCM,
    recharge: flows.recharge / M3_PER_MCM,
    domesticDemand: flows.domesticDemand / M3_PER_MCM,
    industrialDemand: flows.industrialDemand / M3_PER_MCM,
    agriculturalDemand: flows.agriculturalDemand / M3_PER_MCM,
    totalDemand: flows.totalDemand / M3_PER_MCM,
    networkLoss: flows.networkLoss / M3_PER_MCM,
    extraction: flows.extraction / M3_PER_MCM,
    evaporation: flows.evaporation / M3_PER_MCM,
    filtration: flows.filtration / M3_PER_MCM,
    aquiferExtraction: flows.aquiferExtraction / M3_PER_MCM,
  };
}

export function buildDisplayMetrics(
  state: SimState,
  previous: SimState | null,
  _city: CityProfile,
): DisplayMetrics {
  void _city;

  const flows = flowsToMcm(state.flows);
  const net =
    flows.inflow +
    flows.recharge -
    flows.extraction -
    flows.evaporation -
    flows.filtration;
  return {
    reservoirPct: state.reservoirPct,
    reservoirPctDelta: previous
      ? state.reservoirPct - previous.reservoirPct
      : 0,
    inflowMcmPerMonth: flows.inflow,
    rechargeMcmPerMonth: flows.recharge,
    domesticDemandMcmPerMonth: flows.domesticDemand,
    industrialDemandMcmPerMonth: flows.industrialDemand,
    agriculturalDemandMcmPerMonth: flows.agriculturalDemand,
    totalDemandMcmPerMonth: flows.totalDemand,
    networkLossMcmPerMonth: flows.networkLoss,
    extractionMcmPerMonth: flows.extraction,
    evaporationMcmPerMonth: flows.evaporation,
    filtrationMcmPerMonth: flows.filtration,
    aquiferExtractionMcmPerMonth: flows.aquiferExtraction,
    fireProbabilityPct: state.flows.fireProbability * 100,
    netBalanceMcmPerMonth: net,
    extractionM3PerSecond: state.flows.extraction / SECONDS_PER_MONTH,
    inflowM3PerSecond: state.flows.inflow / SECONDS_PER_MONTH,
    population: state.population,
    aquiferLevel: state.aquiferLevel,
    paramoCoverage: state.paramoCoverage,
    pnrTriggered: state.pnrTriggered,
    collapse: state.collapse,
    month: state.month,
    consecutivePnrMonths: state.consecutivePnrMonths,
    monthsToPnr: monthsUntilPnr(state),
  };
}

export function formatMcm(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs < 0.01) return `${sign}0`;
  if (abs < 1) return `${sign}${abs.toFixed(2)}`;
  return `${sign}${abs.toFixed(1)}`;
}

export function formatPct(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatM3PerSecond(value: number): string {
  if (value < 1) return value.toFixed(2);
  return value.toFixed(1);
}
