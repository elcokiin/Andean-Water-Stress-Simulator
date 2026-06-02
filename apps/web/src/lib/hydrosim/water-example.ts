import * as THREE from "three"
import { createNoise2D } from "simplex-noise"
import "./style.css"

/* ----------------------------------------------------------------------------
 * Simulador de nivel del embalse
 * Escena 3D con terreno tipo cuenca, agua animada y nivel controlable.
 * -------------------------------------------------------------------------- */

// --- Domain constants (a la Lago de Tota: ~3015 msnm) -----------------------
const FLOOR_ELEV = 2990 // cota del lecho (msnm) -> nivel 0%
const CREST_ELEV = 3018 // cota de coronación (msnm) -> nivel 100%

// --- Geometry constants -----------------------------------------------------
const TERRAIN_SIZE = 220
const TERRAIN_SEG = 200
const WATER_MARGIN = 0.5 // agua ligeramente más extensa que el terreno
// Rango vertical del agua en unidades de escena
const WATER_MIN_Y = -7.5
const WATER_MAX_Y = 9.0

const canvas = document.getElementById("scene") as HTMLCanvasElement

// --- Renderer ---------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// --- Scene & sky ------------------------------------------------------------
const scene = new THREE.Scene()
scene.background = new THREE.Color("#bfe0f2")
scene.fog = new THREE.Fog("#cfe6f4", 180, 420)

// --- Camera -----------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)

// --- Lights -----------------------------------------------------------------
const hemi = new THREE.HemisphereLight("#dff1ff", "#3a5a3f", 0.9)
scene.add(hemi)

const sun = new THREE.DirectionalLight("#fff6e6", 1.5)
sun.position.set(-80, 110, 60)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.near = 1
sun.shadow.camera.far = 400
sun.shadow.camera.left = -140
sun.shadow.camera.right = 140
sun.shadow.camera.top = 140
sun.shadow.camera.bottom = -140
sun.shadow.bias = -0.0004
scene.add(sun)

// ----------------------------------------------------------------------------
// TERRAIN — basin shape: high rim of hills, deep center (the reservoir bowl)
// ----------------------------------------------------------------------------
const noise2D = createNoise2D(() => 0.42) // semilla fija -> terreno determinista

function basinHeight(x: number, z: number): number {
  // distancia normalizada al centro (0 centro, 1 borde)
  const d = Math.sqrt(x * x + z * z) / (TERRAIN_SIZE * 0.5)
  // cuenca: profundo en el centro, montañas en el borde
  const bowl = THREE.MathUtils.smoothstep(d, 0.18, 0.92)
  const base = -10 + bowl * 30 // -10 (fondo) .. +20 (cresta)

  // colinas de ruido fractal, más pronunciadas hacia el borde
  let n = 0
  n += noise2D(x * 0.02, z * 0.02) * 6
  n += noise2D(x * 0.05, z * 0.05) * 2.5
  n += noise2D(x * 0.11, z * 0.11) * 1.0
  const hills = n * (0.3 + bowl * 1.1)

  return base + hills
}

const terrainGeo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEG, TERRAIN_SEG)
terrainGeo.rotateX(-Math.PI / 2)

const tPos = terrainGeo.attributes.position as THREE.BufferAttribute
const colors: number[] = []

// paleta: arena costera -> verde laderas -> roca/marrón cumbres
const cSand = new THREE.Color("#d9c39a")
const cGrass = new THREE.Color("#5c8a4a")
const cForest = new THREE.Color("#33683a")
const cRock = new THREE.Color("#8a7a63")
const cBed = new THREE.Color("#3b6a52") // lecho sumergido

