import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Tree } from "@/src/lib/ez-tree";
import { getTerrainHeight } from "./terrain-height";

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
    ash: THREE.Texture;
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

const GRASS_MODEL_PATH = "/assets/ez-tree/models/grass.glb";
const GRASS_COUNT = 2900;
const GRASS_MAX_COUNT = 5200;

type GrassShader = {
  uniforms: {
    uTime: { value: number };
  };
};

type GrassMaterial = THREE.MeshPhongMaterial & {
  userData: {
    grassShader?: GrassShader;
  };
};

function seededNoise(value: number) {
  return Math.sin(value * 12.9898) * 43758.5453;
}

function seededRandom(seed: number) {
  return seededNoise(seed) - Math.floor(seededNoise(seed));
}

function patchNoise(x: number, z: number) {
  const broad = Math.sin(x * 1.35 + z * 0.82) * 0.5 + 0.5;
  const fine = Math.sin(x * 4.2 - z * 3.1 + Math.sin(z * 1.7)) * 0.5 + 0.5;
  return broad * 0.72 + fine * 0.28;
}

function isReservoirFootprint(x: number, z: number) {
  const normalizedX = x / 5.95;
  const normalizedZ = (z - 0.3) / 2.45;
  return normalizedX * normalizedX + normalizedZ * normalizedZ < 1.02;
}

function appendGrassWindShader(material: GrassMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWindStrength = { value: new THREE.Vector3(0.11, 0, 0.08) };
    shader.uniforms.uWindFrequency = { value: 1.35 };
    shader.uniforms.uWindScale = { value: 3.8 };

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uWindStrength;
      uniform float uWindFrequency;
      uniform float uWindScale;
    ${shader.vertexShader}`;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
        vec4 instancedPosition = instanceMatrix * vec4(transformed, 1.0);
        float windPhase = sin((instancedPosition.x + instancedPosition.z) * uWindScale + uTime * uWindFrequency);
        float windCurl = cos((instancedPosition.x - instancedPosition.z) * 2.1 + uTime * 1.7);
        vec3 windSway = position.y * uWindStrength * windPhase * windCurl;

        instancedPosition.xyz += windSway;
        vec4 mvPosition = modelViewMatrix * instancedPosition;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      `,
    );

    material.userData.grassShader = shader as unknown as GrassShader;
  };
}

function findFirstMesh(object: THREE.Object3D): THREE.Mesh | null {
  let mesh: THREE.Mesh | null = null;
  object.traverse((child) => {
    if (!mesh && child instanceof THREE.Mesh) {
      mesh = child as THREE.Mesh;
    }
  });
  return mesh;
}

function getLeafTexture(preset: string, textures: EzTreeTextures) {
  if (preset.includes("Ash")) return textures.leaves.ash;
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
    ashLeaf,
    pineLeaf,
    aspenLeaf,
    oakLeaf,
  ] = useLoader(THREE.TextureLoader, [
    ...BARK_TEXTURE_PATHS,
    "/assets/ez-tree/textures/leaves/ash.png",
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

export function EzTreeGrass() {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const grassModel = useLoader(GLTFLoader, GRASS_MODEL_PATH);

  const grass = useMemo(() => {
    const sourceMesh = findFirstMesh(grassModel.scene);
    if (!sourceMesh) return null;

    const sourceMaterial = Array.isArray(sourceMesh.material)
      ? sourceMesh.material[0]
      : sourceMesh.material;
    const sourceMap =
      sourceMaterial instanceof THREE.MeshStandardMaterial ||
      sourceMaterial instanceof THREE.MeshBasicMaterial ||
      sourceMaterial instanceof THREE.MeshPhongMaterial
        ? sourceMaterial.map
        : null;
    const geometry = sourceMesh.geometry.clone();
    if (sourceMap) sourceMap.anisotropy = 4;

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: sourceMap,
      emissive: new THREE.Color(0x3c6f25),
      emissiveIntensity: 0.14,
      shininess: 0.12,
      transparent: false,
      alphaTest: 0.36,
      depthWrite: true,
      side: THREE.DoubleSide,
      vertexColors: true,
    }) as GrassMaterial;

    appendGrassWindShader(material);

    const mesh = new THREE.InstancedMesh(geometry, material, GRASS_MAX_COUNT);
    const dummy = new THREE.Object3D();
    let count = 0;

    for (let index = 0; index < GRASS_MAX_COUNT; index += 1) {
      const rx = seededRandom(index * 9.17 + 14.3);
      const rz = seededRandom(index * 5.71 + 91.4);
      const x = -8.6 + rx * 17.2;
      const z = -6.0 + rz * 12.0;
      const noise = patchNoise(x, z);
      const keepThreshold = 0.34 + seededRandom(index * 3.31) * 0.22;

      if (noise < keepThreshold || isReservoirFootprint(x, z)) continue;

      const sizeJitter = seededRandom(index * 7.43);
      const heightScale = 0.09 + noise * 0.09 + sizeJitter * 0.08;
      const widthScale = 0.09 + seededRandom(index * 11.9) * 0.08;

      dummy.position.set(x, 0.035, z);
      dummy.rotation.set(0, seededRandom(index * 13.23) * Math.PI * 2, 0);
      dummy.scale.set(widthScale, heightScale, widthScale);
      dummy.updateMatrix();

      const color = new THREE.Color(
        0.72 + seededRandom(index * 1.7) * 0.28,
        0.92 + noise * 0.38,
        0.32 + seededRandom(index * 2.9) * 0.22,
      );

      mesh.setMatrixAt(count, dummy.matrix);
      mesh.setColorAt(count, color);
      count += 1;

      if (count >= GRASS_COUNT) break;
    }

    mesh.count = count;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    return mesh;
  }, [grassModel]);

  useFrame(({ clock }) => {
    const material = grassRef.current?.material as GrassMaterial | undefined;
    const shader = material?.userData.grassShader;
    if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
  });

  if (!grass) return null;

  return <primitive ref={grassRef} object={grass} />;
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
