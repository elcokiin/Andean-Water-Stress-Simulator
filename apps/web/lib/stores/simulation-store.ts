import { create } from "zustand";
import type {
  ConfigTab,
  ReservoirId,
  ScenarioId,
} from "@/src/lib/hydrosim/types";
import type { SimState } from "@/src/lib/hydrosim/engine";

interface SimulationState {
  scenario: ScenarioId;
  reservoir: ReservoirId;
  waterVisibility: Partial<Record<ReservoirId, boolean>>;
  isPlaying: boolean;
  step: number;
  configOpen: boolean;
  configTab: ConfigTab;
  controlsPanelMinimized: boolean;
  ambientAudioEnabled: boolean;
  showShortcutHints: boolean;
  isDialogExpanded: boolean;
  oniValue: number;
  rainValue: number;
  demandValue: number;
  efficiencyValue: number;
  rationingActive: boolean;
  fogIntensity: number;

  simState: SimState;
  paramSnapshot: {
    oni: number;
    rain: number;
    demand: number;
    efficiency: number;
    rationing: boolean;
  } | null;

  setScenario: (scenario: ScenarioId) => void;
  setReservoir: (reservoir: ReservoirId) => void;
  setWaterVisible: (reservoir: ReservoirId, visible: boolean) => void;
  togglePlayback: () => void;
  setStep: (step: number) => void;
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
  setDemandValue: (value: number) => void;
  setEfficiencyValue: (value: number) => void;
  setRationingActive: (active: boolean) => void;
  setFogIntensity: (value: number) => void;

  setSimState: (state: SimState) => void;
  captureParamSnapshot: () => void;
  revertParamSnapshot: () => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  scenario: "baseline",
  reservoir: "tunja",
  waterVisibility: {},
  isPlaying: false,
  step: 1,
  configOpen: false,
  configTab: "scenarios",
  controlsPanelMinimized: false,
  ambientAudioEnabled: false,
  showShortcutHints: true,
  isDialogExpanded: false,
  oniValue: 0,
  rainValue: 85,
  demandValue: 120,
  efficiencyValue: 62,
  rationingActive: false,
  fogIntensity: 0.8,
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
      extraction: 0,
      evaporation: 0,
      filtration: 0,
      aquiferExtraction: 0,
    },
  },
  paramSnapshot: null,

  setScenario: (scenario) =>
    set({
      scenario,
      oniValue: SCENARIO_ONI[scenario],
    }),
  setReservoir: (reservoir) => set({ reservoir }),
  setWaterVisible: (reservoir, visible) =>
    set((state) => ({
      waterVisibility: {
        ...state.waterVisibility,
        [reservoir]: visible,
      },
    })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setStep: (step) => set({ step }),
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
  setDemandValue: (demandValue) => set({ demandValue }),
  setEfficiencyValue: (efficiencyValue) => set({ efficiencyValue }),
  setRationingActive: (rationingActive) => set({ rationingActive }),
  setFogIntensity: (fogIntensity) => set({ fogIntensity }),

  setSimState: (simState) => set({ simState }),
  captureParamSnapshot: () => {
    const state = get();
    set({
      paramSnapshot: {
        oni: state.oniValue,
        rain: state.rainValue,
        demand: state.demandValue,
        efficiency: state.efficiencyValue,
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
      demandValue: snapshot.demand,
      efficiencyValue: snapshot.efficiency,
      rationingActive: snapshot.rationing,
      paramSnapshot: null,
    });
  },
  resetSimulation: () => {
    const state = get();
    set({
      isPlaying: false,
      simState: {
        month: 0,
        reservoirPct: SCENARIO_INITIAL_RESERVOIR[state.scenario],
        aquiferLevel: 0.7,
        paramoCoverage: 0.9,
        population: CITY_POPULATION[state.reservoir],
        consecutivePnrMonths: 0,
        pnrTriggered: false,
        collapse: false,
        flows: {
          inflow: 0,
          recharge: 0,
          extraction: 0,
          evaporation: 0,
          filtration: 0,
          aquiferExtraction: 0,
        },
      },
    });
  },
}));

const SCENARIO_ONI: Record<ScenarioId, number> = {
  baseline: 0,
  moderate: 1.4,
  extreme: 2.6,
};

const SCENARIO_INITIAL_RESERVOIR: Record<ScenarioId, number> = {
  baseline: 68,
  moderate: 38,
  extreme: 14,
};

const CITY_POPULATION: Record<ReservoirId, number> = {
  tunja: 180_000,
  duitama: 130_000,
  sogamoso: 115_000,
};
