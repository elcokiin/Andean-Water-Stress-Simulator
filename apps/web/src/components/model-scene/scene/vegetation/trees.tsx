import { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { Tree } from "@/src/lib/ez-tree";
import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { PlacedAssetSpec, TreeZone } from "@/src/lib/hydrosim/types";
import { FOREST_TEXTURE_PATHS, type EzTreeTextures } from "./textures";
import {
  createEzTree,
  isInsidePlacedAssetFootprint,
  seededRandom,
  type EzTreeConfig,
} from "./helpers";

export function EzTreeForest({
  avoidAssets,
  terrainSampler,
  treeZones,
}: {
  avoidAssets: PlacedAssetSpec[];
  terrainSampler: TerrainSampler;
  treeZones: TreeZone[];
}) {
  const [
    barkColor,
    barkAo,
    barkNormal,
    barkRoughness,
    ashLeaf,
    pineLeaf,
    aspenLeaf,
    oakLeaf,
  ] = useLoader(THREE.TextureLoader, [...FOREST_TEXTURE_PATHS]);

  const forest = useMemo(() => {
    const group = new THREE.Group();
    const textures: EzTreeTextures = {
      bark: {
        color: barkColor,
        ao: barkAo,
        normal: barkNormal,
        roughness: barkRoughness,
      },
      leaves: { ash: ashLeaf, pine: pineLeaf, aspen: aspenLeaf, oak: oakLeaf },
    };
    const makeConfig = (index: number, zone: TreeZone): EzTreeConfig => {
      const x =
        zone.xRange[0] +
        seededRandom(zone.seed + index * 4.7) *
          (zone.xRange[1] - zone.xRange[0]);
      const z =
        zone.zRange[0] +
        seededRandom(zone.seed + index * 8.3) *
          (zone.zRange[1] - zone.zRange[0]);
      const preset = zone.presets[index % zone.presets.length];
      const scale = preset.includes("Medium") ? 0.018 : 0.023;

      return {
        preset,
        position: [x, terrainSampler.getHeight(x, z), z],
        rotationY: (index * 2.399963) % (Math.PI * 2),
        scale: scale * zone.scaleBoost * (0.84 + ((index * 13) % 8) * 0.035),
        seed: zone.seed + index * 73,
        leafTint: zone.leafTints[index % zone.leafTints.length],
      };
    };

    const configs = treeZones.flatMap((zone, zoneIndex) =>
      Array.from({ length: zone.count }, (_, index) =>
        makeConfig(index + zoneIndex * 1000, zone),
      ).filter(
        ({ position: [x, , z] }) =>
          (!zone.avoidReservoir ||
            !terrainSampler.isReservoirFootprint(x, z)) &&
          !isInsidePlacedAssetFootprint(x, z, avoidAssets, 0.58),
      ),
    );

    configs.forEach((config) => group.add(createEzTree(config, textures)));
    return group;
  }, [
    aspenLeaf,
    ashLeaf,
    barkAo,
    barkColor,
    barkNormal,
    barkRoughness,
    oakLeaf,
    pineLeaf,
    avoidAssets,
    terrainSampler,
    treeZones,
  ]);

  useFrame(({ clock }) => {
    forest.children.forEach((child) => {
      if (child instanceof Tree) {
        child.update(clock.elapsedTime);
      }
    });
  });

  return <primitive object={forest} />;
}
