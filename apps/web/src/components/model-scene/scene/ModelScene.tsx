import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";

import { createTerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import { getRainIntensity } from "@/src/lib/hydrosim/rain-intensity";
import type { CitySceneConfig } from "@/src/lib/hydrosim/types";
import { CloudGroup } from "./CloudGroup";
import { Rain } from "./Rain";
import { TerrainMesh } from "./Terrain";
import { ReservoirWater } from "./Water";
import { ModelEnvironment, ModelLighting, ModelSky } from "./sky";

type SceneTheme = "light" | "dark";

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
  const fogColor = isNight ? "#10243d" : "#a9d9ef";
  const fogDensity = (isNight ? 0.026 : 0.022) * fogIntensity;
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

  return (
    <>
      {fogIntensity > 0 ? (
        <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      ) : null}
      <ModelEnvironment theme={theme} />
      <ModelSky theme={theme} />
      <ModelLighting theme={theme} />
      {city.clouds.map((cloud, index) => (
        <CloudGroup
          key={`${city.id}-cloud-${index}`}
          mode={isNight ? "night" : "day"}
          position={cloud.position}
          scale={cloud.scale}
        />
      ))}
      {rainIntensity > 0 ? (
        <Rain
          intensity={rainIntensity}
          bounds={{ width: city.terrain.width, depth: city.terrain.depth }}
          night={isNight}
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
