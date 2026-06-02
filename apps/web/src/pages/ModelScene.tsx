import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";

import {
  ControlsPanel,
  ModelConfigDialog,
  ModelViewport,
  TitleBar,
  ChartsPanel,
  FireEventToast,
  useModelKeyboardShortcuts,
  useSimulationEngine,
} from "@/src/components/model-scene";
import { isCitySceneId } from "@/src/lib/hydrosim/city-scenes";
import type { ReservoirId } from "@/src/lib/hydrosim/types";

export default function ModelScene() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const reservoir = useSimulationStore((s) => s.reservoir);
  const setReservoir = useSimulationStore((s) => s.setReservoir);

  useModelKeyboardShortcuts();
  useSimulationEngine();

  useEffect(() => {
    if (cityId && !isCitySceneId(cityId)) {
      navigate("/model", { replace: true });
      return;
    }

    const nextReservoir: ReservoirId = isCitySceneId(cityId) ? cityId : "tunja";
    if (reservoir !== nextReservoir) {
      setReservoir(nextReservoir);
    }
  }, [cityId, navigate, reservoir, setReservoir]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-screen w-screen overflow-hidden bg-background font-sans">
        <ModelViewport />
        <TitleBar />
        <ControlsPanel />
        <ChartsPanel />
        <FireEventToast />
        <ModelConfigDialog />
      </div>
    </TooltipProvider>
  );
}
