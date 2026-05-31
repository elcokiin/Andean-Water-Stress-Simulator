function gaussian(x: number, center: number, width: number, height: number) {
  const d = x - center;
  return height * Math.exp(-(d * d) / (2 * width * width));
}

export function getTerrainHeight(x: number, z: number) {
  const base = 0.04 * Math.sin(x * 0.5) * Math.cos(z * 0.3);

  const ridge1 =
    z < -2.5
      ? gaussian(x, -3.2, 3.0, 1.8) *
        gaussian(z, -4.8, 1.2, 1.0) *
        (0.85 + 0.15 * Math.sin(x * 1.7))
      : 0;

  const ridge2 =
    z < -1.5
      ? gaussian(x, 0.5, 3.5, 0.95) *
        gaussian(z, -3.6, 0.9, 1.0) *
        (0.9 + 0.1 * Math.cos(x * 2.1))
      : 0;

  const sideHill = gaussian(x, 6.5, 2.5, 0.4) * gaussian(z, -2.0, 2.5, 1.0);

  const noise =
    0.06 * Math.sin(x * 3.7 + 1.2) * Math.cos(z * 2.9 + 0.8) +
    0.03 * Math.sin(x * 7.3 - 2.1) * Math.cos(z * 5.1 + 3.4);

  return base + ridge1 + ridge2 + sideHill + noise;
}
