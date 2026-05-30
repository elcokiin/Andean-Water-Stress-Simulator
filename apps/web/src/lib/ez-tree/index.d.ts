import * as THREE from "three";

export const Billboard: {
  Single: string;
  Double: string;
};

export const TreeType: {
  Deciduous: string;
  Evergreen: string;
};

export const TreePreset: Record<string, unknown>;

type BarkMaps = {
  color: THREE.Texture | null;
  ao: THREE.Texture | null;
  normal: THREE.Texture | null;
  roughness: THREE.Texture | null;
};

type TreeOptionsLike = {
  seed: number;
  bark: {
    type: string;
    tint: number;
    maps: BarkMaps;
  };
  leaves: {
    map: THREE.Texture | null;
    tint: number;
  };
};

export class Tree extends THREE.Group {
  options: TreeOptionsLike;
  loadPreset(name: string): void;
  loadFromJson(json: unknown): void;
  generate(): void;
  update(elapsedTime: number): void;
  vertexCount: number;
  triangleCount: number;
}

export class Trellis extends THREE.Group {
  constructor(options: unknown);
  generate(): void;
  dispose(): void;
}
