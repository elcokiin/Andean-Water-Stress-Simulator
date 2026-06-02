import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { GrassProfile, PlacedAssetSpec } from "@/src/lib/hydrosim/types";
import { GRASS_GROUND_OFFSET, GRASS_MODEL_PATH } from "./textures";
import {
  appendGrassWindShader,
  findFirstMesh,
  isInsidePlacedAssetFootprint,
  patchNoise,
  seededRandom,
  type GrassMaterial,
} from "./helpers";

export function EzTreeGrass({
  avoidAssets,
  profile,
  terrainSampler,
}: {
  avoidAssets: PlacedAssetSpec[];
  profile: GrassProfile;
  terrainSampler: TerrainSampler;
}) {
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

    const mesh = new THREE.InstancedMesh(geometry, material, profile.maxCount);
    const dummy = new THREE.Object3D();
    let count = 0;

    for (let index = 0; index < profile.maxCount; index += 1) {
      const rx = seededRandom(index * 9.17 + profile.seed);
      const rz = seededRandom(index * 5.71 + profile.seed * 6.39);
      const x =
        profile.bounds.x[0] + rx * (profile.bounds.x[1] - profile.bounds.x[0]);
      const z =
        profile.bounds.z[0] + rz * (profile.bounds.z[1] - profile.bounds.z[0]);
      const noise = patchNoise(x, z);
      const keepThreshold =
        profile.keepThreshold[0] +
        seededRandom(index * 3.31 + profile.seed) *
          (profile.keepThreshold[1] - profile.keepThreshold[0]);

      if (
        noise < keepThreshold ||
        terrainSampler.isReservoirFootprint(x, z) ||
        isInsidePlacedAssetFootprint(x, z, avoidAssets)
      ) {
        continue;
      }

      const sizeJitter = seededRandom(index * 7.43);
      const heightScale =
        profile.heightScale[0] +
        noise * (profile.heightScale[1] - profile.heightScale[0]) * 0.55 +
        sizeJitter * (profile.heightScale[1] - profile.heightScale[0]) * 0.45;
      const widthScale =
        profile.widthScale[0] +
        seededRandom(index * 11.9) *
          (profile.widthScale[1] - profile.widthScale[0]);

      dummy.position.set(
        x,
        terrainSampler.getHeight(x, z) + GRASS_GROUND_OFFSET,
        z,
      );
      dummy.rotation.set(0, seededRandom(index * 13.23) * Math.PI * 2, 0);
      dummy.scale.set(widthScale, heightScale, widthScale);
      dummy.updateMatrix();

      const color = new THREE.Color(
        profile.colorBase[0] +
          seededRandom(index * 1.7) * profile.colorVariance[0],
        profile.colorBase[1] + noise * profile.colorVariance[1],
        profile.colorBase[2] +
          seededRandom(index * 2.3) * profile.colorVariance[2],
      );

      mesh.setMatrixAt(count, dummy.matrix);
      mesh.setColorAt(count, color);
      count += 1;

      if (count >= profile.count) break;
    }

    mesh.count = count;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();

    return mesh;
  }, [avoidAssets, grassModel, profile, terrainSampler]);

  useFrame(({ clock }) => {
    const material = grassRef.current?.material as GrassMaterial | undefined;
    const shader = material?.userData.grassShader;
    if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
  });

  if (!grass) return null;

  return <primitive ref={grassRef} object={grass} />;
}
