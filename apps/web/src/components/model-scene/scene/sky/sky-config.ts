import { useEnvironment } from "@react-three/drei";
import * as THREE from "three";

export type SkyTheme = "light" | "dark";

export const CUBEMAP_FILES = [
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
];

export type CubemapConfig = {
  files: string[];
  path: string;
};

export function getCubemapConfig(theme: SkyTheme): CubemapConfig {
  const isNight = theme === "dark";
  return {
    files: CUBEMAP_FILES,
    path: `/assets/elemental-serenity/map/${isNight ? "night" : "day"}/`,
  };
}

export function useSkyEnvironment(theme: SkyTheme) {
  return useEnvironment(getCubemapConfig(theme));
}

export const DAY_ENVIRONMENT = {
  environmentIntensity: 0.5,
  environmentRotation: [3.95, 6.64, 6.27] as [number, number, number],
  backgroundIntensity: 1.0,
  backgroundBlurriness: 0.04,
};

export const NIGHT_ENVIRONMENT = {
  environmentIntensity: 0.16,
  environmentRotation: [3.45, 5.9, 6.1] as [number, number, number],
  backgroundIntensity: 0.42,
  backgroundBlurriness: 0.02,
};

export const SUN_POSITIONS = {
  light: new THREE.Vector3(-0.55, 0.46, -1.0).normalize(),
  dark: new THREE.Vector3(0.42, 0.62, -1.0).normalize(),
} as const;

export function getSunDirection(theme: SkyTheme) {
  return SUN_POSITIONS[theme];
}
