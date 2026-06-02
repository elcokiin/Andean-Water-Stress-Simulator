import * as THREE from "three";

const utilsGLSL = `
const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;
const vec3 abovewaterColor = vec3(0.25, 1.0, 1.25);
const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);
const float poolHeight = 1.0;
uniform vec3 light;
uniform sampler2D causticTex;
uniform sampler2D water;

vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}
`;

const simVertexStr = `
attribute vec3 position;
varying vec2 coord;
void main() {
  coord = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xyz, 1.0);
}
`;

const dropFragmentStr = `
precision highp float;
precision highp int;
const float PI = 3.141592653589793;
uniform sampler2D texture;
uniform vec2 center;
uniform float radius;
uniform float strength;
varying vec2 coord;
void main() {
  vec4 info = texture2D(texture, coord);
  float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);
  drop = 0.5 - cos(drop * PI) * 0.5;
  info.r += drop * strength;
  gl_FragColor = info;
}
`;

const normalFragmentStr = `
precision highp float;
precision highp int;
uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;
void main() {
  vec4 info = texture2D(texture, coord);
  vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);
  vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);
  info.ba = normalize(cross(dy, dx)).xz;
  gl_FragColor = info;
}
`;

const updateFragmentStr = `
precision highp float;
precision highp int;
uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;
void main() {
  vec4 info = texture2D(texture, coord);
  vec2 dx = vec2(delta.x, 0.0);
  vec2 dy = vec2(0.0, delta.y);
  float average = (
    texture2D(texture, coord - dx).r +
    texture2D(texture, coord - dy).r +
    texture2D(texture, coord + dx).r +
    texture2D(texture, coord + dy).r
  ) * 0.25;
  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  gl_FragColor = info;
}
`;

export class WaterSimulation {
  public _camera: THREE.OrthographicCamera;
  public _scene: THREE.Scene;
  public _geometry: THREE.PlaneGeometry;
  public _textureA: THREE.WebGLRenderTarget;
  public _textureB: THREE.WebGLRenderTarget;
  public texture: THREE.WebGLRenderTarget;
  public _dropMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;
  public _normalMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;
  public _updateMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
    this._scene = new THREE.Scene();
    this._geometry = new THREE.PlaneGeometry(2, 2);

    this._textureA = new THREE.WebGLRenderTarget(256, 256, {
      type: THREE.FloatType,
      depthBuffer: false,
    });
    this._textureB = new THREE.WebGLRenderTarget(256, 256, {
      type: THREE.FloatType,
      depthBuffer: false,
    });
    this.texture = this._textureA;

    const dropMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        center: { value: [0, 0] },
        radius: { value: 0 },
        strength: { value: 0 },
        texture: { value: null },
      },
      vertexShader: simVertexStr,
      fragmentShader: dropFragmentStr,
    });

    const normalMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / 256, 1 / 256] },
        texture: { value: null },
      },
      vertexShader: simVertexStr,
      fragmentShader: normalFragmentStr,
    });

    const updateMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / 256, 1 / 256] },
        texture: { value: null },
      },
      vertexShader: simVertexStr,
      fragmentShader: updateFragmentStr,
    });

    this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
    this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
    this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
  }

  addDrop(
    renderer: THREE.WebGLRenderer,
    x: number,
    y: number,
    radius: number,
    strength: number,
  ) {
    this._dropMesh.material.uniforms["center"].value = [x, y];
    this._dropMesh.material.uniforms["radius"].value = radius;
    this._dropMesh.material.uniforms["strength"].value = strength;
    this._render(renderer, this._dropMesh);
  }

  stepSimulation(renderer: THREE.WebGLRenderer) {
    this._render(renderer, this._updateMesh);
  }

  updateNormals(renderer: THREE.WebGLRenderer) {
    this._render(renderer, this._normalMesh);
  }

  _render(renderer: THREE.WebGLRenderer, mesh: THREE.Mesh) {
    const oldTexture = this.texture;
    const newTexture =
      this.texture === this._textureA ? this._textureB : this._textureA;

    (mesh.material as THREE.RawShaderMaterial).uniforms["texture"].value =
      oldTexture.texture;

    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(newTexture);

    this._scene.clear();
    this._scene.add(mesh);
    renderer.render(this._scene, this._camera);

    renderer.setRenderTarget(currentRenderTarget);

    this.texture = newTexture;
  }
}

const causticsVertexStr = `
precision highp float;
precision highp int;
varying vec3 oldPos;
varying vec3 newPos;
varying vec3 ray;
attribute vec3 position;
${utilsGLSL}
vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {
  vec2 tcube = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
  origin += ray * tcube.y;
  float tplane = (-origin.y - 1.0) / refractedLight.y;
  return origin + refractedLight * tplane;
}
void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
  info.ba *= 0.5;
  vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);
  vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  ray = refract(-light, normal, IOR_AIR / IOR_WATER);
  oldPos = project(position.xzy, refractedLight, refractedLight);
  newPos = project(position.xzy, ray, refractedLight);
  gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);
}
`;

const causticsFragmentStr = `
precision highp float;
precision highp int;
#extension GL_OES_standard_derivatives : enable
${utilsGLSL}
varying vec3 oldPos;
varying vec3 newPos;
varying vec3 ray;
void main() {
  float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newArea = length(dFdx(newPos)) * length(dFdy(newPos));
  gl_FragColor = vec4(oldArea / newArea * 0.2, 1.0, 0.0, 0.0);
  vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  vec2 t = intersectCube(newPos, -refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
  gl_FragColor.r *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (newPos.y - refractedLight.y * t.y - 2.0 / 12.0)));
}
`;

export class Caustics {
  public _camera: THREE.OrthographicCamera;
  public _scene: THREE.Scene;
  public _geometry: THREE.BufferGeometry;
  public texture: THREE.WebGLRenderTarget;
  public _causticMesh: THREE.Mesh<
    THREE.BufferGeometry,
    THREE.RawShaderMaterial
  >;

  constructor(
    lightFrontGeometry: THREE.BufferGeometry,
    lightDirection: number[],
  ) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
    this._scene = new THREE.Scene();
    this._geometry = lightFrontGeometry;

    this.texture = new THREE.WebGLRenderTarget(1024, 1024, {
      type: THREE.UnsignedByteType,
      depthBuffer: false,
    });

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        light: { value: lightDirection },
        water: { value: null },
      },
      vertexShader: causticsVertexStr,
      fragmentShader: causticsFragmentStr,
    });

    this._causticMesh = new THREE.Mesh(this._geometry, material);
    this._scene.add(this._causticMesh);
  }

  update(renderer: THREE.WebGLRenderer, waterTexture: THREE.Texture) {
    this._causticMesh.material.uniforms["water"].value = waterTexture;

    const currentRenderTarget = renderer.getRenderTarget();
    const currentClearColor = renderer.getClearColor(new THREE.Color());
    const currentClearAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(this.texture);
    renderer.setClearColor(new THREE.Color(0x000000), 0);
    renderer.clear();

    renderer.render(this._scene, this._camera);

    renderer.setRenderTarget(currentRenderTarget);
    renderer.setClearColor(currentClearColor, currentClearAlpha);
  }
}
