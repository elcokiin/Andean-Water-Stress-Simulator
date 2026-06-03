import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./scene/ModelScene";

export function ModelViewport() {
  const { theme } = useTheme();
  const configOpen = useSimulationStore((s) => s.configOpen);
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const fogIntensity = useSimulationStore((s) => s.fogIntensity);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const waterVisibility = useSimulationStore((s) => s.waterVisibility);
  const simState = useSimulationStore((s) => s.simState);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const oniValue = useSimulationStore((s) => s.oniValue);
  const city = getCitySceneConfig(reservoir);
  const showWater = waterVisibility[reservoir] ?? city.reservoir.visible;
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [sceneMountAttempt, setSceneMountAttempt] = useState(0);

  const waterLevel = useMemo(() => {
    const scaled = simState.reservoirPct / 100;
    return Math.max(scaled, 0.24);
  }, [simState.reservoirPct]);

  useEffect(() => {
    if (shouldMountScene || configOpen) return;

    let idleHandle: number | null = null;
    const timeoutHandle = globalThis.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(
          () => setShouldMountScene(true),
          { timeout: 1200 },
        );
        return;
      }

      setShouldMountScene(true);
    }, 650);

    return () => {
      globalThis.clearTimeout(timeoutHandle);
      if (idleHandle !== null) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [configOpen, sceneMountAttempt, shouldMountScene]);

  useEffect(() => {
    if (shouldMountScene) return;

    const deferSceneMount = () => setSceneMountAttempt((attempt) => attempt + 1);
    window.addEventListener("pointerdown", deferSceneMount, { capture: true });
    window.addEventListener("keydown", deferSceneMount, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", deferSceneMount, {
        capture: true,
      });
      window.removeEventListener("keydown", deferSceneMount, { capture: true });
    };
  }, [shouldMountScene]);

  return (
    <div className="absolute inset-0" data-tour="model-viewport">
      {shouldMountScene ? (
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
          <Suspense fallback={null}>
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
          </Suspense>
        </Canvas>
      ) : null}
      <div
        className={`model-viewport-mist ${
          theme === "dark" ? "model-viewport-mist-dark" : ""
        }`}
        style={{ opacity: Math.min(Math.max(fogIntensity, 0), 1) }}
      />
    </div>
  );
}
