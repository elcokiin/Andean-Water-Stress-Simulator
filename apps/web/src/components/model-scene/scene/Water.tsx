import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  BED_FRAGMENT,
  BED_VERTEX,
  MAX_RIPPLES,
  WATER_SURFACE_FRAGMENT,
  WATER_SURFACE_VERTEX,
} from "@/src/lib/hydrosim/shaders/water";
import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type {
  ReservoirPathCommand,
  ReservoirProfile,
} from "@/src/lib/hydrosim/types";

const INITIAL_RIPPLE_CENTERS = Array.from(
  { length: MAX_RIPPLES },
  () => new THREE.Vector2(999, 999),
);
const INITIAL_RIPPLE_TIMES = Array.from({ length: MAX_RIPPLES }, () => -1000);

interface TerrainStats {
  minH: number;
  maxH: number;
  avgH: number;
}

function createReservoirShape(path: ReservoirPathCommand[]) {
  const shape = new THREE.Shape();

  path.forEach((command) => {
    switch (command[0]) {
      case "moveTo":
        shape.moveTo(command[1], command[2]);
        break;
      case "lineTo":
        shape.lineTo(command[1], command[2]);
        break;
      case "bezierCurveTo":
        shape.bezierCurveTo(
          command[1],
          command[2],
          command[3],
          command[4],
          command[5],
          command[6],
        );
        break;
      case "quadraticCurveTo":
        shape.quadraticCurveTo(command[1], command[2], command[3], command[4]);
        break;
    }
  });

  return shape;
}

