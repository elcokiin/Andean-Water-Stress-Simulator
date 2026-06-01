export function CloudGroup({
  mode = "day",
  position,
  scale,
}: {
  mode?: "day" | "night";
  position: [number, number, number];
  scale: number;
}) {
  const colors =
    mode === "night"
      ? ["#b9c8df", "#9fb2ce", "#c6d3e8"]
      : ["#ffffff", "#f4fbff", "#f8fcff"];
  const opacity = mode === "night" ? 0.62 : 0.9;

  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.7, 12, 8]} />
        <meshBasicMaterial color={colors[0]} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.55, 0.08, 0]}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshBasicMaterial
          color={colors[1]}
          transparent
          opacity={opacity * 0.96}
        />
      </mesh>
      <mesh position={[-0.55, -0.02, 0]}>
        <sphereGeometry args={[0.45, 12, 8]} />
        <meshBasicMaterial
          color={colors[2]}
          transparent
          opacity={opacity * 0.94}
        />
      </mesh>
    </group>
  );
}
