import { useMemo } from "react";
import * as THREE from "three";

import type { TerrainSampler } from "@/src/lib/hydrosim/terrain-sampler";
import type { FrailejonSpec, PlacedAssetSpec } from "@/src/lib/hydrosim/types";
import { isInsidePlacedAssetFootprint, seededRandom } from "./helpers";

const FRAILEJON_GROUND_OFFSET = 0.015;
const STEM_RADIAL_SEGMENTS = 10;
const LEAF_LENGTH_SEGMENTS = 6;
const DEFAULT_LEAF_TINT = 0x8aa077;
const DEFAULT_FLOWER_TINT = 0xd9b53a;

function buildLeafGeometry(
  length: number,
  maxWidth: number,
  curveDepth: number,
  twist: number,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= LEAF_LENGTH_SEGMENTS; i += 1) {
    const t = i / LEAF_LENGTH_SEGMENTS;
    const widthAtT = maxWidth * Math.sin(Math.PI * t);
    const bendZ = -Math.sin(t * Math.PI) * curveDepth;
    const twistAngle = t * twist;
    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);
    const halfWidth = widthAtT * 0.5;

    positions.push(-halfWidth * cosT, t * length, halfWidth * sinT + bendZ);
    positions.push(halfWidth * cosT, t * length, -halfWidth * sinT + bendZ);
    uvs.push(0, t, 1, t);
  }

  for (let i = 0; i < LEAF_LENGTH_SEGMENTS; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, d, a, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildStemGeometry(
  baseRadius: number,
  topRadius: number,
  height: number,
) {
  const geometry = new THREE.CylinderGeometry(
    topRadius,
    baseRadius,
    height,
    STEM_RADIAL_SEGMENTS,
    1,
    true,
  );
  geometry.translate(0, height / 2, 0);
  return geometry;
}

function buildFlowerHeadGeometry(radius: number) {
  const geometry = new THREE.IcosahedronGeometry(radius, 1);
  geometry.scale(1, 0.4, 1);
  return geometry;
}

function buildFrailejon(
  config: FrailejonSpec,
  {
    stemMaterial,
    marcescentMaterial,
    leafMaterial,
    flowerMaterial,
  }: {
    stemMaterial: THREE.Material;
    marcescentMaterial: THREE.Material;
    leafMaterial: THREE.Material;
    flowerMaterial: THREE.Material;
  },
) {
  const { seed, scale } = config;
  const group = new THREE.Group();
  const rng = (offset: number) => seededRandom(seed * 17.31 + offset);

  const stemHeight = 0.95 + rng(1.1) * 0.55;
  const stemBaseRadius = 0.06 + rng(2.3) * 0.018;
  const stemTopRadius = stemBaseRadius * (0.78 + rng(3.7) * 0.08);

  const stemGeometry = buildStemGeometry(
    stemBaseRadius,
    stemTopRadius,
    stemHeight,
  );
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.castShadow = true;
  stem.receiveShadow = true;
  group.add(stem);

  const rosetteNode = new THREE.Group();
  rosetteNode.position.y = stemHeight - 0.02;
  group.add(rosetteNode);

  const livingLeafCount = 14 + Math.floor(rng(4.1) * 7);
  const livingLeafGeometry = buildLeafGeometry(0.55, 0.07, 0.08, 0.35);
  const livingLeafBaseTilt = 0.25 + rng(5.3) * 0.18;
  for (let i = 0; i < livingLeafCount; i += 1) {
    const angle = (i / livingLeafCount) * Math.PI * 2 + rng(6.7) * 0.2;
    const tilt = livingLeafBaseTilt + (rng(7.9) - 0.5) * 0.18;
    const leaf = new THREE.Mesh(livingLeafGeometry, leafMaterial);
    leaf.position.y = -0.01;
    leaf.rotation.set(tilt, 0, 0);
    const azimuthNode = new THREE.Group();
    azimuthNode.rotation.y = angle;
    azimuthNode.add(leaf);
    rosetteNode.add(azimuthNode);
  }

  const innerRingCount = Math.floor(livingLeafCount * 0.55);
  const innerLeafGeometry = buildLeafGeometry(0.36, 0.05, 0.05, 0.5);
  for (let i = 0; i < innerRingCount; i += 1) {
    const angle =
      (i / innerRingCount) * Math.PI * 2 +
      Math.PI / innerRingCount +
      rng(8.5) * 0.18;
    const tilt = 0.05 + rng(9.1) * 0.18;
    const leaf = new THREE.Mesh(innerLeafGeometry, leafMaterial);
    leaf.position.y = 0.04;
    leaf.rotation.set(tilt, 0, 0);
    const azimuthNode = new THREE.Group();
    azimuthNode.rotation.y = angle;
    azimuthNode.add(leaf);
    rosetteNode.add(azimuthNode);
  }

  const marcescentCount = 28 + Math.floor(rng(10.1) * 14);
  const marcescentGeometry = buildLeafGeometry(0.4, 0.05, 0.18, 0.6);
  for (let i = 0; i < marcescentCount; i += 1) {
    const angle = (i / marcescentCount) * Math.PI * 2 + rng(11.3) * 0.1;
    const heightAlongStem = 0.08 + rng(12.7) * (stemHeight * 0.95);
    const tilt = Math.PI / 2 - 0.1 - rng(13.9) * 0.5;
    const leaf = new THREE.Mesh(marcescentGeometry, marcescentMaterial);
    leaf.castShadow = true;
    leaf.rotation.set(tilt, 0, 0);
    const azimuthNode = new THREE.Group();
    azimuthNode.rotation.y = angle;
    azimuthNode.position.y = heightAlongStem;
    azimuthNode.add(leaf);
    group.add(azimuthNode);
  }

  const flowerGeometry = buildFlowerHeadGeometry(stemTopRadius * 1.4);
  const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
  flower.position.y = 0.005;
  flower.castShadow = true;
  rosetteNode.add(flower);

  group.scale.setScalar(scale);
  return group;
}

export function Frailejones({
  avoidAssets,
  frailejones,
  terrainSampler,
}: {
  avoidAssets: PlacedAssetSpec[];
  frailejones: FrailejonSpec[];
  terrainSampler: TerrainSampler;
}) {
  const materials = useMemo(() => {
    const leafTint = new THREE.Color(DEFAULT_LEAF_TINT);
    const stemColor = new THREE.Color(0x6b5a3f);
    const marcescentColor = new THREE.Color(0x8a7651);
    const flowerColor = new THREE.Color(DEFAULT_FLOWER_TINT);

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: stemColor,
      roughness: 0.96,
      metalness: 0.02,
      flatShading: false,
    });

    const marcescentMaterial = new THREE.MeshStandardMaterial({
      color: marcescentColor,
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
      color: leafTint,
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x2a3a26),
      emissiveIntensity: 0.18,
    });

    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: flowerColor,
      roughness: 0.7,
      metalness: 0.05,
      emissive: new THREE.Color(0x6b521a),
      emissiveIntensity: 0.12,
    });

    return { stemMaterial, marcescentMaterial, leafMaterial, flowerMaterial };
  }, []);

  const frailejonGroup = useMemo(() => {
    const group = new THREE.Group();
    frailejones
      .filter(
        ({ position: [x, z] }) =>
          !terrainSampler.isReservoirFootprint(x, z) &&
          !isInsidePlacedAssetFootprint(x, z, avoidAssets, 0.55),
      )
      .forEach((config) => {
        const [x, z] = config.position;
        const frailejon = buildFrailejon(config, {
          ...materials,
          leafMaterial: tintMaterial(
            materials.leafMaterial,
            config.leafTint ?? DEFAULT_LEAF_TINT,
          ),
          flowerMaterial: tintMaterial(
            materials.flowerMaterial,
            config.flowerTint ?? DEFAULT_FLOWER_TINT,
          ),
        });
        frailejon.position.set(
          x,
          terrainSampler.getHeight(x, z) + FRAILEJON_GROUND_OFFSET,
          z,
        );
        frailejon.rotation.y = config.rotationY;
        group.add(frailejon);
      });
    return group;
  }, [avoidAssets, frailejones, materials, terrainSampler]);

  return <primitive object={frailejonGroup} />;
}

function tintMaterial(base: THREE.Material, tint: number) {
  if (base instanceof THREE.MeshStandardMaterial) {
    const cloned = base.clone();
    cloned.color = new THREE.Color(tint);
    return cloned;
  }
  return base;
}