for (let i = 0; i < tPos.count; i++) {
  const x = tPos.getX(i)
  const z = tPos.getZ(i)
  const h = basinHeight(x, z)
  tPos.setY(i, h)

  const c = new THREE.Color()
  if (h < -2) {
    c.copy(cBed)
  } else if (h < 1.2) {
    c.copy(cSand).lerp(cGrass, THREE.MathUtils.smoothstep(h, -2, 1.2))
  } else if (h < 10) {
    c.copy(cGrass).lerp(cForest, THREE.MathUtils.smoothstep(h, 1.2, 10))
  } else {
    c.copy(cForest).lerp(cRock, THREE.MathUtils.smoothstep(h, 10, 20))
  }
  // variación sutil
  const v = noise2D(x * 0.3, z * 0.3) * 0.06
  c.offsetHSL(0, 0, v)
  colors.push(c.r, c.g, c.b)
}
terrainGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
terrainGeo.computeVertexNormals()

const terrainMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.95,
  metalness: 0.0,
  flatShading: false,
})
const terrain = new THREE.Mesh(terrainGeo, terrainMat)
terrain.receiveShadow = true
terrain.castShadow = true
scene.add(terrain)

// --- Islands (small forested mounds, like the reference photos) -------------
function addIsland(px: number, pz: number, radius: number, peak: number) {
  const geo = new THREE.ConeGeometry(radius, peak, 18, 1)
  geo.translate(0, peak / 2, 0)
  const mat = new THREE.MeshStandardMaterial({ color: "#36713c", roughness: 1 })
  const m = new THREE.Mesh(geo, mat)
  m.position.set(px, basinHeight(px, pz) - 0.5, pz)
  m.castShadow = true
  m.receiveShadow = true
  m.scale.y = 0.8
  scene.add(m)
}
addIsland(28, -14, 6, 7)
addIsland(-34, 22, 5, 6)
addIsland(10, 40, 4, 5)

// ----------------------------------------------------------------------------
// WATER — animated surface plane driven by a custom shader
// ----------------------------------------------------------------------------
const waterGeo = new THREE.PlaneGeometry(
  TERRAIN_SIZE * (1 + WATER_MARGIN),
  TERRAIN_SIZE * (1 + WATER_MARGIN),
  140,
  140,
)
waterGeo.rotateX(-Math.PI / 2)

const waterUniforms = {
  uTime: { value: 0 },
  uShallow: { value: new THREE.Color("#43c4d6") },
  uDeep: { value: new THREE.Color("#0f4f7a") },
  uSun: { value: new THREE.Vector3().copy(sun.position).normalize() },
}

const waterMat = new THREE.ShaderMaterial({
  uniforms: waterUniforms,
  transparent: true,
  vertexShader: /* glsl */ `
    uniform float uTime;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    // suma de ondas para un oleaje sutil
    float wave(vec2 p) {
      float w = 0.0;
      w += sin(p.x * 0.25 + uTime * 0.9) * 0.18;
      w += sin(p.y * 0.18 - uTime * 0.7) * 0.16;
      w += sin((p.x + p.y) * 0.4 + uTime * 1.3) * 0.07;
      return w;
    }

    void main() {
      vec3 pos = position;
      float h = wave(pos.xz);
      pos.y += h;

      // normal aproximada por diferencias finitas
      float e = 0.6;
      float hx = wave(pos.xz + vec2(e, 0.0));
      float hz = wave(pos.xz + vec2(0.0, e));
      vNormal = normalize(vec3(h - hx, e, h - hz));

      vec4 wp = modelMatrix * vec4(pos, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uShallow;
    uniform vec3 uDeep;
    uniform vec3 uSun;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fres = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

      // mezcla profundidad por distancia al centro (centro = más profundo)
      float dist = length(vWorldPos.xz) / 120.0;
      float depthMix = clamp(1.0 - dist, 0.0, 1.0);
      vec3 base = mix(uShallow, uDeep, depthMix);

      // brillo especular del sol
      vec3 h = normalize(uSun + viewDir);
      float spec = pow(max(dot(vNormal, h), 0.0), 60.0);

      vec3 col = mix(base, vec3(0.85, 0.93, 1.0), fres * 0.6);
      col += spec * 0.8;

      float alpha = mix(0.82, 0.97, depthMix);
      gl_FragColor = vec4(col, alpha);
    }
  `,
})

