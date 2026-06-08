import { useHotkey } from "@tanstack/react-hotkeys";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { useModelTour } from "./use-model-tour";

export function useModelKeyboardShortcuts() {
  const { toggle: toggleTheme } = useTheme();
  const startModelTour = useModelTour();

  useHotkey("Space", () => {
    const store = useSimulationStore.getState();
    if (!store.modelSceneReady || store.simState.collapse) return;
    store.togglePlayback();
  });

  useHotkey("ArrowRight", () => {
    const store = useSimulationStore.getState();
    if (store.configOpen) return;
    const order = ["baseline", "moderate", "extreme"] as const;
    const index = order.indexOf(store.scenario);
    store.setScenario(
      order[Math.min(index + 1, order.length - 1)] ?? "extreme",
    );
  });

  useHotkey("ArrowLeft", () => {
    const store = useSimulationStore.getState();
    if (store.configOpen) return;
    const order = ["baseline", "moderate", "extreme"] as const;
    const index = order.indexOf(store.scenario);
    store.setScenario(order[Math.max(index - 1, 0)] ?? "baseline");
  });

  useHotkey("R", () => {
    const store = useSimulationStore.getState();
    store.setScenario("baseline");
    store.resetSimulation();
    store.setConfigOpen(false);
  });

  useHotkey("C", () => {
    const store = useSimulationStore.getState();
    store.setConfigOpen(!store.configOpen);
  });

  useHotkey("G", () => {
    useSimulationStore.getState().toggleChartsPanel();
  });

  useHotkey("P", () => {
    useSimulationStore.getState().toggleControlsPanelMinimized();
  });

  useHotkey("M", () => {
    useSimulationStore.getState().toggleAmbientAudio();
  });

  useHotkey("K", () => {
    useSimulationStore.getState().toggleShowShortcutHints();
  });

  useHotkey("D", () => {
    toggleTheme();
  });

  useHotkey("H", () => {
    startModelTour();
  });

  useHotkey("Escape", () => {
    const store = useSimulationStore.getState();
    if (store.configOpen) {
      store.setConfigOpen(false);
    }
  });

  useHotkey({ key: "/", shift: true }, () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("shortcuts");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+1", () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("scenarios");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+2", () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("climate");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+3", () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("demand");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+4", () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("infrastructure");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+5", () => {
    const store = useSimulationStore.getState();
    store.setConfigTab("shortcuts");
    store.setConfigOpen(true);
  });

  useHotkey("Mod+E", () => {
    const store = useSimulationStore.getState();
    store.setConfigOpen(true);
    store.toggleDialogExpanded();
  });

  useHotkey("Mod+Enter", () => {
    useSimulationStore.setState({ paramSnapshot: null });
    useSimulationStore.getState().setConfigOpen(false);
  });
}
