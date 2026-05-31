import { TooltipProvider } from "@/components/ui/tooltip";

import { ControlsPanel } from "./model-scene/ControlsPanel";
import { ModelConfigDialog } from "./model-scene/ModelConfigDialog";
import { ModelViewport } from "./model-scene/ModelViewport";
import { TitleBar } from "./model-scene/TitleBar";
import { useModelKeyboardShortcuts } from "./model-scene/use-model-keyboard-shortcuts";

export default function ModelScene() {
  useModelKeyboardShortcuts();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-screen w-screen overflow-hidden bg-background font-sans">
        <ModelViewport />
        <TitleBar />
        <ControlsPanel />
        <ModelConfigDialog />
      </div>
    </TooltipProvider>
  );
}
