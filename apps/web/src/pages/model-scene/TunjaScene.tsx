import { ContactShadows, OrbitControls } from "@react-three/drei";
import { CloudGroup } from "./CloudGroup";
import { ReservoirWater } from "./ReservoirWater";
import { TunjaTerrain } from "./Terrain";
import { TunjaEnvironment, TunjaLighting, TunjaSky } from "./TunjaSky";

export function TunjaScene({
  autoRotate = false,
  waterLevel = 1,
}: {
  autoRotate?: boolean;
  waterLevel?: number;
}) {
  return (
    <>
      <TunjaEnvironment />
      <TunjaSky />
      <TunjaLighting />
      <CloudGroup position={[-4.6, 4.75, -9.8]} scale={1.15} />
      <CloudGroup position={[0.8, 5.05, -10.5]} scale={0.9} />
      <CloudGroup position={[4.9, 4.6, -9.3]} scale={1.0} />
      <TunjaTerrain />
      <ReservoirWater level={waterLevel} />
      <ContactShadows
        position={[0, 0.02, 0]}
        scale={13}
        opacity={0.24}
        blur={2.8}
        far={7}
      />
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enableDamping
        enablePan={false}
        minDistance={6}
        maxDistance={13}
        maxPolarAngle={Math.PI * 0.46}
        target={[0, 0.75, -0.35]}
      />
    </>
  );
}
