import { useEffect } from "react";

import { useSimulationStore } from "@/lib/stores/simulation-store";

import { timeline } from "./model-data";
import type { ShortcutAction } from "./model-data";

export function useModelKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.metaKey) {
        return;
      }

      const action = resolveShortcutAction({
        ctrlKey: event.ctrlKey,
        key: event.key,
      });

      if (!action) {
        return;
      }

      if (!event.ctrlKey && isEditableElement(event.target)) {
        return;
      }

      const store = useSimulationStore.getState();

      switch (action) {
        case "toggle-play":
          store.togglePlayback();
          event.preventDefault();
          break;
        case "step-forward":
          store.setStep(Math.min(store.step + 1, timeline.length - 1));
          event.preventDefault();
          break;
        case "step-back":
          store.setStep(Math.max(store.step - 1, 0));
          event.preventDefault();
          break;
        case "restart":
          store.setStep(0);
          store.setScenario("baseline");
          store.setConfigOpen(false);
          event.preventDefault();
          break;
        case "open-config":
          store.setConfigOpen(!store.configOpen);
          event.preventDefault();
          break;
        case "close-config":
          if (store.configOpen) {
            store.setConfigOpen(false);
            event.preventDefault();
          }
          break;
        case "open-shortcuts-tab":
          store.setConfigTab("shortcuts");
          store.setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-scenarios":
          store.setConfigTab("scenarios");
          store.setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-parameters":
          store.setConfigTab("parameters");
          store.setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-shortcuts":
          store.setConfigTab("shortcuts");
          store.setConfigOpen(true);
          event.preventDefault();
          break;
        case "toggle-expand":
          store.setConfigOpen(true);
          store.toggleDialogExpanded();
          event.preventDefault();
          break;
        case "save-config":
          store.setConfigOpen(false);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

function resolveShortcutAction({
  ctrlKey,
  key,
}: {
  ctrlKey: boolean;
  key: string;
}): ShortcutAction | null {
  if (ctrlKey) {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === "1") return "tab-scenarios";
    if (normalizedKey === "2") return "tab-parameters";
    if (normalizedKey === "3") return "tab-shortcuts";
    if (normalizedKey === "e") return "toggle-expand";
    if (normalizedKey === "enter") return "save-config";

    return null;
  }

  if (key === " ") return "toggle-play";

  const normalizedKey = key.toLowerCase();

  if (normalizedKey === "arrowright") return "step-forward";
  if (normalizedKey === "arrowleft") return "step-back";
  if (normalizedKey === "r") return "restart";
  if (normalizedKey === "c") return "open-config";
  if (normalizedKey === "escape") return "close-config";
  if (key === "?") return "open-shortcuts-tab";

  return null;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest('[contenteditable="true"]')) {
    return true;
  }

  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}
