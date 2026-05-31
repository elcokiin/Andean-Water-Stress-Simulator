import { Suspense, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  EzTreeForest,
  EzTreeFlowers,
  EzTreeGrass,
  EzTreeRocks,
  ForegroundShrubs,
} from "./Vegetation";
import { getTerrainHeight } from "./terrain-height";

const SEGMENTS = 80;
const GROUND_TEXTURE_PATHS = [
  "/assets/ez-tree/textures/ground/grass.jpg",
  "/assets/ez-tree/textures/ground/dirt_color.jpg",
  "/assets/ez-tree/textures/ground/dirt_normal.jpg",
] as const;

useLoader.preload(THREE.TextureLoader, GROUND_TEXTURE_PATHS);

function patchTerrainShader(material: THREE.MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGrassTexture = { value: material.userData.grassTexture };
    shader.uniforms.uDirtTexture = { value: material.userData.dirtTexture };
    shader.uniforms.uTextureScale = { value: 2.4 };

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

export function TunjaTerrain() {
  const [grassTexture, dirtTexture, dirtNormal] = useLoader(
    THREE.TextureLoader,
    [...GROUND_TEXTURE_PATHS],
  );

  const geometry = useMemo(() => {
    const width = 18;
    const depth = 13;
    const geo = new THREE.PlaneGeometry(width, depth, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, getTerrainHeight(x, z));
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    [grassTexture, dirtTexture, dirtNormal].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 4;
    });
    grassTexture.colorSpace = THREE.SRGBColorSpace;
    dirtTexture.colorSpace = THREE.SRGBColorSpace;

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: "#eef5d0",
      normalMap: dirtNormal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.98,
      metalness: 0.01,
    });
    terrainMaterial.userData.grassTexture = grassTexture;
    terrainMaterial.userData.dirtTexture = dirtTexture;
    patchTerrainShader(terrainMaterial);
    return terrainMaterial;
  }, [dirtNormal, dirtTexture, grassTexture]);

  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow castShadow />

      <EzTreeGrass />
      <EzTreeForest />
      <ForegroundShrubs />
      <Suspense fallback={null}>
        <EzTreeFlowers />
      </Suspense>
      <Suspense fallback={null}>
        <EzTreeRocks />
      </Suspense>
    </group>
  );
}
