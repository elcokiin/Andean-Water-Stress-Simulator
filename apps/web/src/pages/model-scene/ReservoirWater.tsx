import { useMemo } from "react";
import * as THREE from "three";

export function ReservoirWater() {
  const waterGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-5.8, -0.2);
    shape.bezierCurveTo(-4.8, -1.5, -2.3, -1.9, 0.3, -1.55);
    shape.bezierCurveTo(2.7, -1.28, 5.5, -0.8, 6.0, 0.25);
    shape.bezierCurveTo(6.55, 1.38, 4.1, 2.18, 1.8, 2.22);
    shape.bezierCurveTo(-0.6, 2.24, -3.2, 1.85, -4.7, 1.0);
    shape.bezierCurveTo(-5.55, 0.52, -6.12, 0.22, -5.8, -0.2);
    return new THREE.ShapeGeometry(shape, 96);
  }, []);

  return (
    <group
      position={[0, 0.06, 0.3]}
      rotation={[-Math.PI / 2, 0, -0.08]}
      scale={[1.05, 1.45, 1]}
    >
      <mesh receiveShadow geometry={waterGeometry}>
        <meshPhysicalMaterial
          color="#0079c8"
          roughness={0.18}
          metalness={0}
          transmission={0}
          transparent
          opacity={0.94}
          clearcoat={0.72}
          clearcoatRoughness={0.12}
          envMapIntensity={1.05}
        />
      </mesh>
      <mesh position={[0, 0, 0.008]} geometry={waterGeometry}>
        <meshBasicMaterial
          color="#7bd4ff"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
