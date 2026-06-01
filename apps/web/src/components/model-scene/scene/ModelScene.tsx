import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";

import { createTerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { CitySceneConfig } from "@/src/lib/hydrosim/types";
import { CloudGroup } from "./CloudGroup";
import { TerrainMesh } from "./Terrain";
import { ReservoirWater } from "./Water";
import { ModelEnvironment, ModelLighting, ModelSky } from "./sky";

type SceneTheme = "light" | "dark";

export function ModelScene({
  autoRotate = false,
  city,
  showWater = city.reservoir.visible,
  theme,
  waterLevel = 1,
}: {
  autoRotate?: boolean;
  city: CitySceneConfig;
  showWater?: boolean;
  theme: SceneTheme;
  waterLevel?: number;
}) {
  const isNight = theme === "dark";
  const fogColor = isNight ? "#10243d" : "#a9d9ef";
  const fogDensity = isNight ? 0.058 : 0.052;
  const terrainSampler = useMemo(
    () =>
      createTerrainSampler({
        terrain: city.terrain,
        reservoir: city.reservoir,
      }),
    [city],
  );

  return (
    <>
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
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
