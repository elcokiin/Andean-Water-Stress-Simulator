export const MAX_RIPPLES = 12;

export const WATER_SURFACE_VERTEX = `
  attribute float aShore;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;
  varying float vShore;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vShore = aShore;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const WATER_SURFACE_FRAGMENT = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uRippleLife;
  uniform float uRippleStrength;
  uniform float uRippleSpeed;
  uniform float uWaveAmp;
  uniform float uFresnelStrength;
  uniform vec2 uBounds;
  uniform vec3 uBaseColor;
  uniform vec3 uDeepColor;
  uniform vec2 uRippleCenters[${MAX_RIPPLES}];
  uniform float uRippleTimes[${MAX_RIPPLES}];

  uniform sampler2D uWaterSim;
  uniform sampler2D uTerrainHeightmap;
  uniform vec2 uTerrainSize;
  uniform vec2 uReservoirOffset;

  uniform samplerCube uEnvMap;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uReflectionStrength;
  uniform float uSpecularStrength;
  uniform float uSpecularPower;

  // Optional position-based regional color overrides. When uRegionalStrength
  // is zero these have no effect, keeping the default look intact.
  uniform vec3 uEmeraldColor;
  uniform vec3 uNavyColor;
  uniform vec3 uSkyColor;
  uniform vec3 uGlintColor;
  uniform float uRegionalStrength;
  uniform float uEmeraldMix;
  uniform float uNavyMix;
  uniform float uSkyMix;
  uniform float uGlintSpecularBoost;
  uniform float uGlintAdd;

  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;
  varying float vShore;

  float rippleHeight(vec2 pos) {
    float height = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      float age = uTime - uRippleTimes[i];
      float isActive = step(0.0, age) * step(age, uRippleLife);
      float dist = length(pos - uRippleCenters[i]);
      float wave = sin((dist - age * uRippleSpeed) * 12.0);
      float falloff = exp(-dist * 3.4) * exp(-age * 1.1);
      height += wave * falloff * uRippleStrength * isActive;
    }
    float noise = sin(pos.x * 6.2 + uTime * 0.6) * sin(pos.y * 5.1 + uTime * 0.4);
    height += noise * uWaveAmp;
    return height;
  }

  vec3 sampleSky(vec3 dir) {
    return textureCube(uEnvMap, normalize(dir)).rgb;
  }

  void main() {
    vec2 terrainUv = (vWorldPosition.xz - uReservoirOffset) / uTerrainSize + 0.5;
    float terrainHeight = texture2D(uTerrainHeightmap, terrainUv).r;
    if (terrainHeight > vWorldPosition.y) discard;

    vec2 pos = vLocalPosition.xy;
    float height = rippleHeight(pos);

    vec2 simUv = pos / uBounds * 0.5 + 0.5;
    vec4 simData = texture2D(uWaterSim, simUv);
    height += simData.r * 2.0;

    float dx = dFdx(height);
    float dy = dFdy(height);

    vec3 gpuNorm = vec3(simData.b, simData.a, sqrt(1.0 - dot(simData.ba, simData.ba)));
    vec3 worldNormal = normalize(vec3(-dx, -dy, 1.0) + gpuNorm * 0.5);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Fresnel for how much sky reflects vs water body color shows through.
    float fresnel = pow(1.0 - max(dot(worldNormal, viewDir), 0.0), 4.0);
    fresnel = mix(0.04, 1.0, fresnel) * uFresnelStrength;

    // Reflect the cubemap in the surface.
    vec3 reflectDir = reflect(-viewDir, worldNormal);
    vec3 skyReflection = sampleSky(reflectDir);

    // Soft horizon tint for the body color (slight green/teal shift in mid depths
    // to feel like real Andean reservoir water).
    vec2 scaled = pos / uBounds;
    float depth = clamp(1.0 - length(scaled), 0.0, 1.0);
    vec3 waterColor = mix(uBaseColor, uDeepColor, depth);
    vec3 deepTint = mix(waterColor, waterColor * vec3(0.78, 0.95, 0.92), 0.18);
    waterColor = mix(waterColor, deepTint, depth);

    // Subtle ambient pickup from the sky above.
    vec3 skyAmbient = sampleSky(vec3(0.0, 1.0, 0.0)) * 0.18;
    waterColor += skyAmbient * (1.0 - depth);

    // Regional color zones for scene-specific water appearance (Tunja uses
    // this to honor the "Laguna Verde" name with an emerald shallows, a
    // marine-blue depth, a sky-blue mirror at the dam, and silver glints on
    // the sun-facing side). When uRegionalStrength is zero the masks fall
    // back to zero and the base/deep gradient is unchanged.
    float regional = clamp(uRegionalStrength, 0.0, 1.0);
    float rightMask = smoothstep(0.05, 0.85, scaled.x);   // +x in local -> camera left
    float leftMask = smoothstep(0.05, 0.85, -scaled.x);   // -x in local -> camera right
    float backMask = smoothstep(0.05, 0.85, scaled.y);   // +y in local -> back/dam
    float frontMask = smoothstep(0.05, 0.85, -scaled.y);  // -y in local -> foreground

    // Lower-left of the water (in screen space) — emerald/green for Tunja.
    float emeraldZone = rightMask * frontMask;
    // Lower-right and deep/shadow water — deep marine blue.
    float navyZone = leftMask * (0.55 + 0.45 * frontMask) * (0.45 + 0.55 * depth);
    // Background water that mirrors the sky — light blue.
    float skyZone = backMask * (1.0 - 0.4 * depth);
    // Sun-facing side of the surface — bright white/silver glints.
    float glintZone = rightMask * (0.4 + 0.6 * backMask);

    waterColor = mix(waterColor, uEmeraldColor, clamp(emeraldZone * uEmeraldMix, 0.0, 1.0) * regional);
    waterColor = mix(waterColor, uNavyColor, clamp(navyZone * uNavyMix, 0.0, 1.0) * regional);
    waterColor = mix(waterColor, uSkyColor, clamp(skyZone * uSkyMix, 0.0, 1.0) * regional);

    // Blend in the cubemap reflection.
    waterColor = mix(waterColor, skyReflection, fresnel * uReflectionStrength);

    // Sun specular: only on the side of the surface that faces the sun.
    vec3 sunDir = normalize(uSunDirection);
    vec3 halfDir = normalize(sunDir + viewDir);
    float specAngle = max(dot(worldNormal, halfDir), 0.0);
    float sunMask = max(dot(worldNormal, sunDir), 0.0);
    float specular = pow(specAngle, uSpecularPower) * sunMask * uSpecularStrength;
    // Boost the specular on the sun-facing side to make the silver glints pop.
    specular *= 1.0 + glintZone * uGlintSpecularBoost * regional;
    waterColor += uSunColor * specular;

    // Additive white glint on the sun-facing side, evoking a strong specular
    // highlight on the surface where light hits it most directly.
    waterColor += uGlintColor * glintZone * uGlintAdd * regional;

    // Foam at shore (mix in gently so the reflection is preserved).
    vec3 foamColor = vec3(0.96, 0.98, 1.0);
    float foamStrength = clamp(vShore, 0.0, 1.0) * 0.85;
    waterColor = mix(waterColor, foamColor, foamStrength);

    float alpha = uOpacity * (0.62 + fresnel * 0.38);
    gl_FragColor = vec4(waterColor, alpha);
  }
`;

