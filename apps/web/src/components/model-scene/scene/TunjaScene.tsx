import { citySceneConfigs } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./ModelScene";

type SceneTheme = "light" | "dark";

export function TunjaScene({
  autoRotate = false,
  fogIntensity = 1,
  theme,
  waterLevel = 1,
}: {
  autoRotate?: boolean;
  fogIntensity?: number;
  theme: SceneTheme;
  waterLevel?: number;
}) {
  return (
    <ModelScene
      autoRotate={autoRotate}
      city={citySceneConfigs.tunja}
      fogIntensity={fogIntensity}
      showWater={citySceneConfigs.tunja.reservoir.visible}
      theme={theme}
      waterLevel={waterLevel}
    />
  );
}
