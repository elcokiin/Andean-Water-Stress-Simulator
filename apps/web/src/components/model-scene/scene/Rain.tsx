import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MAX_PARTICLES = 1500;
const FALL_HEIGHT = 8;
const GROUND_OFFSET = 0.05;
const HEAD_ALPHA = 0.8;
const TAIL_ALPHA = 0.3;
const STREAK_TIME_FACTOR = 0.08;
const MAX_STREAK = 0.4;
const WIND_STRENGTH = 0.02;
const RESPAWN_Y = -1;

function seededRandom(seed: number) {
  const noise = Math.sin(seed * 12.9898) * 43758.5453;
  return noise - Math.floor(noise);
}

interface RainParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface RainBounds {
  width: number;
  depth: number;
}

export interface RainRippleTarget {
  /** World Y of the water surface expressed in Rain's local frame. */
  surfaceYLocal: number;
  /** Attempt to fire a ripple at the given world (x, z) coordinate. */
  tryRipple: (worldX: number, worldZ: number) => void;
}

export function Rain({
  intensity,
  bounds,
  night = false,
  maxParticles = MAX_PARTICLES,
  rippleTarget = null,
}: {
  intensity: number;
  bounds: RainBounds;
  night?: boolean;
  maxParticles?: number;
  rippleTarget?: RainRippleTarget | null;
}) {
  const halfWidth = bounds.width * 0.55;
  const halfDepth = bounds.depth * 0.55;

  const particles = useMemo<RainParticle[]>(() => {
    const list: RainParticle[] = [];
    for (let i = 0; i < maxParticles; i += 1) {
      list.push({
        x: (seededRandom(i * 7.17 + 1) * 2 - 1) * halfWidth,
        y: seededRandom(i * 11.43 + 2) * FALL_HEIGHT,
        z: (seededRandom(i * 17.91 + 3) * 2 - 1) * halfDepth,
        vy: -(6 + seededRandom(i * 23.7 + 5) * 6),
        vx: (seededRandom(i * 31.1 + 7) - 0.5) * 0.2,
        vz: (seededRandom(i * 41.3 + 11) - 0.5) * 0.2,
      });
    }
    return list;
  }, [halfDepth, halfWidth, maxParticles]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 6);
    const colors = new Float32Array(maxParticles * 6);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setDrawRange(0, 0);
    geom.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(0, FALL_HEIGHT * 0.5, 0),
      Math.max(bounds.width, bounds.depth, FALL_HEIGHT) * 1.2,
    );
    return geom;
  }, [bounds.depth, bounds.width, maxParticles]);

  const tint = useMemo(
    () =>
      new THREE.Color(
        night ? 0.55 : 0.65,
        night ? 0.7 : 0.8,
        night ? 0.95 : 0.95,
      ),
    [night],
  );

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  /* eslint-disable react-hooks/immutability */
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.2);
    const elapsed = state.clock.getElapsedTime();
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const activeCount = Math.max(1, Math.floor(maxParticles * intensity));

    const headR = tint.r * HEAD_ALPHA;
    const headG = tint.g * HEAD_ALPHA;
    const headB = tint.b * HEAD_ALPHA;
    const tailR = tint.r * TAIL_ALPHA;
    const tailG = tint.g * TAIL_ALPHA;
    const tailB = tint.b * TAIL_ALPHA;

    const surfaceYLocal = rippleTarget?.surfaceYLocal ?? null;

    for (let i = 0; i < activeCount; i += 1) {
      const p = particles[i];
      const i6 = i * 6;
      const prevY = p.y;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.x += Math.sin(elapsed * 1.5 + p.z * 0.05) * WIND_STRENGTH * dt;
      p.z += Math.cos(elapsed * 1.2 + p.x * 0.03) * WIND_STRENGTH * dt;

      if (
        surfaceYLocal !== null &&
        prevY >= surfaceYLocal &&
        p.y < surfaceYLocal
      ) {
        rippleTarget?.tryRipple(p.x, p.z);
      }

      if (p.y < RESPAWN_Y) {
        p.x = (seededRandom(i * 7.17 + 1) * 2 - 1) * halfWidth;
        p.y = FALL_HEIGHT + seededRandom(i * 11.43 + 2) * 2;
        p.z = (seededRandom(i * 17.91 + 3) * 2 - 1) * halfDepth;
      }

      const speed = Math.hypot(p.vx, p.vy, p.vz);
      const dropLength = Math.min(speed * STREAK_TIME_FACTOR, MAX_STREAK);
      const invSpeed = 1 / Math.max(speed, 0.0001);
      const dirX = p.vx * invSpeed;
      const dirY = p.vy * invSpeed;
      const dirZ = p.vz * invSpeed;

      positions[i6] = p.x;
      positions[i6 + 1] = p.y;
      positions[i6 + 2] = p.z;
      positions[i6 + 3] = p.x - dirX * dropLength;
      positions[i6 + 4] = p.y - dirY * dropLength;
      positions[i6 + 5] = p.z - dirZ * dropLength;

      colors[i6] = headR;
      colors[i6 + 1] = headG;
      colors[i6 + 2] = headB;
      colors[i6 + 3] = tailR;
      colors[i6 + 4] = tailG;
      colors[i6 + 5] = tailB;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.setDrawRange(0, activeCount * 2);
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <lineSegments
      geometry={geometry}
      material={material}
      position={[0, GROUND_OFFSET, 0]}
      frustumCulled={false}
      renderOrder={5}
    />
  );
}