const water = new THREE.Mesh(waterGeo, waterMat)
water.renderOrder = 1
scene.add(water)

// ----------------------------------------------------------------------------
// LEVEL MARKER POLE — visual reference of the dam crest / shoreline
// ----------------------------------------------------------------------------
const poleGroup = new THREE.Group()
const poleMat = new THREE.MeshStandardMaterial({ color: "#f4f4f4", roughness: 0.6 })
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, WATER_MAX_Y - WATER_MIN_Y + 4, 12), poleMat)
pole.position.set(-70, (WATER_MIN_Y + WATER_MAX_Y) / 2, -70)
pole.castShadow = true
poleGroup.add(pole)
scene.add(poleGroup)

// ----------------------------------------------------------------------------
// ORBIT CONTROLS — minimal custom implementation (no extra deps)
// ----------------------------------------------------------------------------
const target = new THREE.Vector3(0, -2, 0)
const spherical = new THREE.Spherical(160, THREE.MathUtils.degToRad(62), THREE.MathUtils.degToRad(35))
let isDown = false
let lastX = 0
let lastY = 0

function updateCamera() {
  const offset = new THREE.Vector3().setFromSpherical(spherical)
  camera.position.copy(target).add(offset)
  camera.lookAt(target)
}
updateCamera()

canvas.addEventListener("pointerdown", (e) => {
  isDown = true
  lastX = e.clientX
  lastY = e.clientY
  canvas.setPointerCapture(e.pointerId)
})
canvas.addEventListener("pointerup", (e) => {
  isDown = false
  canvas.releasePointerCapture(e.pointerId)
})
canvas.addEventListener("pointermove", (e) => {
  if (!isDown) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  spherical.theta -= dx * 0.005
  spherical.phi = THREE.MathUtils.clamp(spherical.phi - dy * 0.005, 0.15, Math.PI / 2 - 0.05)
  updateCamera()
})
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault()
    spherical.radius = THREE.MathUtils.clamp(spherical.radius + e.deltaY * 0.08, 70, 300)
    updateCamera()
  },
  { passive: false },
)

// ----------------------------------------------------------------------------
// LEVEL CONTROL — wire UI to water height
// ----------------------------------------------------------------------------
const slider = document.getElementById("level") as HTMLInputElement
const pctEl = document.getElementById("pct") as HTMLSpanElement
const cotaEl = document.getElementById("cota") as HTMLSpanElement
const presetBtns = document.querySelectorAll<HTMLButtonElement>(".btn")

let targetLevel = parseFloat(slider.value) / 100 // 0..1
let currentLevel = targetLevel

function applyLevelUI(pct: number) {
  pctEl.textContent = Math.round(pct).toString()
  const cota = Math.round(FLOOR_ELEV + (CREST_ELEV - FLOOR_ELEV) * (pct / 100))
  cotaEl.textContent = cota.toString()
  slider.style.setProperty("--fill", `${pct}%`)
}

slider.addEventListener("input", () => {
  const pct = parseFloat(slider.value)
  targetLevel = pct / 100
  applyLevelUI(pct)
})

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const pct = parseFloat(btn.dataset.level || "50")
    slider.value = pct.toString()
    targetLevel = pct / 100
    applyLevelUI(pct)
  })
})

applyLevelUI(parseFloat(slider.value))

// ----------------------------------------------------------------------------
// RESIZE
// ----------------------------------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ----------------------------------------------------------------------------
// ANIMATION LOOP
// ----------------------------------------------------------------------------
const clock = new THREE.Clock()

function animate() {
  const t = clock.getElapsedTime()
  waterUniforms.uTime.value = t

  // interpolación suave del nivel hacia el objetivo
  currentLevel += (targetLevel - currentLevel) * 0.08
  water.position.y = WATER_MIN_Y + (WATER_MAX_Y - WATER_MIN_Y) * currentLevel

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
