import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { FLOWER_MODEL_PATHS } from "./textures";
import { cloneSceneAsset } from "./helpers";

export function EzTreeFlowers() {
  const flowerModels = useLoader(GLTFLoader, [...FLOWER_MODEL_PATHS]);

  const flowers = useMemo(() => {
    const group = new THREE.Group();
    const flowerSpecs = [
      { model: 2, position: [-2.65, 2.9], rotationY: 0.2, scale: 0.085 },
      { model: 0, position: [-2.18, 3.18], rotationY: 1.7, scale: 0.078 },
      { model: 1, position: [-1.55, 3.02], rotationY: 3.2, scale: 0.08 },
      { model: 2, position: [-0.88, 3.36], rotationY: 5.4, scale: 0.072 },
      { model: 0, position: [1.25, 3.12], rotationY: 0.8, scale: 0.082 },
      { model: 1, position: [1.92, 2.78], rotationY: 2.6, scale: 0.074 },
      { model: 2, position: [2.58, 3.24], rotationY: 4.7, scale: 0.086 },
      { model: 0, position: [3.28, 2.62], rotationY: 1.2, scale: 0.076 },
      { model: 1, position: [-3.42, -2.28], rotationY: 3.9, scale: 0.078 },
      { model: 2, position: [3.55, -2.18], rotationY: 2.1, scale: 0.08 },
    ] as const;

    flowerSpecs.forEach(({ model, position, rotationY, scale }) => {
      group.add(
        cloneSceneAsset(flowerModels[model].scene, {
          position,
          rotationY,
          scale,
          groundOffset: 0.018,
        }),
      );
    });

    return group;
  }, [flowerModels]);

  return <primitive object={flowers} />;
}
