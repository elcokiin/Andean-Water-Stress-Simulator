import { useMemo } from "react";
import * as THREE from "three";
import { EzTreeForest, ForegroundShrubs } from "./Vegetation";
import { getTerrainHeight } from "./terrain-height";

const SEGMENTS = 100;

export function TunjaTerrain() {
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

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#4a7a3c"
          roughness={0.96}
          metalness={0.01}
        />
      </mesh>

      <EzTreeForest />
      <ForegroundShrubs />
    </group>
  );
}