export function ReservoirWater({
  level = 1,
  reservoir,
  terrainSampler,
}: {
  level?: number;
  reservoir: ReservoirProfile;
  terrainSampler: TerrainSampler;
}) {
  const normalizedLevel = Math.min(Math.max(level, 0.24), 1);
  const waterScaleX =
    reservoir.minScale[0] +
    normalizedLevel * (reservoir.maxScale[0] - reservoir.minScale[0]);
  const waterScaleY =
    reservoir.minScale[1] +
    normalizedLevel * (reservoir.maxScale[1] - reservoir.minScale[1]);
  const waterElevation =
    reservoir.elevationBase + normalizedLevel * reservoir.elevationRange;

  const waterMeshRef = useRef<THREE.Mesh>(null);
  const rippleIndexRef = useRef(0);
  const lastRippleTimeRef = useRef(0);
  const timeRef = useRef(0);
  const rippleCenters = useRef(INITIAL_RIPPLE_CENTERS);
  const rippleTimes = useRef(INITIAL_RIPPLE_TIMES);

  const waterGeometry = useMemo(() => {
    const geometry = new THREE.ShapeGeometry(
      createReservoirShape(reservoir.path),
      reservoir.segments,
    );
    geometry.computeBoundingBox();
    return geometry;
  }, [reservoir.path, reservoir.segments]);

  const waterBounds = useMemo(() => {
    const bounds = waterGeometry.boundingBox;
    if (!bounds) {
      return new THREE.Vector2(1, 1);
    }
    const halfWidth = (bounds.max.x - bounds.min.x) * 0.5;
    const halfHeight = (bounds.max.y - bounds.min.y) * 0.5;
    return new THREE.Vector2(
      Math.max(halfWidth, 0.1),
      Math.max(halfHeight, 0.1),
    );
  }, [waterGeometry]);

  const bedGeometry = useMemo(() => {
    const geometry = waterGeometry.clone();
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    let minH = Infinity;
    let maxH = -Infinity;
    let sumH = 0;
    let countH = 0;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const terrainHeight = terrainSampler.getHeight(x, y);
      positions.setZ(i, terrainHeight);
      if (terrainHeight < minH) minH = terrainHeight;
      if (terrainHeight > maxH) maxH = terrainHeight;
      sumH += terrainHeight;
      countH += 1;
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    const stats: TerrainStats = {
      minH,
      maxH,
      avgH: sumH / Math.max(1, countH),
    };
    (geometry as unknown as { __terrainStats: TerrainStats }).__terrainStats =
      stats;
    return geometry;
  }, [terrainSampler, waterGeometry]);

  const bedPositionY = useMemo(() => {
    const stats = (bedGeometry as unknown as { __terrainStats?: TerrainStats })
      .__terrainStats;
    if (!stats) return -0.055;
    return stats.avgH - 0.02;
  }, [bedGeometry]);

  useMemo(() => {
    const geom = waterGeometry;
    const count = geom.attributes.position.count;
    const shore = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const x = geom.attributes.position.getX(i);
      const y = geom.attributes.position.getY(i);
      const terrainH = terrainSampler.getHeight(x, y);
      const depth = waterElevation - terrainH;
      const t = Math.max(0, Math.min(1, depth / reservoir.foamWidth));
      shore[i] = 1.0 - t;
    }
    geom.setAttribute("aShore", new THREE.BufferAttribute(shore, 1));
  }, [reservoir.foamWidth, terrainSampler, waterElevation, waterGeometry]);

  const waterMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: WATER_SURFACE_VERTEX,
      fragmentShader: WATER_SURFACE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.7 },
        uRippleLife: { value: 2.6 },
        uRippleStrength: { value: 0.22 },
        uRippleSpeed: { value: 1.5 },
        uWaveAmp: { value: 0.03 },
        uFresnelStrength: { value: 0.55 },
        uBounds: { value: waterBounds },
        uBaseColor: { value: new THREE.Color(reservoir.waterColors.base) },
        uDeepColor: { value: new THREE.Color(reservoir.waterColors.deep) },
        uRippleCenters: { value: INITIAL_RIPPLE_CENTERS },
        uRippleTimes: { value: INITIAL_RIPPLE_TIMES },
        uFoamColor: { value: new THREE.Color(reservoir.waterColors.foam) },
        uFoamStrength: { value: 1.0 },
      },
    });
    return material;
  }, [reservoir.waterColors, waterBounds]);

  const bedMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: BED_VERTEX,
      fragmentShader: BED_FRAGMENT,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uCausticsStrength: { value: 0.4 },
        uDepth: { value: 0.26 },
        uBounds: { value: waterBounds },
        uBedColor: { value: new THREE.Color(reservoir.waterColors.bed) },
        uCausticsColor: {
          value: new THREE.Color(reservoir.waterColors.caustics),
        },
      },
    });
  }, [reservoir.waterColors, waterBounds]);

  /* eslint-disable react-hooks/immutability */
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    timeRef.current = elapsed;

    const surfaceFade = THREE.MathUtils.clamp(
      (normalizedLevel - 0.28) / 0.35,
      0,
      1,
    );
    const surfaceOpacity = surfaceFade * 0.78;
    const causticsStrength = surfaceFade * 0.65;
    const bedDepth = 0.18 + (1 - normalizedLevel) * 0.22;

    waterMaterial.uniforms.uTime.value = elapsed;
    waterMaterial.uniforms.uOpacity.value = surfaceOpacity;

    bedMaterial.uniforms.uTime.value = elapsed;
    bedMaterial.uniforms.uCausticsStrength.value = causticsStrength;
    bedMaterial.uniforms.uDepth.value = bedDepth;
  });
  /* eslint-enable react-hooks/immutability */

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!waterMeshRef.current) {
      return;
    }
    const now = timeRef.current;
    if (now - lastRippleTimeRef.current < 0.06) {
      return;
    }
    lastRippleTimeRef.current = now;

    const localPoint = waterMeshRef.current.worldToLocal(event.point.clone());
    const index = rippleIndexRef.current % MAX_RIPPLES;
    rippleCenters.current[index].set(localPoint.x, localPoint.y);
    rippleTimes.current[index] = now;
    rippleIndexRef.current += 1;
  };

  return (
    <group
      position={[
        reservoir.position[0],
        reservoir.position[1] + waterElevation,
        reservoir.position[2],
      ]}
      rotation={[-Math.PI / 2, 0, reservoir.rotationZ]}
    >
      <group scale={[reservoir.bedScale, reservoir.bedScale, 1]}>
        <mesh
          receiveShadow
          geometry={bedGeometry}
          material={bedMaterial}
          position={[0, bedPositionY, 0]}
        />
      </group>
      <group scale={[waterScaleX, waterScaleY, 1]}>
        <mesh
          ref={waterMeshRef}
          geometry={waterGeometry}
          material={waterMaterial}
          position={[0, 0, 0.01]}
          onPointerMove={handlePointerMove}
        />
      </group>
    </group>
  );
}
