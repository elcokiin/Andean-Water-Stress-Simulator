import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
  CUBEMAP_FILES,
  DAY_ENVIRONMENT,
  NIGHT_ENVIRONMENT,
  type SkyTheme,
} from "./sky-config";

const SKYDOME_VERTEX_SHADER = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = normalize(worldPosition.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKYDOME_FRAGMENT_SHADER = `
uniform vec3 uZenithColor;
uniform vec3 uHorizonColor;
uniform vec3 uGroundColor;
uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform vec3 uSunGlowColor;
uniform float uSunSize;
uniform float uSunGlowSize;
uniform float uSunRayCount;
uniform float uSunRayLength;
uniform float uSunRaySharpness;
uniform vec3 uMoonPosition;
uniform vec3 uMoonColor;
uniform vec3 uMoonGlowColor;
uniform float uMoonSize;
uniform float uMoonGlowSize;
uniform vec3 uStarColor;
uniform float uStarDensity;
uniform float uStarBrightness;
uniform float uTime;
uniform float uIsNight;

varying vec3 vWorldPosition;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec3 animeSun(
  vec3 direction,
  vec3 sunDir,
  vec3 sunColor,
  vec3 glowColor,
  float sunSize,
  float glowSize,
  float rayCount,
  float rayLength,
  float raySharpness
) {
  float sunDot = dot(direction, sunDir);

  if (sunDot < 0.85) {
    float distFromSun = acos(clamp(sunDot, -1.0, 1.0));
    float outerGlow = smoothstep(glowSize * 2.0, 0.0, distFromSun);
    return glowColor * (outerGlow * outerGlow * 0.3) * vec3(1.0, 0.8, 0.6);
  }

  float distFromSun = acos(sunDot);
  vec3 result = vec3(0.0);
  vec3 sunRight = normalize(cross(sunDir, vec3(0.0, 1.0, 0.0)));
  vec3 sunUp = normalize(cross(sunRight, sunDir));
  float sunX = dot(direction - sunDir * sunDot, sunRight);
  float sunY = dot(direction - sunDir * sunDot, sunUp);
  float angle = atan(sunY, sunX);

  float outerGlow = smoothstep(glowSize * 2.0, 0.0, distFromSun);
  result += glowColor * (outerGlow * outerGlow * 0.3) * vec3(1.0, 0.8, 0.6);

  float rayPattern = pow(cos(angle * rayCount) * 0.5 + 0.5, raySharpness);
  float rayStart = sunSize * 0.8;
  float rayEnd = sunSize + rayLength;
  float rayMask = smoothstep(rayEnd, rayStart, distFromSun) *
    smoothstep(sunSize * 0.5, rayStart, distFromSun);
  result += mix(sunColor, glowColor, 0.5) * (rayPattern * rayMask * 0.8);

  float midGlow = smoothstep(glowSize, sunSize * 0.5, distFromSun) *
    smoothstep(sunSize * 0.3, sunSize * 0.8, distFromSun);
  float innerGlow = smoothstep(sunSize * 1.5, sunSize * 0.9, distFromSun);
  result += glowColor * midGlow * 0.6;
  result += mix(glowColor, sunColor, 0.7) * (innerGlow * innerGlow * 0.5);

  float discMask = smoothstep(sunSize, sunSize * 0.85, distFromSun);
  float discGradient = smoothstep(sunSize, 0.0, distFromSun);
  vec3 discColor = mix(sunColor * 0.95, sunColor * 1.2, discGradient) +
    vec3(0.1, 0.05, 0.0) * (1.0 - discGradient);

  result = mix(result, discColor, discMask);
  result += vec3(1.0, 0.98, 0.9) *
    pow(smoothstep(sunSize * 0.4, 0.0, distFromSun), 2.0) * 0.3;

  return result;
}

float stars(vec2 uv, float density) {
  vec2 starUv = uv * 30.0;
  vec2 starId = floor(starUv);
  vec2 starPos = fract(starUv);
  float star = 0.0;

  for (int x = 0; x <= 1; x++) {
    for (int y = 0; y <= 1; y++) {
      vec2 cellId = starId + vec2(float(x), float(y));
      float cellHash = hash(cellId);

      if (cellHash < density * 0.12) {
        vec2 starCenter = fract(sin(cellId * vec2(12.9898, 78.233)) * 43758.5453) * 0.8 + 0.1;
        vec2 starLocalPos = starPos - vec2(float(x), float(y)) - starCenter;
        float dist = length(starLocalPos);
        float brightness = cellHash * 0.5 + 0.5;
        float starSize = 0.025 + brightness * 0.015;
        float starIntensity = max(0.0, 1.0 - dist * (1.0 / starSize));
        star += brightness * starIntensity * starIntensity;
      }
    }
  }

  return min(star, 1.0);
}

void main() {
  vec3 direction = normalize(vWorldPosition);
  float altitude = direction.y;
  float skyFactor = altitude > 0.0
    ? altitude * altitude * sqrt(altitude)
    : -altitude * altitude * altitude;
  vec3 skyColor = altitude > 0.0
    ? mix(uHorizonColor, uZenithColor, skyFactor)
    : mix(uHorizonColor, uGroundColor, skyFactor);
  vec3 finalColor = skyColor;

  if (uIsNight < 0.5) {
    vec3 sunDir = normalize(uSunPosition);
    finalColor += animeSun(
      direction,
      sunDir,
      uSunColor,
      uSunGlowColor,
      uSunSize,
      uSunGlowSize,
      uSunRayCount,
      uSunRayLength,
      uSunRaySharpness
    );
  } else {
    vec3 moonDir = normalize(uMoonPosition);
    float moonDot = dot(direction, moonDir);
    float distFromMoon = acos(clamp(moonDot, -1.0, 1.0));

    float outerGlow = pow(smoothstep(uMoonGlowSize * 3.0, 0.0, distFromMoon), 3.0);
    finalColor += uMoonGlowColor * outerGlow * 0.15;

    float midGlow = pow(smoothstep(uMoonGlowSize * 1.5, uMoonSize * 0.5, distFromMoon), 2.0);
    finalColor += uMoonGlowColor * midGlow * 0.25;

    float innerHalo = smoothstep(uMoonSize * 1.8, uMoonSize * 0.95, distFromMoon);
    innerHalo *= smoothstep(uMoonSize * 0.7, uMoonSize * 0.95, distFromMoon);
    finalColor += mix(uMoonGlowColor, uMoonColor, 0.5) * innerHalo * 0.4;

    if (distFromMoon < uMoonSize) {
      float moonMask = smoothstep(uMoonSize, uMoonSize * 0.85, distFromMoon);
      vec2 moonUv = (direction.xy - moonDir.xy) * 20.0;
      float craters = noise(moonUv * 5.0) * 0.3;
      float discGradient = smoothstep(uMoonSize, 0.0, distFromMoon);
      vec3 moonSurface = uMoonColor * (0.75 + craters + discGradient * 0.15);
      finalColor = mix(finalColor, moonSurface, moonMask);
      finalColor += vec3(1.0, 1.0, 0.98) *
        pow(smoothstep(uMoonSize * 0.4, 0.0, distFromMoon), 2.0) * 0.15;
    }

    float starVisibility = smoothstep(-0.3, 0.2, direction.y);
    if (starVisibility > 0.01) {
      vec2 starUv = vec2(
        atan(direction.z, direction.x) * 0.15915 + 0.5,
        acos(clamp(direction.y, -1.0, 1.0)) * 0.31831
      );
      float starField = stars(starUv, uStarDensity);
      finalColor += uStarColor * starField * uStarBrightness * starVisibility;
    }
  }

  float atmosphereGlow = 1.0 - abs(altitude);
  finalColor += vec3(0.5, 0.7, 1.0) * pow(atmosphereGlow, 3.0) * 0.035;

  float timeVariation = sin(uTime * 0.1) * 0.01;
  finalColor += vec3(timeVariation, timeVariation * 0.5, timeVariation * 0.3);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const SKY_COLORS = {
  light: {
    zenithColor: new THREE.Color(0.0, 0.35, 0.82),
    horizonColor: new THREE.Color(0.46, 0.74, 0.93),
    groundColor: new THREE.Color(0.04, 0.55, 0.65),
    sunColor: new THREE.Color(0.639, 0.494, 0.058),
    sunGlowColor: new THREE.Color(1.0, 0.635, 0),
    moonColor: new THREE.Color(0.95, 0.95, 1.0),
    moonGlowColor: new THREE.Color(0x738ec4),
    starColor: new THREE.Color(1.0, 1.0, 1.0),
  },
  dark: {
    zenithColor: new THREE.Color(0.02, 0.05, 0.15),
    horizonColor: new THREE.Color(0.05, 0.1, 0.25),
    groundColor: new THREE.Color(0.1, 0.15, 0.3),
    sunColor: new THREE.Color(0.639, 0.494, 0.058),
    sunGlowColor: new THREE.Color(1.0, 0.635, 0),
    moonColor: new THREE.Color(0.95, 0.95, 1.0),
    moonGlowColor: new THREE.Color(0x738ec4),
    starColor: new THREE.Color(1.0, 1.0, 1.0),
  },
} satisfies Record<SkyTheme, Record<string, THREE.Color>>;

function SceneBackgroundReset() {
  const { scene } = useThree();

  useEffect(() => {
    const previousBackground = scene.background;
    scene.background = null;

    return () => {
      scene.background = previousBackground;
    };
  }, [scene]);

  return null;
}

export function ModelEnvironment({ theme }: { theme: SkyTheme }) {
  const isNight = theme === "dark";
  const settings = isNight ? NIGHT_ENVIRONMENT : DAY_ENVIRONMENT;

  return (
    <>
      <SceneBackgroundReset />
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
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uZenithColor: { value: SKY_COLORS[theme].zenithColor.clone() },
      uHorizonColor: { value: SKY_COLORS[theme].horizonColor.clone() },
      uGroundColor: { value: SKY_COLORS[theme].groundColor.clone() },
      uSunPosition: { value: new THREE.Vector3(-0.846, -0.085, -1.0) },
      uSunColor: { value: SKY_COLORS[theme].sunColor.clone() },
      uSunGlowColor: { value: SKY_COLORS[theme].sunGlowColor.clone() },
      uSunSize: { value: 0.005 },
      uSunGlowSize: { value: 0.03386 },
      uSunRayCount: { value: 12.0 },
      uSunRayLength: { value: 0.0352 },
      uSunRaySharpness: { value: 8.0 },
      uMoonPosition: { value: new THREE.Vector3(-0.5, -0.085, -1.0) },
      uMoonColor: { value: SKY_COLORS[theme].moonColor.clone() },
      uMoonGlowColor: { value: SKY_COLORS[theme].moonGlowColor.clone() },
      uMoonSize: { value: 0.0268665 },
      uMoonGlowSize: { value: 0.0266345 },
      uStarColor: { value: SKY_COLORS[theme].starColor.clone() },
      uStarDensity: { value: 10.0 },
      uStarBrightness: { value: 2.5 },
      uTime: { value: 0 },
      uIsNight: { value: isNight ? 1.0 : 0.0 },
    }),
    [isNight, theme],
  );

  useEffect(() => {
    const skyColors = SKY_COLORS[theme];
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uZenithColor.value.copy(skyColors.zenithColor);
    material.uniforms.uHorizonColor.value.copy(skyColors.horizonColor);
    material.uniforms.uGroundColor.value.copy(skyColors.groundColor);
    material.uniforms.uSunColor.value.copy(skyColors.sunColor);
    material.uniforms.uSunGlowColor.value.copy(skyColors.sunGlowColor);
    material.uniforms.uMoonColor.value.copy(skyColors.moonColor);
    material.uniforms.uMoonGlowColor.value.copy(skyColors.moonGlowColor);
    material.uniforms.uStarColor.value.copy(skyColors.starColor);
    material.uniforms.uIsNight.value = isNight ? 1.0 : 0.0;
  }, [isNight, theme]);

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <sphereGeometry args={[150, 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={SKYDOME_VERTEX_SHADER}
        fragmentShader={SKYDOME_FRAGMENT_SHADER}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
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
