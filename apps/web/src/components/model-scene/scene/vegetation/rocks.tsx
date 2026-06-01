import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { ROCK_MODEL_PATHS } from "./textures";
import { cloneSceneAsset, configureDracoLoader } from "./helpers";

export function EzTreeRocks() {
  const rockModels = useLoader(
    GLTFLoader,
    [...ROCK_MODEL_PATHS],
    configureDracoLoader,
  );

  const rocks = useMemo(() => {
    const group = new THREE.Group();
    const rockSpecs = [
      { model: 0, position: [-3.75, 2.28], rotationY: 0.75, scale: 0.18 },
      { model: 2, position: [-2.85, 2.75], rotationY: 2.3, scale: 0.14 },
      { model: 1, position: [4.45, 2.55], rotationY: 3.75, scale: 0.17 },
      { model: 0, position: [2.95, 2.95], rotationY: 5.35, scale: 0.13 },
      { model: 2, position: [-3.85, -2.12], rotationY: 1.45, scale: 0.15 },
      { model: 1, position: [4.1, -2.05], rotationY: 4.2, scale: 0.14 },
    ] as const;

    rockSpecs.forEach(({ model, position, rotationY, scale }) => {
      group.add(
        cloneSceneAsset(rockModels[model].scene, {
          position,
          rotationY,
          scale,
          groundOffset: 0.012,
        }),
      );
    });

    return group;
  }, [rockModels]);

  return <primitive object={rocks} />;
}
