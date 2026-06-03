import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./scene/ModelScene";

function SceneReadyMarker() {
  const setModelSceneReady = useSimulationStore((s) => s.setModelSceneReady);

  useEffect(() => {
    let animationFrame = 0;
    let nestedAnimationFrame = 0;

    animationFrame = window.requestAnimationFrame(() => {
      nestedAnimationFrame = window.requestAnimationFrame(() => {
        setModelSceneReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(nestedAnimationFrame);
    };
  }, [setModelSceneReady]);

  return null;
}

function ModelLoadingOverlay({ theme }: { theme: "light" | "dark" }) {
  const isNight = theme === "dark";

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-6">
      <div
        className={`relative grid place-items-center rounded-[10px] border px-5 py-4 shadow-2xl backdrop-blur-md ${
          isNight
            ? "border-sky-200/20 bg-[#081527]/75 text-sky-50"
            : "border-sky-900/10 bg-sky-50/78 text-slate-900"
        }`}
      >
        <div className="absolute inset-0 rounded-[10px] bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.24),transparent_62%)]" />
        <div className="relative flex items-center gap-4">
          <div className="relative size-12">
            <div
              className={`absolute inset-0 rounded-full border ${
                isNight ? "border-sky-100/20" : "border-sky-900/15"
              }`}
            />
            <div
              className={`absolute inset-1 animate-spin rounded-full border-2 border-transparent ${
                isNight ? "border-t-cyan-200" : "border-t-sky-700"
              }`}
            />
            <div
              className={`absolute inset-3 rounded-full ${
                isNight ? "bg-cyan-200/80" : "bg-sky-700/85"
              }`}
            />
            <div
              className={`absolute right-1 bottom-2 left-1 h-3 rounded-b-full ${
                isNight ? "bg-blue-300/35" : "bg-cyan-600/25"
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Preparando cuenca 3D</p>
            <p
              className={`text-xs ${
                isNight ? "text-sky-100/72" : "text-slate-600"
              }`}
            >
              Cargando relieve, agua y vegetación
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelViewport() {
  const { theme } = useTheme();
  const configOpen = useSimulationStore((s) => s.configOpen);
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const fogIntensity = useSimulationStore((s) => s.fogIntensity);
  const modelSceneReady = useSimulationStore((s) => s.modelSceneReady);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const waterVisibility = useSimulationStore((s) => s.waterVisibility);
  const simState = useSimulationStore((s) => s.simState);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const oniValue = useSimulationStore((s) => s.oniValue);
  const city = getCitySceneConfig(reservoir);
  const showWater = waterVisibility[reservoir] ?? city.reservoir.visible;
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [sceneMountAttempt, setSceneMountAttempt] = useState(0);
  const setModelSceneReady = useSimulationStore((s) => s.setModelSceneReady);

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
    setShouldMountScene(false);
    setModelSceneReady(false);
    setSceneMountAttempt((attempt) => attempt + 1);
  }, [city.id, setModelSceneReady]);

  useEffect(() => {
    if (shouldMountScene) return;

    const deferSceneMount = () =>
      setSceneMountAttempt((attempt) => attempt + 1);
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
            <SceneReadyMarker />
          </Suspense>
        </Canvas>
      ) : null}
      {!modelSceneReady ? <ModelLoadingOverlay theme={theme} /> : null}
      <div
        className={`model-viewport-mist ${
          theme === "dark" ? "model-viewport-mist-dark" : ""
        }`}
        style={{ opacity: Math.min(Math.max(fogIntensity, 0), 1) }}
      />
    </div>
  );
}
