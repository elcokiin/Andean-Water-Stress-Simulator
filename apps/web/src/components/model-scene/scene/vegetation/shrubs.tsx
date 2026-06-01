import { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { Tree } from "@/src/lib/ez-tree";
import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { PlacedAssetSpec, ShrubSpec } from "@/src/lib/hydrosim/types";
import { BARK_TEXTURE_PATHS, type EzTreeTextures } from "./textures";
import { createEzTree, isInsidePlacedAssetFootprint } from "./helpers";

export function ForegroundShrubs({
  avoidAssets,
  shrubs,
  terrainSampler,
}: {
  avoidAssets: PlacedAssetSpec[];
  shrubs: ShrubSpec[];
  terrainSampler: TerrainSampler;
}) {
  const [barkColor, barkAo, barkNormal, barkRoughness, oakLeaf] = useLoader(
    THREE.TextureLoader,
    [...BARK_TEXTURE_PATHS, "/assets/ez-tree/textures/leaves/oak.png"],
  );

  const shrubGroup = useMemo(() => {
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
    shrubs
      .filter(
        ({ position: [x, z] }) =>
          !isInsidePlacedAssetFootprint(x, z, avoidAssets, 0.5),
      )
      .forEach((config) => {
        const [x, z] = config.position;
        group.add(
          createEzTree(
            {
              ...config,
              position: [x, terrainSampler.getHeight(x, z), z],
            },
            textures,
          ),
        );
      });
    return group;
  }, [
    avoidAssets,
    barkAo,
    barkColor,
    barkNormal,
    barkRoughness,
    oakLeaf,
    shrubs,
    terrainSampler,
  ]);

  useFrame(({ clock }) => {
    shrubGroup.children.forEach((child) => {
      if (child instanceof Tree) {
        child.update(clock.elapsedTime);
      }
    });
  });

  return <primitive object={shrubGroup} />;
}
