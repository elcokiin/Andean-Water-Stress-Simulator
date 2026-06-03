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

function ModelLoadingOverlay({
  cityName,
  theme,
}: {
  cityName: string;
  theme: "light" | "dark";
}) {
  const isNight = theme === "dark";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-6"
      aria-live="polite"
      aria-label="Cargando modelo 3D"
    >
      <div
        className={`relative w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-[10px] border px-5 py-5 shadow-2xl backdrop-blur-xl ${
          isNight
            ? "border-cyan-100/18 bg-[#061421]/82 text-sky-50 shadow-cyan-950/50"
            : "border-sky-900/12 bg-[#f3fbff]/82 text-slate-950 shadow-sky-950/12"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isNight
              ? "bg-[linear-gradient(145deg,rgba(8,28,52,0.38),rgba(2,8,23,0.78)),radial-gradient(ellipse_at_20%_18%,rgba(34,211,238,0.15),transparent_48%),radial-gradient(ellipse_at_86%_74%,rgba(59,130,246,0.12),transparent_50%)]"
              : "bg-[linear-gradient(145deg,rgba(240,249,255,0.78),rgba(224,242,254,0.44)),radial-gradient(ellipse_at_18%_20%,rgba(14,165,233,0.16),transparent_46%),radial-gradient(ellipse_at_82%_78%,rgba(45,212,191,0.14),transparent_48%)]"
          }`}
        />
        <div
          className={`absolute inset-x-5 top-0 h-px ${
            isNight
              ? "bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent"
              : "bg-gradient-to-r from-transparent via-sky-600/45 to-transparent"
          }`}
        />

        <div className="relative grid gap-5">
          <div className="flex items-center gap-4">
            <div className="relative grid size-24 shrink-0 place-items-center">
              <div
                className={`absolute inset-0 rounded-full border ${
                  isNight ? "border-cyan-100/18" : "border-sky-900/12"
                }`}
              />
              <div
                className={`absolute inset-2 animate-[spin_7s_linear_infinite] rounded-full border border-dashed ${
                  isNight ? "border-cyan-100/30" : "border-sky-900/20"
                }`}
              />
              <div
                className={`absolute inset-5 animate-[spin_5s_linear_infinite_reverse] rounded-full border ${
                  isNight ? "border-blue-200/22" : "border-cyan-700/20"
                }`}
              />
              <div
                className={`absolute h-16 w-4 -rotate-45 rounded-full blur-[1px] ${
                  isNight
                    ? "bg-gradient-to-b from-cyan-100/0 via-cyan-200/70 to-blue-400/0"
                    : "bg-gradient-to-b from-sky-700/0 via-sky-700/55 to-cyan-500/0"
                }`}
              />
              <div
                className={`absolute left-7 top-8 size-2 animate-pulse rounded-full ${
                  isNight ? "bg-cyan-100" : "bg-sky-700"
                }`}
              />
              <div
                className={`absolute right-7 bottom-7 size-1.5 animate-pulse rounded-full [animation-delay:350ms] ${
                  isNight ? "bg-blue-200" : "bg-cyan-700"
                }`}
              />
              <div
                className={`relative size-8 rounded-full border ${
                  isNight
                    ? "border-cyan-100/45 bg-cyan-200/18 shadow-[0_0_30px_rgba(103,232,249,0.28)]"
                    : "border-sky-700/35 bg-sky-600/12 shadow-[0_0_26px_rgba(14,116,144,0.18)]"
                }`}
              >
                <div
                  className={`absolute inset-x-1 bottom-1 h-3 rounded-b-full hydro-loader-wave ${
                    isNight ? "bg-cyan-200/50" : "bg-sky-700/35"
                  }`}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-[0.62rem] font-semibold uppercase tracking-[0.22em] ${
                  isNight ? "text-cyan-100/62" : "text-sky-900/55"
                }`}
              >
                Modelo hidrológico
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal">
                Cuenca {cityName}
              </h2>
              <p
                className={`mt-1 text-sm ${
                  isNight ? "text-sky-100/70" : "text-slate-600"
                }`}
              >
                Sincronizando relieve, agua y vegetación
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <div
              className={`relative h-1.5 overflow-hidden rounded-full ${
                isNight ? "bg-cyan-100/10" : "bg-sky-900/10"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 w-2/3 rounded-full hydro-loader-shimmer ${
                  isNight
                    ? "bg-gradient-to-r from-cyan-300/10 via-cyan-100/85 to-blue-300/10"
                    : "bg-gradient-to-r from-sky-700/10 via-sky-700/70 to-cyan-600/10"
                }`}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-xs ${
                  isNight ? "text-sky-100/58" : "text-slate-500"
                }`}
              >
                Preparando simulación
              </span>
              <span className="flex items-center gap-1" aria-hidden>
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={`size-1.5 rounded-full hydro-loader-dot ${
                      isNight ? "bg-cyan-100/80" : "bg-sky-700/70"
                    }`}
                    style={{ animationDelay: `${index * 160}ms` }}
                  />
                ))}
              </span>
            </div>
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
      {!modelSceneReady ? (
        <ModelLoadingOverlay cityName={city.name} theme={theme} />
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
