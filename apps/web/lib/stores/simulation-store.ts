import { create } from "zustand";
import type {
  ConfigTab,
  ReservoirId,
  ScenarioId,
} from "@/src/lib/hydrosim/types";

interface SimulationState {
  scenario: ScenarioId;
  reservoir: ReservoirId;
  waterVisibility: Partial<Record<ReservoirId, boolean>>;
  isPlaying: boolean;
  step: number;
  configOpen: boolean;
  configTab: ConfigTab;
  isDialogExpanded: boolean;
  oniValue: number;
  rainValue: number;
  demandValue: number;
  efficiencyValue: number;
  rationingActive: boolean;
  fogIntensity: number;

  setScenario: (scenario: ScenarioId) => void;
  setReservoir: (reservoir: ReservoirId) => void;
  setWaterVisible: (reservoir: ReservoirId, visible: boolean) => void;
  togglePlayback: () => void;
  setStep: (step: number) => void;
  setConfigOpen: (open: boolean) => void;
  setConfigTab: (tab: ConfigTab) => void;
  toggleDialogExpanded: () => void;
  setOniValue: (value: number) => void;
  setRainValue: (value: number) => void;
  setDemandValue: (value: number) => void;
  setEfficiencyValue: (value: number) => void;
  setRationingActive: (active: boolean) => void;
  setFogIntensity: (value: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  scenario: "baseline",
  reservoir: "tunja",
  waterVisibility: {},
  isPlaying: false,
  step: 1,
  configOpen: false,
  configTab: "scenarios",
  isDialogExpanded: false,
  oniValue: 0,
  rainValue: 85,
  demandValue: 120,
  efficiencyValue: 62,
  rationingActive: false,
  fogIntensity: 0.8,

  setScenario: (scenario) => set({ scenario }),
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
  toggleDialogExpanded: () =>
    set((state) => ({ isDialogExpanded: !state.isDialogExpanded })),
  setOniValue: (oniValue) => set({ oniValue }),
  setRainValue: (rainValue) => set({ rainValue }),
  setDemandValue: (demandValue) => set({ demandValue }),
  setEfficiencyValue: (efficiencyValue) => set({ efficiencyValue }),
  setRationingActive: (rationingActive) => set({ rationingActive }),
  setFogIntensity: (fogIntensity) => set({ fogIntensity }),
}));
