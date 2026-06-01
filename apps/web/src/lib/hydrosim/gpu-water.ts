import * as THREE from "three";

export const simVertex = `
attribute vec3 position;
varying vec2 coord;
void main() {
  coord = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xyz, 1.0);
}`;

export const simUpdateFrag = `
precision highp float;
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
  info.g *= 0.997;
  info.r += info.g;
  gl_FragColor = info;
}`;

export const simNormalFrag = `
precision highp float;
uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;
void main() {
  vec4 info = texture2D(texture, coord);
  vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);
  vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);
  info.ba = normalize(cross(dy, dx)).xz;
  gl_FragColor = info;
}`;

export const simDropFrag = `
precision highp float;
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
}`;

export class WaterSimulation {
  public texture: THREE.WebGLRenderTarget;
  private _textureA: THREE.WebGLRenderTarget;
  private _textureB: THREE.WebGLRenderTarget;
  private _camera: THREE.OrthographicCamera;
  private _geometry: THREE.PlaneGeometry;
  private _dropMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;
  private _normalMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;
  private _updateMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;

  constructor(size = 256) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
    this._geometry = new THREE.PlaneGeometry(2, 2);

    this._textureA = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.FloatType,
    });
    this._textureB = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.FloatType,
    });
    this.texture = this._textureA;

    const dropMat = new THREE.RawShaderMaterial({
      uniforms: {
        center: { value: [0, 0] },
        radius: { value: 0 },
        strength: { value: 0 },
        texture: { value: null },
      },
      vertexShader: simVertex,
      fragmentShader: simDropFrag,
    });

    const normMat = new THREE.RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / size, 1 / size] },
        texture: { value: null },
      },
      vertexShader: simVertex,
      fragmentShader: simNormalFrag,
    });

    const updateMat = new THREE.RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / size, 1 / size] },
        texture: { value: null },
      },
      vertexShader: simVertex,
      fragmentShader: simUpdateFrag,
    });

    this._dropMesh = new THREE.Mesh(this._geometry, dropMat);
    this._normalMesh = new THREE.Mesh(this._geometry, normMat);
    this._updateMesh = new THREE.Mesh(this._geometry, updateMat);
  }

  addDrop(
    renderer: THREE.WebGLRenderer,
    x: number,
    y: number,
    radius: number,
    strength: number,
  ) {
    this._dropMesh.material.uniforms.center.value = [x, y];
    this._dropMesh.material.uniforms.radius.value = radius;
    this._dropMesh.material.uniforms.strength.value = strength;
    this._render(renderer, this._dropMesh);
  }

  stepSimulation(renderer: THREE.WebGLRenderer) {
    this._render(renderer, this._updateMesh);
  }

  updateNormals(renderer: THREE.WebGLRenderer) {
    this._render(renderer, this._normalMesh);
  }

  private _render(
    renderer: THREE.WebGLRenderer,
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>,
  ) {
    const oldTex = this.texture;
    const newTex =
      this.texture === this._textureA ? this._textureB : this._textureA;
    mesh.material.uniforms.texture.value = oldTex.texture;
    const oldTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(newTex);
    renderer.render(mesh, this._camera);
    renderer.setRenderTarget(oldTarget);
    this.texture = newTex;
  }
}

export const causticsVertex = `
attribute vec3 position;
varying vec3 oldPos;
varying vec3 newPos;
varying vec3 ray;
uniform sampler2D water;
uniform vec3 light;
const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;
const float poolHeight = 1.0;
vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}
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
  newPos = project(position.xzy + vec3(0.0, info.r, 0.0), ray, refractedLight);
  gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);
}`;
export const causticsFrag = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec3 oldPos;
varying vec3 newPos;
varying vec3 ray;
uniform vec3 light;
const float poolHeight = 1.0;
vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}
void main() {
  float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newArea = length(dFdx(newPos)) * length(dFdy(newPos));
  gl_FragColor = vec4(oldArea / newArea * 0.2, 1.0, 0.0, 0.0);
  vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), 1.0 / 1.333);
  vec2 t = intersectCube(newPos, -refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
  gl_FragColor.r *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (newPos.y - refractedLight.y * t.y - 2.0 / 12.0)));
}`;

export class Caustics {
  public texture: THREE.WebGLRenderTarget;
  private _camera: THREE.OrthographicCamera;
  private _geometry: THREE.PlaneGeometry;
  private _causticMesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.RawShaderMaterial
  >;

  constructor(resolution = 1024) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
    this._geometry = new THREE.PlaneGeometry(2, 2, 256, 256);
    this.texture = new THREE.WebGLRenderTarget(resolution, resolution, {
      type: THREE.UnsignedByteType,
    });
    const mat = new THREE.RawShaderMaterial({
      extensions: { derivatives: true },
      uniforms: {
        light: { value: new THREE.Vector3(0.75, 0.75, -0.37).normalize() },
        water: { value: null },
      },
      vertexShader: causticsVertex,
      fragmentShader: causticsFrag,
    });
    this._causticMesh = new THREE.Mesh(this._geometry, mat);
  }

  update(renderer: THREE.WebGLRenderer, waterTexture: THREE.Texture) {
    this._causticMesh.material.uniforms.water.value = waterTexture;
    const oldTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.texture);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(this._causticMesh, this._camera);
    renderer.setRenderTarget(oldTarget);
  }
}
