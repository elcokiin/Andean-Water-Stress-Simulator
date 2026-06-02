import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
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
// import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";
import { WaterSimulation, Caustics } from "@/src/lib/hydrosim/gpu-water";

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

function seededNoise(value: number) {
  return Math.sin(value * 12.9898) * 43758.5453;
}

function seededRandom(seed: number) {
  const noise = seededNoise(seed);
  return noise - Math.floor(noise);
}

function isPointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const current = polygon[i];
    const previous = polygon[j];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y) +
          current.x;

    if (intersects) inside = !inside;
  }

  return inside;
}

function AquaticVegetation({
  bounds,
  polygon,
  profile,
}: {
  bounds: THREE.Box2;
  polygon: THREE.Vector2[];
  profile: NonNullable<ReservoirProfile["aquaticVegetation"]>;
}) {
  const vegetation = useMemo(() => {
    const geometry = new THREE.CircleGeometry(1, 10);
    const material = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: profile.opacity,
      vertexColors: true,
      depthWrite: false,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, profile.maxCount);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const point = new THREE.Vector2();
    let count = 0;

    for (let index = 0; index < profile.maxCount; index += 1) {
      const x =
        bounds.min.x +
        seededRandom(profile.seed + index * 7.17) *
          (bounds.max.x - bounds.min.x);
      const y =
        bounds.min.y +
        seededRandom(profile.seed + index * 11.43) *
          (bounds.max.y - bounds.min.y);

      point.set(x, y);
      if (!isPointInPolygon(point, polygon)) continue;

      const scale =
        profile.scale[0] +
        seededRandom(profile.seed + index * 3.29) *
          (profile.scale[1] - profile.scale[0]);
      dummy.position.set(x, y, 0.035 + seededRandom(index) * 0.012);
      dummy.rotation.set(0, 0, seededRandom(index * 5.7) * Math.PI * 2);
      dummy.scale.set(scale * 1.35, scale * 0.82, 1);
      dummy.updateMatrix();

      color.set(index % 4 === 0 ? profile.secondaryColor : profile.color);
      mesh.setMatrixAt(count, dummy.matrix);
      mesh.setColorAt(count, color);
      count += 1;

      if (count >= profile.count) break;
    }

    mesh.count = count;
    mesh.renderOrder = 2;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    return mesh;
  }, [bounds, polygon, profile]);

  return <primitive object={vegetation} />;
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
  terrainWidth = 24,
  terrainDepth = 18,
}: {
  level?: number;
  reservoir: ReservoirProfile;
  terrainSampler: TerrainSampler;
  terrainWidth?: number;
  terrainDepth?: number;
}) {
  // export function ReservoirWater({ level = 1 }: { level?: number }) {
  const { gl } = useThree();
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

  const reservoirShape = useMemo(
    () => createReservoirShape(reservoir.path),
    [reservoir.path],
  );

  const waterGeometry = useMemo(() => {
    const geometry = new THREE.ShapeGeometry(
      reservoirShape,
      reservoir.segments,
    );
    geometry.computeBoundingBox();
    return geometry;
  }, [reservoir.segments, reservoirShape]);

  const shapePolygon = useMemo(
    () => reservoirShape.getSpacedPoints(128),
    [reservoirShape],
  );

  const waterBounds2 = useMemo(() => {
    const bounds = waterGeometry.boundingBox;
    if (!bounds) {
      return new THREE.Box2(new THREE.Vector2(-1, -1), new THREE.Vector2(1, 1));
    }
    return new THREE.Box2(
      new THREE.Vector2(bounds.min.x, bounds.min.y),
      new THREE.Vector2(bounds.max.x, bounds.max.y),
    );
  }, [waterGeometry]);

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

  const PLANE_MARGIN = 1.2;

  const waterPlaneGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      terrainWidth * PLANE_MARGIN,
      terrainDepth * PLANE_MARGIN,
      128,
      128,
    );
    return geometry;
  }, [terrainWidth, terrainDepth]);

  const planeBounds = useMemo(() => {
    return new THREE.Vector2(
      terrainWidth * PLANE_MARGIN * 0.5,
      terrainDepth * PLANE_MARGIN * 0.5,
    );
  }, [terrainWidth, terrainDepth]);

  const heightmapTexture = useMemo(() => {
    const resolution = 256;
    const data = new Float32Array(resolution * resolution);
    for (let iy = 0; iy < resolution; iy++) {
      for (let ix = 0; ix < resolution; ix++) {
        const x =
          -terrainWidth * 0.5 + ((ix + 0.5) / resolution) * terrainWidth;
        const z =
          -terrainDepth * 0.5 + ((iy + 0.5) / resolution) * terrainDepth;
        data[iy * resolution + ix] = terrainSampler.getHeight(x, z);
      }
    }
    const texture = new THREE.DataTexture(
      data,
      resolution,
      resolution,
      THREE.RedFormat,
      THREE.FloatType,
    );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }, [terrainSampler, terrainWidth, terrainDepth]);

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

  const sim = useMemo(() => new WaterSimulation(256), []);
  const caustics = useMemo(() => new Caustics(1024), []);

  useMemo(() => {
    const geom = waterPlaneGeometry;
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
  }, [reservoir.foamWidth, terrainSampler, waterElevation, waterPlaneGeometry]);

  const reservoirOffsetRef = useRef(
    new THREE.Vector2(reservoir.position[0], reservoir.position[2]),
  );
  reservoirOffsetRef.current.set(reservoir.position[0], reservoir.position[2]);

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
        uRippleLife: { value: 4.0 },
        uRippleStrength: { value: 0.18 },
        uRippleSpeed: { value: 1.0 },
        uWaveAmp: { value: 0.03 },
        uFresnelStrength: { value: 0.55 },
        uBounds: { value: planeBounds },
        uBaseColor: { value: new THREE.Color(reservoir.waterColors.base) },
        uDeepColor: { value: new THREE.Color(reservoir.waterColors.deep) },
        uRippleCenters: { value: INITIAL_RIPPLE_CENTERS },
        uRippleTimes: { value: INITIAL_RIPPLE_TIMES },
        uFoamColor: { value: new THREE.Color(reservoir.waterColors.foam) },
        uFoamStrength: { value: 1.0 },
        uWaterSim: { value: null },
        uTerrainHeightmap: { value: heightmapTexture },
        uTerrainSize: { value: new THREE.Vector2(terrainWidth, terrainDepth) },
        uReservoirOffset: { value: reservoirOffsetRef.current },
      },
    });
    (material.extensions as Record<string, boolean>).derivatives = true;
    return material;
  }, [
    reservoir.waterColors,
    planeBounds,
    heightmapTexture,
    terrainWidth,
    terrainDepth,
  ]);

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
        uCausticsTex: { value: null },
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

    sim.stepSimulation(state.gl);
    sim.updateNormals(state.gl);
    caustics.update(state.gl, sim.texture.texture);

    waterMaterial.uniforms.uWaterSim.value = sim.texture.texture;
    bedMaterial.uniforms.uCausticsTex.value = caustics.texture.texture;
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

    // Simulate drop on GPU
    sim.addDrop(
      gl,
      localPoint.x / planeBounds.x,
      localPoint.y / planeBounds.y,
      0.07,
      0.035,
    );

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
      <mesh
        ref={waterMeshRef}
        geometry={waterPlaneGeometry}
        material={waterMaterial}
        position={[0, 0, 0.01]}
        onPointerMove={handlePointerMove}
      />
      <group scale={[waterScaleX, waterScaleY, 1]}>
        {reservoir.aquaticVegetation ? (
          <AquaticVegetation
            bounds={waterBounds2}
            polygon={shapePolygon}
            profile={reservoir.aquaticVegetation}
          />
        ) : null}
      </group>
    </group>
  );
}
