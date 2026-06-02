import { create } from "zustand";
import type {
  ConfigTab,
  ReservoirId,
  ScenarioId,
} from "@/src/lib/hydrosim/types";
import {
  BASE_EVAPORATION_FACTOR,
  BASE_RUNOFF_COEFFICIENT,
  createEmptyHistory,
  getCityProfile,
  pushHistory,
  type HistoryEntry,
  type HistoryMap,
} from "@/src/lib/hydrosim/engine";
import type { SimState } from "@/src/lib/hydrosim/engine";

interface SimulationState {
  scenario: ScenarioId;
  reservoir: ReservoirId;
  waterVisibility: Partial<Record<ReservoirId, boolean>>;
  isPlaying: boolean;
  simulationSpeed: number;
  configOpen: boolean;
  configTab: ConfigTab;
  controlsPanelMinimized: boolean;
  ambientAudioEnabled: boolean;
  showShortcutHints: boolean;
  isDialogExpanded: boolean;
  oniValue: number;
  rainValue: number;
  runoffCoefficient: number;
  demandValue: number;
  industrialDemandValue: number;
  agriculturalDemandValue: number;
  efficiencyValue: number;
  evaporationFactor: number;
  birthRateAnnual: number;
  migrationRateAnnual: number;
  rationingActive: boolean;
  fogIntensity: number;

  simState: SimState;
  history: HistoryMap;
  chartsPanelOpen: boolean;
  paramSnapshot: {
    oni: number;
    rain: number;
    runoffCoefficient: number;
    demand: number;
    industrialDemand: number;
    agriculturalDemand: number;
    efficiency: number;
    evaporationFactor: number;
    birthRateAnnual: number;
    migrationRateAnnual: number;
    rationing: boolean;
  } | null;

  setScenario: (scenario: ScenarioId) => void;
  setReservoir: (reservoir: ReservoirId) => void;
  setWaterVisible: (reservoir: ReservoirId, visible: boolean) => void;
  togglePlayback: () => void;
  setSimulationSpeed: (speed: number) => void;
  setConfigOpen: (open: boolean) => void;
  setConfigTab: (tab: ConfigTab) => void;
  toggleControlsPanelMinimized: () => void;
  setAmbientAudioEnabled: (enabled: boolean) => void;
  toggleAmbientAudio: () => void;
  setShowShortcutHints: (show: boolean) => void;
  toggleShowShortcutHints: () => void;
  toggleDialogExpanded: () => void;
  setOniValue: (value: number) => void;
  setRainValue: (value: number) => void;
  setRunoffCoefficient: (value: number) => void;
  setDemandValue: (value: number) => void;
  setIndustrialDemandValue: (value: number) => void;
  setAgriculturalDemandValue: (value: number) => void;
  setEfficiencyValue: (value: number) => void;
  setEvaporationFactor: (value: number) => void;
  setBirthRateAnnual: (value: number) => void;
  setMigrationRateAnnual: (value: number) => void;
  setRationingActive: (active: boolean) => void;
  setFogIntensity: (value: number) => void;
  toggleChartsPanel: () => void;
  setChartsPanelOpen: (open: boolean) => void;

  setSimState: (state: SimState) => void;
  pushHistory: (scenario: ScenarioId, entry: HistoryEntry) => void;
  clearHistory: (scenario: ScenarioId) => void;
  clearAllHistory: () => void;
  captureParamSnapshot: () => void;
  revertParamSnapshot: () => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  scenario: "baseline",
  reservoir: "tunja",
  waterVisibility: {},
  isPlaying: false,
  simulationSpeed: 1,
  configOpen: false,
  configTab: "scenarios",
  controlsPanelMinimized: false,
  ambientAudioEnabled: false,
  showShortcutHints: true,
  isDialogExpanded: false,
  oniValue: 0,
  rainValue: 85,
  runoffCoefficient: BASE_RUNOFF_COEFFICIENT,
  demandValue: getCityProfile("tunja").perCapitaDemandLpcd,
  industrialDemandValue: getCityProfile("tunja").industrialDemandMcmMonth,
  agriculturalDemandValue: getCityProfile("tunja").agriculturalDemandMcmMonth,
  efficiencyValue: 62,
  evaporationFactor: BASE_EVAPORATION_FACTOR,
  birthRateAnnual: getCityProfile("tunja").birthRateAnnual,
  migrationRateAnnual: getCityProfile("tunja").migrationRateAnnual,
  rationingActive: false,
  fogIntensity: 0.8,
  chartsPanelOpen: true,
  simState: {
    month: 0,
    reservoirPct: 68,
    aquiferLevel: 0.7,
    paramoCoverage: 0.9,
    population: 180_000,
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
  },
  paramSnapshot: null,
  history: createEmptyHistory(),

