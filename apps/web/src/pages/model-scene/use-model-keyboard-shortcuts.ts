import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { timeline } from "./model-data";
import type { ConfigTab, ScenarioId, ShortcutAction } from "./model-data";

export function useModelKeyboardShortcuts({
  configOpen,
  setConfigOpen,
  setConfigTab,
  setIsDialogExpanded,
  setIsPlaying,
  setScenario,
  setStep,
}: {
  configOpen: boolean;
  setConfigOpen: Dispatch<SetStateAction<boolean>>;
  setConfigTab: Dispatch<SetStateAction<ConfigTab>>;
  setIsDialogExpanded: Dispatch<SetStateAction<boolean>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setScenario: Dispatch<SetStateAction<ScenarioId>>;
  setStep: Dispatch<SetStateAction<number>>;
}) {
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

      switch (action) {
        case "toggle-play":
          setIsPlaying((value) => !value);
          event.preventDefault();
          break;
        case "step-forward":
          setStep((value) => Math.min(value + 1, timeline.length - 1));
          event.preventDefault();
          break;
        case "step-back":
          setStep((value) => Math.max(value - 1, 0));
          event.preventDefault();
          break;
        case "restart":
          setIsPlaying(false);
          setStep(0);
          setScenario("baseline");
          event.preventDefault();
          break;
        case "open-config":
          setConfigOpen((value) => !value);
          event.preventDefault();
          break;
        case "close-config":
          if (configOpen) {
            setConfigOpen(false);
            event.preventDefault();
          }
          break;
        case "open-shortcuts-tab":
          setConfigTab("shortcuts");
          setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-scenarios":
          setConfigTab("scenarios");
          setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-parameters":
          setConfigTab("parameters");
          setConfigOpen(true);
          event.preventDefault();
          break;
        case "tab-shortcuts":
          setConfigTab("shortcuts");
          setConfigOpen(true);
          event.preventDefault();
          break;
        case "toggle-expand":
          setConfigOpen(true);
          setIsDialogExpanded((value) => !value);
          event.preventDefault();
          break;
        case "save-config":
          setConfigOpen(false);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    configOpen,
    setConfigOpen,
    setConfigTab,
    setIsDialogExpanded,
    setIsPlaying,
    setScenario,
    setStep,
  ]);
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
