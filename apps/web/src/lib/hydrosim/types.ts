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
    /**
     * Optional per-scene regional color overrides. When provided, the water
     * surface shader blends between the base/deep gradient and these
     * position-based tones to evoke depth, environment and sun reflections.
     */
    regionColors?: {
      /** Bright green/emerald tone for the shallow/vegetated shallows. */
      emerald?: string;
      /** Dense marine blue for deep or shadowed water. */
      navy?: string;
      /** Light sky blue for the water that mirrors the atmosphere. */
      sky?: string;
      /** Bright white/silver tone for direct sun glints. */
      glint?: string;
    };
  };
  /**
   * Optional per-scene configuration for position-based water color zones.
   * When omitted the shader uses the default radial base/deep gradient only.
   *
   * The shader works in the water plane's local space where:
   *   - `pos.x > 0` corresponds to the camera's left for the standard
   *     `Tunja` camera setup (front-right camera at +X, +Z).
   *   - `pos.y > 0` corresponds to the back of the scene (the dam / horizon).
   *   - `pos.y < 0` corresponds to the foreground (closer to the camera).
   */
  regionalWater?: {
    /** 0 disables regional blending, 1 enables the full effect. */
    strength: number;
    /** Mix amount for the emerald/green zone in the lower-left. */
    emeraldMix: number;
    /** Mix amount for the navy zone in the lower-right and shadows. */
    navyMix: number;
    /** Mix amount for the sky-blue zone at the back of the scene. */
    skyMix: number;
    /** Multiplier for sun specular inside the left-side glint zone. */
    glintSpecularBoost: number;
    /** Additive brightness for the white glint zone. */
    glintAdd: number;
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

export interface FrailejonSpec {
  position: Vector2Tuple;
  rotationY: number;
  scale: number;
  seed: number;
  flowerTint?: number;
  leafTint?: number;
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
  frailejones?: FrailejonSpec[];
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
