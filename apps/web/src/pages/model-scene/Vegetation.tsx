import { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Tree } from "@/src/lib/ez-tree";

type EzTreeConfig = {
  preset: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  seed: number;
  leafTint: number;
};

type EzTreeTextures = {
  bark: {
    color: THREE.Texture;
    ao: THREE.Texture;
    normal: THREE.Texture;
    roughness: THREE.Texture;
  };
  leaves: {
    pine: THREE.Texture;
    aspen: THREE.Texture;
    oak: THREE.Texture;
  };
};

const BARK_TEXTURE_PATHS = [
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_Color.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_AmbientOcclusion.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_NormalGL.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_Roughness.jpg",
] as const;

function getLeafTexture(preset: string, textures: EzTreeTextures) {
  if (preset.includes("Aspen")) return textures.leaves.aspen;
  if (preset.includes("Oak")) return textures.leaves.oak;
  return textures.leaves.pine;
}

function createEzTree(
  { preset, position, rotationY, scale, seed, leafTint }: EzTreeConfig,
  textures: EzTreeTextures,
) {
  const tree = new Tree();
  tree.loadPreset(preset);
  tree.options.seed = seed;
  tree.options.bark.type = "Bark003";
  tree.options.bark.tint = 0xd8c2a2;
  tree.options.bark.maps.color = textures.bark.color;
  tree.options.bark.maps.ao = textures.bark.ao;
  tree.options.bark.maps.normal = textures.bark.normal;
  tree.options.bark.maps.roughness = textures.bark.roughness;
  tree.options.leaves.map = getLeafTexture(preset, textures);
  tree.options.leaves.tint = leafTint;
  tree.generate();
  tree.position.set(...position);
  tree.rotation.y = rotationY;
  tree.scale.setScalar(scale);
  tree.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return tree;
}

export function EzTreeForest() {
  const [
    barkColor,
    barkAo,
    barkNormal,
    barkRoughness,
    pineLeaf,
    aspenLeaf,
    oakLeaf,
  ] = useLoader(THREE.TextureLoader, [
    ...BARK_TEXTURE_PATHS,
    "/assets/ez-tree/textures/leaves/pine.png",
    "/assets/ez-tree/textures/leaves/aspen.png",
    "/assets/ez-tree/textures/leaves/oak.png",
  ]);

  const forest = useMemo(() => {
    const group = new THREE.Group();
    const textures = {
      bark: {
        color: barkColor,
        ao: barkAo,
        normal: barkNormal,
        roughness: barkRoughness,
      },
      leaves: { pine: pineLeaf, aspen: aspenLeaf, oak: oakLeaf },
    };
    const configs: EzTreeConfig[] = Array.from({ length: 30 }, (_, index) => {
      const row = index % 3;
      const x = -6.25 + index * 0.43 + Math.sin(index * 1.7) * 0.12;
      const z = -3.0 - row * 0.24 + Math.cos(index * 0.8) * 0.08;
      const preset =
        index % 4 === 0
          ? "Pine Small"
          : index % 5 === 0
            ? "Aspen Small"
            : "Pine Medium";
      const scale = preset === "Pine Medium" ? 0.021 : 0.026;

      return {
        preset,
        position: [x, 0.12, z],
        rotationY: (index * 2.399963) % (Math.PI * 2),
        scale: scale * (0.84 + ((index * 13) % 8) * 0.035),
        seed: 1240 + index * 73,
        leafTint: index % 5 === 0 ? 0x6fa15d : 0x2f7a46,
      };
    });

    configs.forEach((config) => group.add(createEzTree(config, textures)));
    return group;
  }, [
    aspenLeaf,
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

export function ForegroundShrubs() {
  const [barkColor, barkAo, barkNormal, barkRoughness, oakLeaf] = useLoader(
    THREE.TextureLoader,
    [...BARK_TEXTURE_PATHS, "/assets/ez-tree/textures/leaves/oak.png"],
  );

  const shrubs = useMemo(() => {
    const group = new THREE.Group();
    const textures = {
      bark: {
        color: barkColor,
        ao: barkAo,
        normal: barkNormal,
        roughness: barkRoughness,
      },
      leaves: { pine: oakLeaf, aspen: oakLeaf, oak: oakLeaf },
    };
    const configs: EzTreeConfig[] = [
      {
        preset: "Bush 1",
        position: [-5.1, 0.04, 3.45],
        rotationY: 0.3,
        scale: 0.042,
        seed: 721,
        leafTint: 0x7aa33b,
      },
      {
        preset: "Bush 2",
        position: [-4.35, 0.04, 3.92],
        rotationY: 1.8,
        scale: 0.034,
        seed: 833,
        leafTint: 0xb7bf3b,
      },
      {
        preset: "Bush 3",
        position: [-3.55, 0.04, 3.5],
        rotationY: 2.9,
        scale: 0.038,
        seed: 977,
        leafTint: 0x5d8d42,
      },
      {
        preset: "Bush 1",
        position: [-2.78, 0.04, 4.02],
        rotationY: 4.2,
        scale: 0.028,
        seed: 1044,
        leafTint: 0xc33f2c,
      },
      {
        preset: "Bush 2",
        position: [3.1, 0.04, 3.8],
        rotationY: 2.1,
        scale: 0.035,
        seed: 1180,
        leafTint: 0x6f9b42,
      },
      {
        preset: "Bush 3",
        position: [3.82, 0.04, 3.35],
        rotationY: 0.8,
        scale: 0.041,
        seed: 1292,
        leafTint: 0x9ab23f,
      },
      {
        preset: "Bush 1",
        position: [4.6, 0.04, 3.85],
        rotationY: 5.3,
        scale: 0.029,
        seed: 1408,
        leafTint: 0xd04b2d,
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
