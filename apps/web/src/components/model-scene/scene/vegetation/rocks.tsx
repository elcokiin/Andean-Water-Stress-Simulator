import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { PlacedAssetSpec } from "@/src/lib/hydrosim/types";
import { ROCK_MODEL_PATHS } from "./textures";
import { cloneSceneAsset, configureDracoLoader } from "./helpers";

export function EzTreeRocks({
  rocks,
  terrainSampler,
}: {
  rocks: PlacedAssetSpec[];
  terrainSampler: TerrainSampler;
}) {
  const rockModels = useLoader(
    GLTFLoader,
    [...ROCK_MODEL_PATHS],
    configureDracoLoader,
  );

  const rocksGroup = useMemo(() => {
    const group = new THREE.Group();

    rocks.forEach(({ model, position, rotationY, scale }) => {
      group.add(
        cloneSceneAsset(rockModels[model].scene, {
          position,
          rotationY,
          scale,
          terrainSampler,
          groundOffset: 0.012,
        }),
      );
    });

    return group;
  }, [rockModels, rocks, terrainSampler]);

  return <primitive object={rocksGroup} />;
}
