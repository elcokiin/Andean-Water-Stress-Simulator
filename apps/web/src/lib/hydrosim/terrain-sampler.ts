import type { ReservoirProfile, TerrainProfile } from "./types";

function gaussian(x: number, center: number, width: number, height = 1) {
  const d = x - center;
  return height * Math.exp(-(d * d) / (2 * width * width));
}

export interface TerrainSampler {
  getHeight: (x: number, z: number) => number;
  isReservoirFootprint: (x: number, z: number) => boolean;
  getSlope: (x: number, z: number) => number;
}

export function createTerrainSampler({
  terrain,
  reservoir,
}: {
  terrain: TerrainProfile;
  reservoir: ReservoirProfile;
}): TerrainSampler {
  const getHeight = (x: number, z: number) => {
    const base =
      terrain.baseAmplitude *
      Math.sin(x * terrain.baseFrequency[0]) *
      Math.cos(z * terrain.baseFrequency[1]);

    const ridges = terrain.ridges.reduce((sum, ridge) => {
      if (ridge.zMax !== undefined && z >= ridge.zMax) return sum;

      const wavePhase = x * (ridge.waveFrequency ?? 1);
      const wave =
        ridge.waveKind === "cos" ? Math.cos(wavePhase) : Math.sin(wavePhase);
      const waveScale = 1 + (ridge.waveAmplitude ?? 0) * wave;

      return (
        sum +
        gaussian(x, ridge.xCenter, ridge.xWidth) *
          gaussian(z, ridge.zCenter, ridge.zWidth) *
          ridge.height *
          waveScale
      );
    }, 0);

    const hills = terrain.hills.reduce(
      (sum, hill) =>
        sum +
        gaussian(x, hill.xCenter, hill.xWidth) *
          gaussian(z, hill.zCenter, hill.zWidth) *
          hill.height,
      0,
    );

    const basin =
      -terrain.basin.depth *
      gaussian(x, terrain.basin.xCenter, terrain.basin.xWidth) *
      gaussian(z, terrain.basin.zCenter, terrain.basin.zWidth);

    const noise = terrain.noise.reduce(
      (sum, term) =>
        sum +
        term.amplitude *
          Math.sin(x * term.xFrequency + (term.xPhase ?? 0)) *
          Math.cos(z * term.zFrequency + (term.zPhase ?? 0)),
      0,
    );

    return base + ridges + hills + basin + noise;
  };

  const isReservoirFootprint = (x: number, z: number) => {
    const [centerX, centerZ] = reservoir.footprint.center;
    const [radiusX, radiusZ] = reservoir.footprint.radius;
    const normalizedX = (x - centerX) / radiusX;
    const normalizedZ = (z - centerZ) / radiusZ;
    return normalizedX * normalizedX + normalizedZ * normalizedZ < 1.02;
  };

  const getSlope = (x: number, z: number) => {
    const step = 0.08;
    const dx = getHeight(x + step, z) - getHeight(x - step, z);
    const dz = getHeight(x, z + step) - getHeight(x, z - step);
    return Math.hypot(dx, dz) / (step * 2);
  };

  return {
    getHeight,
    isReservoirFootprint,
    getSlope,
  };
}
