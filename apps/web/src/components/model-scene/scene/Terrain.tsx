import { Suspense, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { citySceneConfigs } from "@/src/lib/hydrosim/city-scenes";
import { createTerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type {
  TerrainProfile,
  VegetationProfile,
} from "@/src/lib/hydrosim/types";
import {
  EzTreeForest,
  EzTreeFlowers,
  EzTreeGrass,
  EzTreeRocks,
  ForegroundShrubs,
} from "./vegetation";

const GROUND_TEXTURE_PATHS = [
  "/assets/ez-tree/textures/ground/grass.jpg",
  "/assets/ez-tree/textures/ground/dirt_color.jpg",
  "/assets/ez-tree/textures/ground/dirt_normal.jpg",
] as const;

useLoader.preload(THREE.TextureLoader, GROUND_TEXTURE_PATHS);

function patchTerrainShader(
  material: THREE.MeshStandardMaterial,
  terrain: TerrainProfile,
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGrassTexture = { value: material.userData.grassTexture };
    shader.uniforms.uDirtTexture = { value: material.userData.dirtTexture };
    shader.uniforms.uTextureScale = { value: terrain.textureScale };

    shader.vertexShader = `
      varying vec3 vWorldPosition;
    ${shader.vertexShader}`;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vWorldPosition = worldPosition.xyz;`,
    );

    shader.fragmentShader = `
      varying vec3 vWorldPosition;
      uniform sampler2D uGrassTexture;
      uniform sampler2D uDirtTexture;
      uniform float uTextureScale;
    ${shader.fragmentShader}`;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
        vec2 terrainUv = vWorldPosition.xz / uTextureScale;
        vec3 grassColor = texture2D(uGrassTexture, terrainUv).rgb;
        vec3 dirtColor = texture2D(uDirtTexture, terrainUv * 0.82).rgb;
        float broadPatch = sin(vWorldPosition.x * 1.35 + vWorldPosition.z * 0.9) * 0.5 + 0.5;
        float finePatch = sin(vWorldPosition.x * 3.7 - vWorldPosition.z * 2.6) * 0.5 + 0.5;
        float dirtMix = smoothstep(0.48, 0.82, broadPatch * 0.72 + finePatch * 0.28);
        vec3 groundColor = mix(grassColor, dirtColor, dirtMix * 0.38) * 1.28;
        diffuseColor *= vec4(groundColor, 1.0);
      `,
    );
  };
}

export function TerrainMesh({
  terrain,
  terrainSampler,
  vegetation,
}: {
  terrain: TerrainProfile;
  terrainSampler: TerrainSampler;
  vegetation: VegetationProfile;
}) {
  const [grassTexture, dirtTexture, dirtNormal] = useLoader(
    THREE.TextureLoader,
    [...GROUND_TEXTURE_PATHS],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      terrain.width,
      terrain.depth,
      terrain.segments,
      terrain.segments,
    );
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, terrainSampler.getHeight(x, z));
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [terrain, terrainSampler]);

  [grassTexture, dirtTexture, dirtNormal].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
  });
  grassTexture.colorSpace = THREE.SRGBColorSpace; // eslint-disable-line react-hooks/immutability
  dirtTexture.colorSpace = THREE.SRGBColorSpace; // eslint-disable-line react-hooks/immutability

  const material = useMemo(() => {
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: terrain.groundColor,
      normalMap: dirtNormal,
      normalScale: new THREE.Vector2(...terrain.normalScale),
      roughness: 0.98,
      metalness: 0.01,
    });
    terrainMaterial.userData.grassTexture = grassTexture;
    terrainMaterial.userData.dirtTexture = dirtTexture;
    patchTerrainShader(terrainMaterial, terrain);
    return terrainMaterial;
  }, [dirtNormal, dirtTexture, grassTexture, terrain]);

  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow castShadow />

      <EzTreeGrass
        avoidAssets={vegetation.rocks}
        profile={vegetation.grass}
        terrainSampler={terrainSampler}
      />
      <EzTreeForest
        avoidAssets={vegetation.rocks}
        treeZones={vegetation.treeZones}
        terrainSampler={terrainSampler}
      />
      <ForegroundShrubs
        avoidAssets={vegetation.rocks}
        shrubs={vegetation.shrubs}
        terrainSampler={terrainSampler}
      />
      <Suspense fallback={null}>
        <EzTreeFlowers
          avoidAssets={vegetation.rocks}
          flowers={vegetation.flowers}
          terrainSampler={terrainSampler}
        />
      </Suspense>
      <Suspense fallback={null}>
        <EzTreeRocks rocks={vegetation.rocks} terrainSampler={terrainSampler} />
      </Suspense>
    </group>
  );
}

export function TunjaTerrain() {
  const city = citySceneConfigs.tunja;
  const terrainSampler = useMemo(
    () =>
      createTerrainSampler({
        terrain: city.terrain,
        reservoir: city.reservoir,
      }),
    [city],
  );

  return (
    <TerrainMesh
      terrain={city.terrain}
      terrainSampler={terrainSampler}
      vegetation={city.vegetation}
    />
  );
}
