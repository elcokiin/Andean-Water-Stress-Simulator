import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./scene/ModelScene";

export function ModelViewport() {
  const { theme } = useTheme();
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const fogIntensity = useSimulationStore((s) => s.fogIntensity);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const waterVisibility = useSimulationStore((s) => s.waterVisibility);
  const simState = useSimulationStore((s) => s.simState);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const oniValue = useSimulationStore((s) => s.oniValue);
  const city = getCitySceneConfig(reservoir);
  const showWater = waterVisibility[reservoir] ?? city.reservoir.visible;

  const waterLevel = useMemo(() => {
    const scaled = simState.reservoirPct / 100;
    return Math.max(scaled, 0.24);
  }, [simState.reservoirPct]);

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
          waterLevel={waterLevel}
          rainMm={rainValue}
          oni={oniValue}
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
