import { useHotkey } from "@tanstack/react-hotkeys";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { timeline } from "@/src/lib/hydrosim/scenarios";

export function useModelKeyboardShortcuts() {
  const { toggle: toggleTheme } = useTheme();

  useHotkey("Space", () => {
    useSimulationStore.getState().togglePlayback();
  });

  useHotkey("ArrowRight", () => {
    const store = useSimulationStore.getState();
    store.setStep(Math.min(store.step + 1, timeline.length - 1));
  });

  useHotkey("ArrowLeft", () => {
    const store = useSimulationStore.getState();
    store.setStep(Math.max(store.step - 1, 0));
  });

  useHotkey("R", () => {
    const store = useSimulationStore.getState();
    store.setStep(0);
    store.setScenario("baseline");
    store.setConfigOpen(false);
  });

  useHotkey("C", () => {
    const store = useSimulationStore.getState();
    store.setConfigOpen(!store.configOpen);
  });

  useHotkey("M", () => {
    useSimulationStore.getState().toggleControlsPanelMinimized();
  });

  useHotkey("H", () => {
    useSimulationStore.getState().toggleShowShortcutHints();
  });

  useHotkey("D", () => {
    toggleTheme();
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
    useSimulationStore.getState().setConfigOpen(false);
  });
}
