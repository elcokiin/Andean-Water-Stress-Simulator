import { useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { ControlsPanel } from "./model-scene/ControlsPanel";
import { ModelConfigDialog } from "./model-scene/ModelConfigDialog";
import { ModelViewport } from "./model-scene/ModelViewport";
import { TitleBar } from "./model-scene/TitleBar";
import { scenarios } from "./model-scene/model-data";
import type { ConfigTab, ScenarioId } from "./model-scene/model-data";
import { useModelKeyboardShortcuts } from "./model-scene/use-model-keyboard-shortcuts";

export default function ModelScene() {
  const [scenario, setScenario] = useState<ScenarioId>("baseline");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(1);
  const [configOpen, setConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState<ConfigTab>("scenarios");
  const [isDialogExpanded, setIsDialogExpanded] = useState(false);
  const selectedScenario = scenarios[scenario];

  useModelKeyboardShortcuts({
    configOpen,
    setConfigOpen,
    setConfigTab,
    setIsDialogExpanded,
    setIsPlaying,
    setScenario,
    setStep,
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-screen w-screen overflow-hidden bg-background font-sans">
        <ModelViewport
          isPlaying={isPlaying}
          selectedScenario={selectedScenario}
        />

        <TitleBar onOpenHelp={() => setConfigOpen(true)} />

        <ControlsPanel
          isPlaying={isPlaying}
          scenario={scenario}
          selectedScenario={selectedScenario}
          step={step}
          onConfigOpen={() => setConfigOpen(true)}
          onScenarioChange={setScenario}
          onTogglePlayback={() => setIsPlaying((value) => !value)}
        />

        <ModelConfigDialog
          configTab={configTab}
          isExpanded={isDialogExpanded}
          open={configOpen}
          scenario={scenario}
          selectedScenario={selectedScenario}
          onConfigTabChange={setConfigTab}
          onOpenChange={setConfigOpen}
          onScenarioChange={setScenario}
          onToggleExpanded={() => setIsDialogExpanded((value) => !value)}
        />
      </div>
    </TooltipProvider>
  );
}
