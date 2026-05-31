import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { scenarios } from "./model-data";
import { TunjaScene } from "./TunjaScene";

export function ModelViewport() {
  const { theme } = useTheme();
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const scenario = useSimulationStore((s) => s.scenario);
  const selectedScenario = scenarios[scenario];

  const reservoirScale = useMemo(
    () => Math.max(selectedScenario.reserve / 68, 0.24),
    [selectedScenario.reserve],
  );

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [6.8, 3.3, 6.8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <TunjaScene
          autoRotate={isPlaying}
          theme={theme}
          waterLevel={reservoirScale}
        />
      </Canvas>
    </div>
  );
}
