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
import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";

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

export function ReservoirWater({ level = 1 }: { level?: number }) {
  const normalizedLevel = Math.min(Math.max(level, 0.24), 1);
  const waterScaleX = 0.82 + normalizedLevel * 0.23;
  const waterScaleY = 1.12 + normalizedLevel * 0.33;
  const waterElevation = 0.035 + normalizedLevel * 0.025;

  const waterMeshRef = useRef<THREE.Mesh>(null);
  const rippleIndexRef = useRef(0);
  const lastRippleTimeRef = useRef(0);
  const timeRef = useRef(0);
  const rippleCenters = useRef(INITIAL_RIPPLE_CENTERS);
  const rippleTimes = useRef(INITIAL_RIPPLE_TIMES);

  const waterGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-5.8, -0.2);
    shape.bezierCurveTo(-4.8, -1.5, -2.3, -1.9, 0.3, -1.55);
    shape.bezierCurveTo(2.7, -1.28, 5.5, -0.8, 6.0, 0.25);
    shape.bezierCurveTo(6.55, 1.38, 4.1, 2.18, 1.8, 2.22);
    shape.bezierCurveTo(-0.6, 2.24, -3.2, 1.85, -4.7, 1.0);
    shape.bezierCurveTo(-5.55, 0.52, -6.12, 0.22, -5.8, -0.2);
    const geometry = new THREE.ShapeGeometry(shape, 64);
    geometry.computeBoundingBox();
    return geometry;
  }, []);

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
      const terrainHeight = getTerrainHeight(x, y);
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
  }, [waterGeometry]);
  const bedScale = 1.08;

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
    const foamWidth = 0.22;
    for (let i = 0; i < count; i++) {
      const x = geom.attributes.position.getX(i);
      const y = geom.attributes.position.getY(i);
      const terrainH = getTerrainHeight(x, y);
      const depth = waterElevation - terrainH;
      const t = Math.max(0, Math.min(1, depth / foamWidth));
      shore[i] = 1.0 - t;
    }
    geom.setAttribute("aShore", new THREE.BufferAttribute(shore, 1));
  }, [waterGeometry, waterElevation]);

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
        uBaseColor: { value: new THREE.Color("#2a8ccc") },
        uDeepColor: { value: new THREE.Color("#0b3654") },
        uRippleCenters: { value: INITIAL_RIPPLE_CENTERS },
        uRippleTimes: { value: INITIAL_RIPPLE_TIMES },
        uFoamColor: { value: new THREE.Color("#f8fbfd") },
        uFoamStrength: { value: 1.0 },
      },
    });
    return material;
  }, [waterBounds]);

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
        uBedColor: { value: new THREE.Color("#4f6b3a") },
        uCausticsColor: { value: new THREE.Color("#b5f5f0") },
      },
    });
  }, [waterBounds]);

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
      position={[0, waterElevation, 0.3]}
      rotation={[-Math.PI / 2, 0, -0.08]}
    >
      <group scale={[bedScale, bedScale, 1]}>
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
