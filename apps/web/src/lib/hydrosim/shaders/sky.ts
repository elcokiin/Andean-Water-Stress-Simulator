export const SKY_VERTEX_SHADER = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = normalize(worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const SKY_FRAGMENT_SHADER = `
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uGroundColor;
  uniform vec3 uSunPosition;
  uniform vec3 uSunColor;
  uniform vec3 uSunGlowColor;

  varying vec3 vWorldPosition;

  vec3 sunGlow(vec3 direction) {
    vec3 sunDir = normalize(uSunPosition);
    float distFromSun = acos(clamp(dot(direction, sunDir), -1.0, 1.0));
    float disc = smoothstep(0.026, 0.018, distFromSun);
    float glow = smoothstep(0.16, 0.0, distFromSun);
    return uSunGlowColor * glow * 0.35 + uSunColor * disc;
  }

  void main() {
    vec3 direction = normalize(vWorldPosition);
    float altitude = direction.y;
    float skyMix = smoothstep(-0.08, 0.88, altitude);
    vec3 upperSky = mix(uHorizonColor, uZenithColor, skyMix * skyMix);
    vec3 skyColor = mix(uGroundColor, upperSky, smoothstep(-0.52, 0.08, altitude));
    float horizonGlow = pow(1.0 - abs(altitude), 3.0);
    vec3 finalColor = skyColor + sunGlow(direction) + vec3(0.5, 0.72, 0.92) * horizonGlow * 0.08;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
