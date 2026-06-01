import { citySceneConfigs } from "@/src/lib/hydrosim/city-scenes";
import { ModelScene } from "./ModelScene";

type SceneTheme = "light" | "dark";

export function TunjaScene({
  autoRotate = false,
  theme,
  waterLevel = 1,
}: {
  autoRotate?: boolean;
  theme: SceneTheme;
  waterLevel?: number;
}) {
  return (
    <ModelScene
      autoRotate={autoRotate}
      city={citySceneConfigs.tunja}
      theme={theme}
      waterLevel={waterLevel}
    />
  );
}
