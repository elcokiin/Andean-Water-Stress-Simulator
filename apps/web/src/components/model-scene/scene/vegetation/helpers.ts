import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";
import { Tree } from "@/src/lib/ez-tree";
import type { EzTreeTextures } from "./textures";

export type EzTreeConfig = {
  preset: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  seed: number;
  leafTint: number;
};

export type GrassShader = {
  uniforms: {
    uTime: { value: number };
  };
};

export type GrassMaterial = THREE.MeshPhongMaterial & {
  userData: {
    grassShader?: GrassShader;
  };
};

function seededNoise(value: number) {
  return Math.sin(value * 12.9898) * 43758.5453;
}

export function seededRandom(seed: number) {
  return seededNoise(seed) - Math.floor(seededNoise(seed));
}

export function configureDracoLoader(loader: GLTFLoader) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/assets/draco/");
  loader.setDRACOLoader(dracoLoader);
}

export function patchNoise(x: number, z: number) {
  const broad = Math.sin(x * 1.35 + z * 0.82) * 0.5 + 0.5;
  const fine = Math.sin(x * 4.2 - z * 3.1 + Math.sin(z * 1.7)) * 0.5 + 0.5;
  return broad * 0.72 + fine * 0.28;
}

export function isReservoirFootprint(x: number, z: number) {
  const normalizedX = x / 5.95;
  const normalizedZ = (z - 0.3) / 2.45;
  return normalizedX * normalizedX + normalizedZ * normalizedZ < 1.02;
}

export function appendGrassWindShader(material: GrassMaterial) {
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

export function findFirstMesh(object: THREE.Object3D): THREE.Mesh | null {
  let mesh: THREE.Mesh | null = null;
  object.traverse((child) => {
    if (!mesh && child instanceof THREE.Mesh) {
      mesh = child as THREE.Mesh;
    }
  });
  return mesh;
}

export function cloneSceneAsset(
  source: THREE.Object3D,
  {
    position,
    rotationY,
    scale,
    groundOffset = 0.02,
  }: {
    position: readonly [number, number];
    rotationY: number;
    scale: number;
    groundOffset?: number;
  },
) {
  const [x, z] = position;
  const object = source.clone(true);
  object.position.set(x, getTerrainHeight(x, z) + groundOffset, z);
  object.rotation.y = rotationY;
  object.scale.setScalar(scale);
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

export function getLeafTexture(preset: string, textures: EzTreeTextures) {
  if (preset.includes("Ash")) return textures.leaves.ash;
  if (preset.includes("Aspen")) return textures.leaves.aspen;
  if (preset.includes("Oak")) return textures.leaves.oak;
  return textures.leaves.pine;
}

export function createEzTree(
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
