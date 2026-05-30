import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import type { Scenario } from "./model-data";
import { TunjaScene } from "./TunjaScene";

export function ModelViewport({
  isPlaying,
  selectedScenario,
}: {
  isPlaying: boolean;
  selectedScenario: Scenario;
}) {
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
        <TunjaScene autoRotate={isPlaying} waterLevel={reservoirScale} />
      </Canvas>
    </div>
  );
}