  setScenario: (scenario) =>
    set({
      scenario,
      oniValue: SCENARIO_ONI[scenario],
    }),
  setReservoir: (reservoir) =>
    set((state) => {
      if (state.reservoir === reservoir) return state;
      const city = getCityProfile(reservoir);
      return {
        reservoir,
        demandValue: city.perCapitaDemandLpcd,
        industrialDemandValue: city.industrialDemandMcmMonth,
        agriculturalDemandValue: city.agriculturalDemandMcmMonth,
        birthRateAnnual: city.birthRateAnnual,
        migrationRateAnnual: city.migrationRateAnnual,
        history: createEmptyHistory(),
        simState: createInitialSimState(reservoir, state.scenario),
      };
    }),
  setWaterVisible: (reservoir, visible) =>
    set((state) => ({
      waterVisibility: {
        ...state.waterVisibility,
        [reservoir]: visible,
      },
    })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSimulationSpeed: (simulationSpeed) =>
    set({
      simulationSpeed: Math.min(
        SIMULATION_SPEED_MAX,
        Math.max(SIMULATION_SPEED_MIN, simulationSpeed),
      ),
    }),
  setConfigOpen: (configOpen) => set({ configOpen }),
  setConfigTab: (configTab) => set({ configTab }),
  toggleControlsPanelMinimized: () =>
    set((state) => ({
      controlsPanelMinimized: !state.controlsPanelMinimized,
    })),
  setAmbientAudioEnabled: (ambientAudioEnabled) => set({ ambientAudioEnabled }),
  toggleAmbientAudio: () =>
    set((state) => ({ ambientAudioEnabled: !state.ambientAudioEnabled })),
  setShowShortcutHints: (showShortcutHints) => set({ showShortcutHints }),
  toggleShowShortcutHints: () =>
    set((state) => ({ showShortcutHints: !state.showShortcutHints })),
  toggleDialogExpanded: () =>
    set((state) => ({ isDialogExpanded: !state.isDialogExpanded })),
  setOniValue: (oniValue) => set({ oniValue }),
  setRainValue: (rainValue) => set({ rainValue }),
  setRunoffCoefficient: (runoffCoefficient) => set({ runoffCoefficient }),
  setDemandValue: (demandValue) => set({ demandValue }),
  setIndustrialDemandValue: (industrialDemandValue) =>
    set({ industrialDemandValue }),
  setAgriculturalDemandValue: (agriculturalDemandValue) =>
    set({ agriculturalDemandValue }),
  setEfficiencyValue: (efficiencyValue) => set({ efficiencyValue }),
  setEvaporationFactor: (evaporationFactor) => set({ evaporationFactor }),
  setBirthRateAnnual: (birthRateAnnual) => set({ birthRateAnnual }),
  setMigrationRateAnnual: (migrationRateAnnual) => set({ migrationRateAnnual }),
  setRationingActive: (rationingActive) => set({ rationingActive }),
  setFogIntensity: (fogIntensity) => set({ fogIntensity }),
  toggleChartsPanel: () =>
    set((state) => ({ chartsPanelOpen: !state.chartsPanelOpen })),
  setChartsPanelOpen: (chartsPanelOpen) => set({ chartsPanelOpen }),

  setSimState: (simState) => set({ simState }),
  pushHistory: (scenario, entry) =>
    set((state) => ({
      history: {
        ...state.history,
        [scenario]: pushHistory(state.history[scenario], entry),
      },
    })),
  clearHistory: (scenario) =>
    set((state) => ({
      history: { ...state.history, [scenario]: [] },
    })),
  clearAllHistory: () => set({ history: createEmptyHistory() }),
  captureParamSnapshot: () => {
    const state = get();
    set({
      paramSnapshot: {
        oni: state.oniValue,
        rain: state.rainValue,
        runoffCoefficient: state.runoffCoefficient,
        demand: state.demandValue,
        industrialDemand: state.industrialDemandValue,
        agriculturalDemand: state.agriculturalDemandValue,
        efficiency: state.efficiencyValue,
        evaporationFactor: state.evaporationFactor,
        birthRateAnnual: state.birthRateAnnual,
        migrationRateAnnual: state.migrationRateAnnual,
        rationing: state.rationingActive,
      },
    });
  },
  revertParamSnapshot: () => {
    const snapshot = get().paramSnapshot;
    if (!snapshot) return;
    set({
      oniValue: snapshot.oni,
      rainValue: snapshot.rain,
      runoffCoefficient: snapshot.runoffCoefficient,
      demandValue: snapshot.demand,
      industrialDemandValue: snapshot.industrialDemand,
      agriculturalDemandValue: snapshot.agriculturalDemand,
      efficiencyValue: snapshot.efficiency,
      evaporationFactor: snapshot.evaporationFactor,
      birthRateAnnual: snapshot.birthRateAnnual,
      migrationRateAnnual: snapshot.migrationRateAnnual,
      rationingActive: snapshot.rationing,
      paramSnapshot: null,
    });
  },
  resetSimulation: () => {
    const state = get();
    set({
      isPlaying: false,
      history: createEmptyHistory(),
      simState: createInitialSimState(state.reservoir, state.scenario),
    });
  },
}));

export const SIMULATION_SPEED_MIN = 0.25;
export const SIMULATION_SPEED_MAX = 4;
export const SIMULATION_SPEED_STEP = 0.25;

export const SCENARIO_ONI: Record<ScenarioId, number> = {
  baseline: 0,
  moderate: 1.4,
  extreme: 2.6,
};

const SCENARIO_INITIAL_RESERVOIR: Record<ScenarioId, number> = {
  baseline: 68,
  moderate: 38,
  extreme: 14,
};

export const CITY_POPULATION: Record<ReservoirId, number> = {
  tunja: 180_000,
  duitama: 130_000,
  sogamoso: 115_000,
};

function createEmptyFlows(): SimState["flows"] {
  return {
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
  };
}

function createInitialSimState(
  reservoir: ReservoirId,
  scenario: ScenarioId,
): SimState {
  return {
    month: 0,
    reservoirPct: SCENARIO_INITIAL_RESERVOIR[scenario],
    aquiferLevel: 0.7,
    paramoCoverage: 0.9,
    population: CITY_POPULATION[reservoir],
    consecutivePnrMonths: 0,
    pnrTriggered: false,
    collapse: false,
    flows: createEmptyFlows(),
  };
}
