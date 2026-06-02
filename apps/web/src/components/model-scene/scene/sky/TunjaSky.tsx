import { Environment, Stars } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

import {
  CUBEMAP_FILES,
  DAY_ENVIRONMENT,
  NIGHT_ENVIRONMENT,
  type SkyTheme,
  useSkyEnvironment,
} from "./sky-config";

function ModelBackground({ theme }: { theme: SkyTheme }) {
  const { scene } = useThree();
  const backgroundMap = useSkyEnvironment(theme);
  const isNight = theme === "dark";
  const settings = isNight ? NIGHT_ENVIRONMENT : DAY_ENVIRONMENT;

  useEffect(() => {
    const previousBackground = scene.background;
    const previousBackgroundIntensity = scene.backgroundIntensity;
    const previousBackgroundBlurriness = scene.backgroundBlurriness;

    scene.background = backgroundMap;
    scene.backgroundIntensity = settings.backgroundIntensity;
    scene.backgroundBlurriness = settings.backgroundBlurriness;

    return () => {
      scene.background = previousBackground;
      scene.backgroundIntensity = previousBackgroundIntensity;
      scene.backgroundBlurriness = previousBackgroundBlurriness;
    };
  }, [
    backgroundMap,
    scene,
    settings.backgroundBlurriness,
    settings.backgroundIntensity,
  ]);

  return null;
}

export function ModelEnvironment({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";
  const settings = isNight ? NIGHT_ENVIRONMENT : DAY_ENVIRONMENT;

  return (
    <>
      <ModelBackground theme={theme} />
      <Environment
        key={theme}
        environmentIntensity={settings.environmentIntensity}
        environmentRotation={settings.environmentRotation}
        files={CUBEMAP_FILES}
        path={`/assets/elemental-serenity/map/${isNight ? "night" : "day"}/`}
      />
    </>
  );
}

export function ModelSky({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";

  if (!isNight) return null;

  return (
    <Stars
      radius={110}
      depth={48}
      count={1400}
      factor={3.4}
      saturation={0.12}
      fade
      speed={0.06}
    />
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
