import { TooltipProvider } from "@/components/ui/tooltip";

import {
  ControlsPanel,
  ModelConfigDialog,
  ModelViewport,
  TitleBar,
  useModelKeyboardShortcuts,
} from "@/src/components/model-scene";

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
