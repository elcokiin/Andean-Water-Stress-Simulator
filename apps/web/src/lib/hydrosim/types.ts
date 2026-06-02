export type ScenarioId = "baseline" | "moderate" | "extreme";

export type ReservoirId = "tunja" | "duitama" | "sogamoso";

export type ConfigTab =
  | "scenarios"
  | "parameters"
  | "shortcuts"
  | "climate"
  | "demand"
  | "infrastructure";

export interface Scenario {
  name: string;
  badge: string;
  reserve: number;
  inflow: string;
  demand: string;
  oni: string;
  color: string;
  emissive: string;
}

export type Vector2Tuple = [number, number];
export type Vector3Tuple = [number, number, number];

export interface TerrainNoiseTerm {
  amplitude: number;
  xFrequency: number;
  zFrequency: number;
  xPhase?: number;
  zPhase?: number;
}

export interface TerrainRidge {
  xCenter: number;
  zCenter: number;
  xWidth: number;
  zWidth: number;
  height: number;
  zMax?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveKind?: "sin" | "cos";
}

export interface TerrainHill {
  xCenter: number;
  zCenter: number;
  xWidth: number;
  zWidth: number;
  height: number;
}

export interface TerrainBasin {
  xCenter: number;
  zCenter: number;
  xWidth: number;
  zWidth: number;
  depth: number;
}

export interface TerrainProfile {
  width: number;
  depth: number;
  segments: number;
  baseAmplitude: number;
  baseFrequency: Vector2Tuple;
  ridges: TerrainRidge[];
  hills: TerrainHill[];
  basin: TerrainBasin;
  noise: TerrainNoiseTerm[];
  textureScale: number;
  dirtMixStrength: number;
  groundColor: string;
  normalScale: Vector2Tuple;
}

export type ReservoirPathCommand =
  | ["moveTo", number, number]
  | ["lineTo", number, number]
  | ["bezierCurveTo", number, number, number, number, number, number]
  | ["quadraticCurveTo", number, number, number, number];

export interface ReservoirFootprint {
  center: Vector2Tuple;
  radius: Vector2Tuple;
}

export interface ReservoirProfile {
  visible: boolean;
  path: ReservoirPathCommand[];
  footprint: ReservoirFootprint;
  segments: number;
  position: Vector3Tuple;
  rotationZ: number;
  minScale: Vector2Tuple;
  maxScale: Vector2Tuple;
  elevationBase: number;
  elevationRange: number;
  bedScale: number;
  foamWidth: number;
  waterColors: {
    base: string;
    deep: string;
    foam: string;
    bed: string;
    caustics: string;
  };
  aquaticVegetation?: {
    count: number;
    maxCount: number;
    seed: number;
    color: string;
    secondaryColor: string;
    scale: Vector2Tuple;
    opacity: number;
  };
}

export interface CloudSpec {
  position: Vector3Tuple;
  scale: number;
}

export interface CameraProfile {
  position: Vector3Tuple;
  fov: number;
  target: Vector3Tuple;
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
}

export interface TreeZone {
  count: number;
  xRange: Vector2Tuple;
  zRange: Vector2Tuple;
  seed: number;
  scaleBoost: number;
  presets: string[];
  leafTints: number[];
  avoidReservoir?: boolean;
}

export interface PlacedAssetSpec {
  model: number;
  position: Vector2Tuple;
  rotationY: number;
  scale: number;
}

export interface ShrubSpec {
  preset: string;
  position: Vector2Tuple;
  rotationY: number;
  scale: number;
  seed: number;
  leafTint: number;
}

export interface GrassProfile {
  count: number;
  maxCount: number;
  bounds: {
    x: Vector2Tuple;
    z: Vector2Tuple;
  };
  seed: number;
  keepThreshold: Vector2Tuple;
  heightScale: Vector2Tuple;
  widthScale: Vector2Tuple;
  colorBase: Vector3Tuple;
  colorVariance: Vector3Tuple;
}

export interface VegetationProfile {
  grass: GrassProfile;
  treeZones: TreeZone[];
  shrubs: ShrubSpec[];
  flowers: PlacedAssetSpec[];
  rocks: PlacedAssetSpec[];
}

export interface CitySceneConfig {
  id: ReservoirId;
  name: string;
  title: string;
  terrain: TerrainProfile;
  reservoir: ReservoirProfile;
  vegetation: VegetationProfile;
  camera: CameraProfile;
  clouds: CloudSpec[];
}
