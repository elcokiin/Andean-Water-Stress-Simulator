import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type EzTreeTextures = {
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

export const BARK_TEXTURE_PATHS = [
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_Color.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_AmbientOcclusion.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_NormalGL.jpg",
  "/assets/ez-tree/textures/bark/Bark003_1K-JPG/Bark003_1K-JPG_Roughness.jpg",
] as const;

export const LEAF_TEXTURE_PATHS = [
  "/assets/ez-tree/textures/leaves/ash.png",
  "/assets/ez-tree/textures/leaves/pine.png",
  "/assets/ez-tree/textures/leaves/aspen.png",
  "/assets/ez-tree/textures/leaves/oak.png",
] as const;

export const FOREST_TEXTURE_PATHS = [
  ...BARK_TEXTURE_PATHS,
  ...LEAF_TEXTURE_PATHS,
] as const;

export const GRASS_MODEL_PATH = "/assets/ez-tree/models/grass.glb";
export const FLOWER_MODEL_PATHS = [
  "/assets/ez-tree/models/flower_white.glb",
  "/assets/ez-tree/models/flower_blue.glb",
  "/assets/ez-tree/models/flower_yellow.glb",
] as const;
export const ROCK_MODEL_PATHS = [
  "/assets/ez-tree/models/rock1.glb",
  "/assets/ez-tree/models/rock2.glb",
  "/assets/ez-tree/models/rock3.glb",
] as const;

export const GRASS_COUNT = 2900;
export const GRASS_MAX_COUNT = 5200;
export const GRASS_GROUND_OFFSET = 0.015;

useLoader.preload(THREE.TextureLoader, FOREST_TEXTURE_PATHS);
useLoader.preload(GLTFLoader, GRASS_MODEL_PATH);
FLOWER_MODEL_PATHS.forEach((path) => useLoader.preload(GLTFLoader, path));
