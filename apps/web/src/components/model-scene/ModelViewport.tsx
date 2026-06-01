import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import { scenarios } from "@/src/lib/hydrosim/scenarios";
import { ModelScene } from "./scene/ModelScene";

export function ModelViewport() {
  const { theme } = useTheme();
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const fogIntensity = useSimulationStore((s) => s.fogIntensity);
  const scenario = useSimulationStore((s) => s.scenario);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const waterVisibility = useSimulationStore((s) => s.waterVisibility);
  const selectedScenario = scenarios[scenario];
  const city = getCitySceneConfig(reservoir);
  const showWater = waterVisibility[reservoir] ?? city.reservoir.visible;

  const reservoirScale = useMemo(
    () => Math.max(selectedScenario.reserve / 68, 0.24),
    [selectedScenario.reserve],
  );

  return (
    <div className="absolute inset-0">
      <Canvas
        key={city.id}
        camera={{ position: city.camera.position, fov: city.camera.fov }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        shadows
      >
        <ModelScene
          autoRotate={isPlaying}
          city={city}
          showWater={showWater}
          fogIntensity={fogIntensity}
          theme={theme}
          waterLevel={reservoirScale}
        />
      </Canvas>
      <div
        className={`model-viewport-mist ${
          theme === "dark" ? "model-viewport-mist-dark" : ""
        }`}
        style={{ opacity: Math.min(Math.max(fogIntensity, 0), 1) }}
      />
    </div>
  );
}
