import { useMemo } from "react";
import { Environment, Stars } from "@react-three/drei";
import * as THREE from "three";

import {
  SKY_FRAGMENT_SHADER,
  SKY_VERTEX_SHADER,
} from "@/src/lib/hydrosim/shaders/sky";

type SkyTheme = "light" | "dark";

export function ModelEnvironment({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";

  return (
    <Environment
      key={theme}
      background={false}
      environmentIntensity={isNight ? 0.18 : 0.42}
      environmentRotation={isNight ? [3.45, 5.9, 6.1] : [3.95, 6.64, 6.27]}
      files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
      path={`/assets/elemental-serenity/map/${isNight ? "night" : "day"}/`}
    />
  );
}

export function ModelSky({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";
  const uniforms = useMemo(
    () => ({
      uZenithColor: {
        value: new THREE.Color(isNight ? "#07152c" : "#0078d9"),
      },
      uHorizonColor: {
        value: new THREE.Color(isNight ? "#162845" : "#8cd1f7"),
      },
      uGroundColor: {
        value: new THREE.Color(isNight ? "#071018" : "#29738c"),
      },
      uSunPosition: {
        value: new THREE.Vector3(
          isNight ? 0.42 : -0.55,
          isNight ? 0.62 : 0.46,
          -1.0,
        ),
      },
      uSunColor: {
        value: new THREE.Color(isNight ? "#d8e8ff" : "#fffbe0"),
      },
      uSunGlowColor: {
        value: new THREE.Color(isNight ? "#7aa8ff" : "#ffc252"),
      },
    }),
    [isNight],
  );

  return (
    <>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[150, 64, 32]} />
        <shaderMaterial
          key={theme}
          uniforms={uniforms}
          vertexShader={SKY_VERTEX_SHADER}
          fragmentShader={SKY_FRAGMENT_SHADER}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {isNight ? (
        <Stars
          radius={95}
          depth={42}
          count={900}
          factor={3.1}
          saturation={0.15}
          fade
          speed={0.08}
        />
      ) : null}
    </>
  );
}

export function ModelLighting({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";

  return (
    <>
      <ambientLight
        color={isNight ? "#b6d1ff" : "#fff9ed"}
        intensity={isNight ? 0.24 : 0.5}
      />
      <directionalLight
        castShadow
        color={isNight ? "#d9e8ff" : "#fff2d0"}
        intensity={isNight ? 0.78 : 2.2}
        position={isNight ? [7, 9, -5] : [-9, 11, 7]}
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        color={isNight ? "#5974c8" : "#7fc8ff"}
        intensity={isNight ? 0.24 : 0.55}
        position={[8, 4, -7]}
      />
      <directionalLight
        color={isNight ? "#2f477f" : "#d8f2ff"}
        intensity={isNight ? 0.16 : 0.25}
        position={[0, 8, -12]}
      />
    </>
  );
}

export {
  ModelEnvironment as TunjaEnvironment,
  ModelLighting as TunjaLighting,
  ModelSky as TunjaSky,
};
