import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { getTerrainHeight } from "@/src/lib/hydrosim/terrain-height";
import {
  GRASS_COUNT,
  GRASS_GROUND_OFFSET,
  GRASS_MAX_COUNT,
  GRASS_MODEL_PATH,
} from "./textures";
import {
  appendGrassWindShader,
  findFirstMesh,
  patchNoise,
  seededRandom,
  type GrassMaterial,
} from "./helpers";

export function EzTreeGrass() {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const grassModel = useLoader(GLTFLoader, GRASS_MODEL_PATH);

  const grass = useMemo(() => {
    const sourceMesh = findFirstMesh(grassModel.scene);
    if (!sourceMesh) return null;

    const sourceMaterial = Array.isArray(sourceMesh.material)
      ? sourceMesh.material[0]
      : sourceMesh.material;
    const sourceMap =
      sourceMaterial instanceof THREE.MeshStandardMaterial ||
      sourceMaterial instanceof THREE.MeshBasicMaterial ||
      sourceMaterial instanceof THREE.MeshPhongMaterial
        ? sourceMaterial.map
        : null;
    const geometry = sourceMesh.geometry.clone();
    if (sourceMap) sourceMap.anisotropy = 2;

    const material = new THREE.MeshPhongMaterial({
      map: sourceMap,
      emissive: new THREE.Color(0x308040),
      emissiveIntensity: 0.05,
      transparent: false,
      alphaTest: 0.5,
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    }) as GrassMaterial;

    material.color.multiplyScalar(0.6);
    appendGrassWindShader(material);

    const mesh = new THREE.InstancedMesh(geometry, material, GRASS_MAX_COUNT);
    const dummy = new THREE.Object3D();
    let count = 0;

    for (let index = 0; index < GRASS_MAX_COUNT; index += 1) {
      const rx = seededRandom(index * 9.17 + 14.3);
      const rz = seededRandom(index * 5.71 + 91.4);
      const x = -8.6 + rx * 17.2;
      const z = -6.0 + rz * 12.0;
      const noise = patchNoise(x, z);
      const keepThreshold = 0.34 + seededRandom(index * 3.31) * 0.22;

      if (noise < keepThreshold || isReservoirFootprintLocal(x, z)) continue;

      const sizeJitter = seededRandom(index * 7.43);
      const heightScale = 0.09 + noise * 0.09 + sizeJitter * 0.08;
      const widthScale = 0.09 + seededRandom(index * 11.9) * 0.08;

      dummy.position.set(x, getTerrainHeight(x, z) + GRASS_GROUND_OFFSET, z);
      dummy.rotation.set(0, seededRandom(index * 13.23) * Math.PI * 2, 0);
      dummy.scale.set(widthScale, heightScale, widthScale);
      dummy.updateMatrix();

      const color = new THREE.Color(
        0.25 + seededRandom(index * 1.7) * 0.1,
        0.3 + noise * 0.3,
        0.1,
      );

      mesh.setMatrixAt(count, dummy.matrix);
      mesh.setColorAt(count, color);
      count += 1;

      if (count >= GRASS_COUNT) break;
    }

    mesh.count = count;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();

    return mesh;
  }, [grassModel]);

  useFrame(({ clock }) => {
    const material = grassRef.current?.material as GrassMaterial | undefined;
    const shader = material?.userData.grassShader;
    if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
  });

  if (!grass) return null;

  return <primitive ref={grassRef} object={grass} />;
}

function isReservoirFootprintLocal(x: number, z: number) {
  const normalizedX = x / 5.95;
  const normalizedZ = (z - 0.3) / 2.45;
  return normalizedX * normalizedX + normalizedZ * normalizedZ < 1.02;
}
