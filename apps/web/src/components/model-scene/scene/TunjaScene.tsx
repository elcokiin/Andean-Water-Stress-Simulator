import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./ModelScene";

type SceneTheme = "light" | "dark";

export function TunjaScene({
  autoRotate = false,
  fogIntensity = 1,
  theme,
  waterLevel = 1,
  reservoir = "tunja",
}: {
  autoRotate?: boolean;
  fogIntensity?: number;
  theme: SceneTheme;
  waterLevel?: number;
  reservoir?: "tunja" | "duitama" | "sogamoso";
}) {
  const city = getCitySceneConfig(reservoir);
  return (
    <ModelScene
      autoRotate={autoRotate}
      city={city}
      fogIntensity={fogIntensity}
      showWater={city.reservoir.visible}
      theme={theme}
      waterLevel={waterLevel}
    />
  );
}
