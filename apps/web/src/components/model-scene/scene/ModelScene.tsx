import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";

import { createTerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import { getRainIntensity } from "@/src/lib/hydrosim/rain-intensity";
import type { CitySceneConfig } from "@/src/lib/hydrosim/types";
import { Rain, type RainRippleTarget } from "./Rain";
import { TerrainMesh } from "./Terrain";
import { ReservoirWater, type WaterSimHandle } from "./Water";
import {
  ModelEnvironment,
  ModelLighting,
  ModelSky,
  getSunDirection,
} from "./sky";

type SceneTheme = "light" | "dark";

const RAIN_GROUND_OFFSET = 0.05;
const WATER_PLANE_MARGIN = 1.2;

export function ModelScene({
  autoRotate = false,
  city,
  fogIntensity = 1,
  showWater = city.reservoir.visible,
  theme,
  waterLevel = 1,
  rainMm = 0,
  oni = 0,
}: {
  autoRotate?: boolean;
  city: CitySceneConfig;
  fogIntensity?: number;
  showWater?: boolean;
  theme: SceneTheme;
  waterLevel?: number;
  rainMm?: number;
  oni?: number;
}) {
  const isNight = theme === "dark";
  const fogColor = isNight ? "#0c1c34" : "#c4dfe9";
  const fogDensity = (isNight ? 0.024 : 0.018) * fogIntensity;
  const sunDirection = useMemo(() => getSunDirection(theme), [theme]);
  const terrainSampler = useMemo(
    () =>
      createTerrainSampler({
        terrain: city.terrain,
        reservoir: city.reservoir,
      }),
    [city],
  );
  const rainIntensity = useMemo(
    () => getRainIntensity({ rainMm, oni }).value,
    [rainMm, oni],
  );

  const simHandleRef = useRef<WaterSimHandle | null>(null);
  const handleSimReady = useCallback((handle: WaterSimHandle) => {
    simHandleRef.current = handle;
  }, []);

  const rippleTarget = useMemo<RainRippleTarget | null>(() => {
    if (!showWater) return null;
    const halfWidth = city.terrain.width * WATER_PLANE_MARGIN * 0.5;
    const halfDepth = city.terrain.depth * WATER_PLANE_MARGIN * 0.5;
    const waterElevation =
      city.reservoir.elevationBase + waterLevel * city.reservoir.elevationRange;
    const surfaceYLocal =
      city.reservoir.position[1] + waterElevation - RAIN_GROUND_OFFSET;
    const centerX = city.reservoir.position[0];
    const centerZ = city.reservoir.position[2];
    const cosR = Math.cos(city.reservoir.rotationZ);
    const sinR = Math.sin(city.reservoir.rotationZ);

    return {
      surfaceYLocal,
      tryRipple: (worldX: number, worldZ: number) => {
        const handle = simHandleRef.current;
        if (!handle) return;
        const dx = worldX - centerX;
        const dz = worldZ - centerZ;
        const lx = dx * cosR - dz * sinR;
        const ly = -dx * sinR - dz * cosR;
        if (Math.abs(lx) > halfWidth || Math.abs(ly) > halfDepth) return;
        const u = 0.5 + lx / (2 * halfWidth);
        const v = 0.5 + ly / (2 * halfDepth);
        handle.addDropAtUV(u, v);
      },
    };
  }, [
    city.reservoir.elevationBase,
    city.reservoir.elevationRange,
    city.reservoir.position,
    city.reservoir.rotationZ,
    city.terrain.depth,
    city.terrain.width,
    showWater,
    waterLevel,
  ]);

  return (
    <>
      {fogIntensity > 0 ? (
        <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      ) : null}
      <ModelEnvironment theme={theme} />
      <ModelSky theme={theme} />
      <ModelLighting theme={theme} />
      {rainIntensity > 0 ? (
        <Rain
          intensity={rainIntensity}
          bounds={{ width: city.terrain.width, depth: city.terrain.depth }}
          night={isNight}
          rippleTarget={rippleTarget}
        />
      ) : null}
      <TerrainMesh
        terrain={city.terrain}
        terrainSampler={terrainSampler}
        vegetation={city.vegetation}
      />
      {showWater ? (
        <ReservoirWater
          level={waterLevel}
          reservoir={city.reservoir}
          terrainSampler={terrainSampler}
          terrainWidth={city.terrain.width}
          terrainDepth={city.terrain.depth}
          theme={theme}
          sunDirection={sunDirection}
          onSimReady={handleSimReady}
        />
      ) : null}
      <ContactShadows
        position={[0, 0.02, 0]}
        scale={13}
        opacity={isNight ? 0.12 : 0.24}
        blur={isNight ? 3.6 : 2.8}
        far={7}
        frames={1}
        resolution={256}
      />
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enableDamping
        enablePan={false}
        minDistance={city.camera.minDistance}
        maxDistance={city.camera.maxDistance}
        maxPolarAngle={city.camera.maxPolarAngle}
        target={city.camera.target}
      />
    </>
  );
}
