export function CloudGroup({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.7, 18, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.55, 0.08, 0]}>
        <sphereGeometry args={[0.5, 18, 10]} />
        <meshBasicMaterial color="#f4fbff" transparent opacity={0.88} />
      </mesh>
      <mesh position={[-0.55, -0.02, 0]}>
        <sphereGeometry args={[0.45, 18, 10]} />
        <meshBasicMaterial color="#f8fcff" transparent opacity={0.86} />
      </mesh>
    </group>
  );
}