export const BED_VERTEX = `
  varying vec3 vLocalPosition;
  varying float vDepth;

  uniform float uDepth;
  uniform vec2 uBounds;

  void main() {
    vec3 displaced = position;
    vec2 scaled = displaced.xy / uBounds;
    float radial = clamp(length(scaled), 0.0, 1.0);
    float bowl = smoothstep(0.0, 1.0, 1.0 - radial);
    float depth = bowl * uDepth;
    displaced.z -= depth;
    vDepth = depth;
    vLocalPosition = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const BED_FRAGMENT = `
  uniform float uTime;
  uniform float uCausticsStrength;
  uniform vec2 uBounds;
  uniform vec3 uBedColor;
  uniform vec3 uCausticsColor;

  uniform sampler2D uCausticsTex;

  varying vec3 vLocalPosition;
  varying float vDepth;

  float caustics(vec2 p) {
    float t = uTime * 0.8;
    float a = sin((p.x * 6.3 + t) + sin(p.y * 3.1 - t * 0.6));
    float b = sin((p.y * 7.1 - t * 0.7) + sin(p.x * 2.7 + t * 0.4));
    float c = sin((p.x + p.y) * 4.0 - t * 1.2);
    float pattern = (a + b + c) * 0.33;
    float caustic = smoothstep(0.35, 0.75, pattern);
    return caustic;
  }

  void main() {
    vec2 scaled = vLocalPosition.xy / uBounds;
    float depth = clamp(1.0 - length(scaled), 0.0, 1.0);
    float depthShade = clamp(vDepth / 0.35, 0.0, 1.0);
    vec3 baseColor = mix(uBedColor, uBedColor * 0.55, depth * 0.5 + depthShade * 0.5);

    float causticMask = caustics(scaled);
    vec2 causticUv = vLocalPosition.xy / uBounds * 0.5 + 0.5;
    float gpuCaustics = texture2D(uCausticsTex, causticUv).r;

    vec3 causticColor = uCausticsColor * max(causticMask * uCausticsStrength, (gpuCaustics * 2.0));

    gl_FragColor = vec4(baseColor + causticColor, 1.0);
  }
`;
