import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { SKY_FRAGMENT_SHADER, SKY_VERTEX_SHADER } from "./sky-shaders";

export function TunjaEnvironment() {
  return (
    <Environment
      background={false}
      environmentIntensity={0.42}
      environmentRotation={[3.95, 6.64, 6.27]}
      files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
      path="/assets/elemental-serenity/map/day/"
    />
  );
}

export function TunjaSky() {
  const uniforms = useMemo(
    () => ({
      uZenithColor: { value: new THREE.Color(0.0, 0.47, 0.85) },
      uHorizonColor: { value: new THREE.Color(0.55, 0.82, 0.97) },
      uGroundColor: { value: new THREE.Color(0.16, 0.45, 0.55) },
      uSunPosition: { value: new THREE.Vector3(-0.55, 0.46, -1.0) },
      uSunColor: { value: new THREE.Color(1.0, 0.98, 0.86) },
      uSunGlowColor: { value: new THREE.Color(1.0, 0.76, 0.32) },
    }),
    [],
  );

  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[150, 64, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function TunjaLighting() {
  return (
    <>
      <ambientLight color="#fff9ed" intensity={0.5} />
      <directionalLight
        castShadow
        color="#fff2d0"
        intensity={2.2}
        position={[-9, 11, 7]}
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        color="#7fc8ff"
        intensity={0.55}
        position={[8, 4, -7]}
      />
      <directionalLight
        color="#d8f2ff"
        intensity={0.25}
        position={[0, 8, -12]}
      />
    </>
  );
}
