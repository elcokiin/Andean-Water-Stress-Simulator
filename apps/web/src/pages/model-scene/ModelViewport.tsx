import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Float,
  Grid,
  OrbitControls,
  Sphere,
} from "@react-three/drei";
import { useMemo } from "react";

import type { Scenario } from "./model-data";

export function ModelViewport({
  isPlaying,
  selectedScenario,
}: {
  isPlaying: boolean;
  selectedScenario: Scenario;
}) {
  const reservoirScale = useMemo(
    () => Math.max(selectedScenario.reserve / 68, 0.24),
    [selectedScenario.reserve],
  );

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
        <color attach="background" args={["#06131b"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 10, 6]} intensity={1.1} />
        <Environment preset="city" />
        <Grid
          infiniteGrid
          fadeDistance={26}
          fadeStrength={4}
          cellColor="#2dd4bf"
          sectionColor="#0284c7"
        />
        <Float speed={1.4} rotationIntensity={0.32} floatIntensity={0.55}>
          <Sphere args={[1, 64, 64]} position={[0, 1.15, 0]}>
            <meshStandardMaterial
              color={selectedScenario.color}
              emissive={selectedScenario.emissive}
              emissiveIntensity={0.55}
              wireframe
            />
          </Sphere>
          <Sphere
            args={[0.72 * reservoirScale, 48, 48]}
            position={[0, 1.15, 0]}
          >
            <meshStandardMaterial
              color={selectedScenario.color}
              emissive={selectedScenario.color}
              emissiveIntensity={0.18}
              transparent
              opacity={0.38}
              roughness={0.22}
            />
          </Sphere>
        </Float>
        <OrbitControls
          autoRotate={isPlaying}
          autoRotateSpeed={0.55}
          enableDamping
          makeDefault
        />
      </Canvas>
    </div>
  );
}
