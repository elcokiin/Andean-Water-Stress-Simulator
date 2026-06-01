import { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { Tree } from "@/src/lib/ez-tree";
import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";
import { BARK_TEXTURE_PATHS, type EzTreeTextures } from "./textures";
import { createEzTree, type EzTreeConfig } from "./helpers";

export function ForegroundShrubs() {
  const [barkColor, barkAo, barkNormal, barkRoughness, oakLeaf] = useLoader(
    THREE.TextureLoader,
    [...BARK_TEXTURE_PATHS, "/assets/ez-tree/textures/leaves/oak.png"],
  );

  const shrubs = useMemo(() => {
    const group = new THREE.Group();
    const textures: EzTreeTextures = {
      bark: {
        color: barkColor,
        ao: barkAo,
        normal: barkNormal,
        roughness: barkRoughness,
      },
      leaves: { ash: oakLeaf, pine: oakLeaf, aspen: oakLeaf, oak: oakLeaf },
    };
    const configs: EzTreeConfig[] = [
      {
        preset: "Bush 1",
        position: [-5.1, getTerrainHeight(-5.1, 3.45), 3.45],
        rotationY: 0.3,
        scale: 0.042,
        seed: 721,
        leafTint: 0x7aa33b,
      },
      {
        preset: "Bush 2",
        position: [-4.35, getTerrainHeight(-4.35, 3.92), 3.92],
        rotationY: 1.8,
        scale: 0.034,
        seed: 833,
        leafTint: 0xb7bf3b,
      },
      {
        preset: "Bush 3",
        position: [-3.55, getTerrainHeight(-3.55, 3.5), 3.5],
        rotationY: 2.9,
        scale: 0.038,
        seed: 977,
        leafTint: 0x5d8d42,
      },
      {
        preset: "Bush 1",
        position: [-2.78, getTerrainHeight(-2.78, 4.02), 4.02],
        rotationY: 4.2,
        scale: 0.028,
        seed: 1044,
        leafTint: 0x536f3b,
      },
      {
        preset: "Bush 2",
        position: [3.1, getTerrainHeight(3.1, 3.8), 3.8],
        rotationY: 2.1,
        scale: 0.035,
        seed: 1180,
        leafTint: 0x6f9b42,
      },
      {
        preset: "Bush 3",
        position: [3.82, getTerrainHeight(3.82, 3.35), 3.35],
        rotationY: 0.8,
        scale: 0.041,
        seed: 1292,
        leafTint: 0x9ab23f,
      },
      {
        preset: "Bush 1",
        position: [4.6, getTerrainHeight(4.6, 3.85), 3.85],
        rotationY: 5.3,
        scale: 0.029,
        seed: 1408,
        leafTint: 0x6f7540,
      },
    ];

    configs.forEach((config) => group.add(createEzTree(config, textures)));
    return group;
  }, [barkAo, barkColor, barkNormal, barkRoughness, oakLeaf]);

  useFrame(({ clock }) => {
    shrubs.children.forEach((child) => {
      if (child instanceof Tree) {
        child.update(clock.elapsedTime);
      }
    });
  });

  return <primitive object={shrubs} />;
}
