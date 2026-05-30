import { useMemo } from "react";
import * as THREE from "three";
import { EzTreeForest, ForegroundShrubs } from "./Vegetation";

type RidgeProps = {
  color: string;
  points: Array<[number, number]>;
  position: [number, number, number];
  scale?: [number, number, number];
};

function MountainRidge({
  color,
  points,
  position,
  scale = [1, 1, 1],
}: RidgeProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], 0);
    points.forEach(([x, y]) => shape.lineTo(x, y));
    shape.lineTo(points[points.length - 1][0], -0.08);
    shape.lineTo(points[0][0], -0.08);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  return (
    <mesh position={position} scale={scale} receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        roughness={0.96}
        metalness={0.01}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function TunjaTerrain() {
  const farRidge = useMemo(
    () =>
      [
        [-7.5, 0.4],
        [-6.0, 1.25],
        [-4.4, 1.85],
        [-2.8, 2.0],
        [-1.2, 1.62],
        [0.2, 1.35],
        [1.8, 1.48],
        [3.4, 1.18],
        [5.1, 1.0],
        [7.5, 0.72],
      ] satisfies Array<[number, number]>,
    [],
  );

  const nearRidge = useMemo(
    () =>
      [
        [-7.5, 0.28],
        [-6.0, 0.92],
        [-4.7, 1.1],
        [-3.2, 0.74],
        [-1.6, 0.62],
        [0.2, 0.83],
        [2.0, 0.62],
        [3.5, 0.78],
        [5.4, 0.54],
        [7.5, 0.44],
      ] satisfies Array<[number, number]>,
    [],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 13, 1, 1]} />
        <meshStandardMaterial color="#47783e" roughness={0.96} />
      </mesh>

      <MountainRidge
        color="#598b48"
        points={farRidge}
        position={[0, 0.08, -5.2]}
        scale={[1.16, 1.4, 1]}
      />
      <MountainRidge
        color="#315f3f"
        points={nearRidge}
        position={[0, 0.12, -3.9]}
        scale={[1.08, 1.2, 1]}
      />

      <EzTreeForest />
      <ForegroundShrubs />
    </group>
  );
}
