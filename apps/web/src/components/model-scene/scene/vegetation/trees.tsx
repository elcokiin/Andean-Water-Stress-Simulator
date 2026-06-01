import { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { Tree } from "@/src/lib/ez-tree";
import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";
import { FOREST_TEXTURE_PATHS, type EzTreeTextures } from "./textures";
import { createEzTree, seededRandom, type EzTreeConfig } from "./helpers";

export function EzTreeForest() {
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
    const makeConfig = (
      index: number,
      x: number,
      z: number,
      scaleBoost = 1,
    ): EzTreeConfig => {
      const preset =
        index % 6 === 0
          ? "Oak Medium"
          : index % 4 === 0
            ? "Ash Medium"
            : index % 2 === 0
              ? "Oak Small"
              : "Ash Small";
      const scale = preset.includes("Medium") ? 0.018 : 0.023;

      return {
        preset,
        position: [x, getTerrainHeight(x, z), z],
        rotationY: (index * 2.399963) % (Math.PI * 2),
        scale: scale * scaleBoost * (0.84 + ((index * 13) % 8) * 0.035),
        seed: 1240 + index * 73,
        leafTint:
          index % 9 === 0
            ? 0x7e9a3d
            : index % 5 === 0
              ? 0x6fa15d
              : index % 3 === 0
                ? 0x4f7f48
                : 0x2f7a46,
      };
    };

    const backgroundTrees = Array.from({ length: 84 }, (_, index) => {
      const row = index % 6;
      const column = Math.floor(index / 5);
      const side = index % 2 === 0 ? -1 : 1;
      const x =
        side * (2.35 + column * 0.25 + Math.sin(index * 1.7) * 0.2) +
        Math.cos(index * 0.53) * 0.12;
      const z = -3.08 - row * 0.24 + Math.cos(index * 0.8) * 0.11;
      return makeConfig(index, x, z);
    });

    const hillsideTrees = Array.from({ length: 34 }, (_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const x =
        side * (4.15 + seededRandom(index * 4.7) * 2.55) +
        Math.sin(index * 1.2) * 0.18;
      const z = -1.95 + seededRandom(index * 8.3) * 4.35;
      return makeConfig(index + 100, x, z, 0.82);
    }).filter(({ position: [x, , z] }) => !isReservoirFootprint(x, z));

    const shoreTrees = Array.from({ length: 20 }, (_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (5.7 + seededRandom(index * 6.1) * 1.65);
      const z = -0.55 + seededRandom(index * 10.9) * 2.35;
      return makeConfig(index + 200, x, z, 0.74);
    }).filter(({ position: [x, , z] }) => !isReservoirFootprint(x, z));

    const configs = [...backgroundTrees, ...hillsideTrees, ...shoreTrees];

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

function isReservoirFootprint(x: number, z: number) {
  const normalizedX = x / 5.95;
  const normalizedZ = (z - 0.3) / 2.45;
  return normalizedX * normalizedX + normalizedZ * normalizedZ < 1.02;
}
