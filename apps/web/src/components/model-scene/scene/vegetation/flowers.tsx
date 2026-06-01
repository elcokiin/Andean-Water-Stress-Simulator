import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { PlacedAssetSpec } from "@/src/lib/hydrosim/types";
import { FLOWER_MODEL_PATHS } from "./textures";
import { cloneSceneAsset, isInsidePlacedAssetFootprint } from "./helpers";

export function EzTreeFlowers({
  avoidAssets,
  flowers,
  terrainSampler,
}: {
  avoidAssets: PlacedAssetSpec[];
  flowers: PlacedAssetSpec[];
  terrainSampler: TerrainSampler;
}) {
  const flowerModels = useLoader(GLTFLoader, [...FLOWER_MODEL_PATHS]);

  const flowersGroup = useMemo(() => {
    const group = new THREE.Group();

    flowers
      .filter(
        ({ position: [x, z] }) =>
          !isInsidePlacedAssetFootprint(x, z, avoidAssets, 0.38),
      )
      .forEach(({ model, position, rotationY, scale }) => {
        group.add(
          cloneSceneAsset(flowerModels[model].scene, {
            position,
            rotationY,
            scale,
            terrainSampler,
            groundOffset: 0.018,
          }),
        );
      });

    return group;
  }, [avoidAssets, flowerModels, flowers, terrainSampler]);

  return <primitive object={flowersGroup} />;
}
