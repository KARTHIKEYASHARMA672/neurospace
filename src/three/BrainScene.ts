import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { REGIONS, REGION_MAP, type RegionId } from '../data/regions';
import type { ScenarioAnimation } from '../data/scenarios';

/* ------------------------------------------------------------------ */
/*  Small deterministic value-noise for cortical folds                 */
/* ------------------------------------------------------------------ */
function gyriNoise(x: number, y: number, z: number): number {
  const n1 = Math.sin(x * 4.9 + Math.sin(y * 3.6) * 1.8) * 0.34;
  const n2 = Math.sin(y * 6.1 + Math.sin(z * 4.7 + x * 0.9) * 1.6) * 0.22;
  const n3 = Math.sin(z * 7.6 + Math.sin(x * 6.1 + y) * 1.6) * 0.13;
  const n4 = Math.sin(x * 10.5 + Math.sin(y * 8.5 + z * 4.4) * 1.5 + Math.sin(z * 11.4 + x) * 0.9) * 0.07;
  const ridge1 = Math.pow(1 - Math.abs(Math.sin(x * 6.8 + y * 5.3 + z * 4.3)), 6) * 0.4;
  const ridge2 = Math.pow(1 - Math.abs(Math.sin(x * 3.4 - y * 7.6 + z * 6.9)), 8) * 0.28;
  return n1 + n2 + n3 + n4 + (ridge1 + ridge2) * 0.42;
}

function makeGlowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.28)'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, mid);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

const glowTex = makeGlowTexture();
const softTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

export interface HoverInfo {
  id: RegionId | null;
  x: number;
  y: number;
}

interface RegionVisual {
  id: RegionId;
  glow: THREE.Sprite | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  nucleus: THREE.Mesh;
  hit: THREE.Mesh;
  targetGlow: number;
  currentGlow: number;
  flash: number; // 0..1 transient flash envelope
  phase: number;
}

interface Pulse {
  tube: THREE.Mesh;
  head: THREE.Sprite;
  curve: THREE.CatmullRomCurve3;
  material: THREE.ShaderMaterial;
  t: number;
  duration: number;
  target: RegionId;
  resolve: () => void;
}

interface Burst {
  points: THREE.Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
}

const FRAG_FRESNEL = `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float fres = pow(1.0 - abs(dot(n, v)), 3.2);
  gl_FragColor = vec4(uColor * fres * uIntensity, fres * uIntensity);
}
`;
const VERT_FRESNEL = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const VERT_TWINKLE = `
attribute float aPhase;
attribute float aSize;
attribute float aMix;
uniform float uTime;
varying float vAlpha;
varying float vMix;
void main() {
  vMix = aMix;
  float tw = sin(uTime * (0.9 + aPhase * 1.7) + aPhase * 40.0) * 0.5 + 0.5;
  vAlpha = 0.12 + 0.75 * pow(tw, 2.6);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (10.0 / -mv.z) * (0.6 + 0.6 * tw);
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG_TWINKLE = `
uniform vec3 uCool;
uniform vec3 uWarm;
varying float vAlpha;
varying float vMix;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float fall = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uCool, uWarm, vMix);
  gl_FragColor = vec4(col, vAlpha * fall);
}
`;

export class BrainScene {
  onRegionClick: ((id: RegionId) => void) | null = null;
  onHover: ((info: HoverInfo) => void) | null = null;

  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private brain!: THREE.Group;
  private clock = new THREE.Clock();
  private raf = 0;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-10, -10);
  private pointerClient = { x: 0, y: 0 };
  private hoverId: RegionId | null = null;
  private hitMeshes: THREE.Mesh[] = [];
  private regionVisuals = new Map<RegionId, RegionVisual>();
  private pulses: Pulse[] = [];
  private bursts: Burst[] = [];
  private sparkle!: THREE.Points;
  private sparkleMat!: THREE.ShaderMaterial;
  private activity: Record<RegionId, number> = {} as Record<RegionId, number>;
  private mode: ScenarioAnimation = 'baseline';
  private selectedId: RegionId | null = null;
  private selectionRing!: THREE.Mesh;
  private targetFocus = new THREE.Vector3(0, -0.05, 0);
  private seizureLight!: THREE.PointLight;
  private hijackLight!: THREE.PointLight;
  private autoRotateResume: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private downPos = { x: 0, y: 0 };
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  /* ------------------------------------------------------------ */
  private init() {
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x100f0c, 0.028);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    this.camera.position.set(2.5, 3.55, 4.6);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.1;
    this.controls.maxDistance = 9;
    this.controls.target.set(0, -0.05, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.55;
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      if (this.autoRotateResume) clearTimeout(this.autoRotateResume);
    });
    this.controls.addEventListener('end', () => {
      if (this.autoRotateResume) clearTimeout(this.autoRotateResume);
      this.autoRotateResume = setTimeout(() => (this.controls.autoRotate = true), 3500);
    });

    // ------- lights -------
    this.scene.add(new THREE.HemisphereLight(0xf2e2c4, 0x1e140c, 0.6));
    const key = new THREE.DirectionalLight(0xffe8c8, 1.1);
    key.position.set(3.5, 4.5, 4.5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9a961, 1.0);
    rim.position.set(-4.5, 1.5, -3.5);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xb5653a, 0.6);
    fill.position.set(-2.5, -2, 3.5);
    this.scene.add(fill);
    this.seizureLight = new THREE.PointLight(0x93485c, 0, 9, 1.8);
    this.seizureLight.position.set(0, 0.2, 0);
    this.scene.add(this.seizureLight);
    this.hijackLight = new THREE.PointLight(0x8e3b2f, 0, 7, 1.8);
    this.hijackLight.position.set(-0.5, -0.3, 0.4);
    this.scene.add(this.hijackLight);

    // ------- starfield -------
    this.buildStarfield();

    // ------- brain -------
    this.brain = new THREE.Group();
    this.scene.add(this.brain);
    this.buildHemispheres();
    this.buildCerebellum();
    this.buildBrainstem();
    this.buildInteriorNeurons();
    this.buildRegionVisuals();

    // selection ring
    const ringGeo = new THREE.TorusGeometry(1, 0.045, 8, 64);
    this.selectionRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    this.selectionRing.visible = false;
    this.selectionRing.renderOrder = 20;
    this.brain.add(this.selectionRing);

    // ------- events -------
    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.handlePointerMove);
    el.addEventListener('pointerdown', this.handlePointerDown);
    el.addEventListener('pointerup', this.handlePointerUp);
    el.addEventListener('pointerleave', this.handlePointerLeave);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.tick();
  }

  /* ------------------------------------------------------------ */
  private buildStarfield() {
    const N = 1500;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const color = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 16 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const pick = Math.random();
      if (pick < 0.72) color.setHex(0xede3d0);
      else if (pick < 0.86) color.setHex(0xc9a961);
      else color.setHex(0xb5653a);
      color.multiplyScalar(0.35 + Math.random() * 0.65);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(geo, mat);
    this.scene.add(stars);
  }

  private corticalMaterial(tint: number, withVertexColors = true): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      roughness: 0.55,
      metalness: 0.04,
      clearcoat: 0.42,
      clearcoatRoughness: 0.52,
      emissive: 0x241812,
      emissiveIntensity: 0.42,
      sheen: 0.18,
      sheenColor: new THREE.Color(0xc9a961),
      vertexColors: withVertexColors,
    });
  }

  private displaceGeometry(geo: THREE.BufferGeometry, amount: number, sign: 0 | 1 | -1 = 0) {
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(posAttr.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      const d = v.clone().normalize();
      const n = gyriNoise(d.x * 1.9, d.y * 1.9, d.z * 1.9);
      const r = 1 + n * amount;
      v.copy(d).multiplyScalar(r);
      // flatten the medial wall to carve the longitudinal fissure
      if (sign === 1 && v.x > 0) v.x *= 0.62;
      if (sign === -1 && v.x < 0) v.x *= 0.62;
      posAttr.setXYZ(i, v.x, v.y, v.z);
      // cavity shading — deeper folds sit darker, crests catch the light
      const t = THREE.MathUtils.clamp((n + 1.15) / 2.3, 0, 1);
      const brightness = 0.52 + 0.55 * t;
      colors[i * 3] = brightness * 0.98;
      colors[i * 3 + 1] = brightness * 0.93;
      colors[i * 3 + 2] = Math.min(1, brightness * 0.82);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
  }

  private addFresnelShell(source: THREE.Mesh, intensity: number, color: number) {
    const shell = new THREE.Mesh(
      source.geometry,
      new THREE.ShaderMaterial({
        vertexShader: VERT_FRESNEL,
        fragmentShader: FRAG_FRESNEL,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    );
    shell.position.copy(source.position);
    shell.rotation.copy(source.rotation);
    shell.scale.copy(source.scale).multiplyScalar(1.012);
    shell.renderOrder = 6;
    this.brain.add(shell);
  }

  private buildHemispheres() {
    const geoL = new THREE.SphereGeometry(1, 96, 72);
    this.displaceGeometry(geoL, 0.075, 1);
    const geoR = new THREE.SphereGeometry(1, 96, 72);
    this.displaceGeometry(geoR, 0.075, -1);

    const matL = this.corticalMaterial(0x3d4668);
    const matR = this.corticalMaterial(0x3d4668);

    const left = new THREE.Mesh(geoL, matL);
    left.scale.set(0.52, 0.66, 0.9);
    left.position.set(-0.45, 0.02, 0);
    left.rotation.z = 0.05;
    const right = new THREE.Mesh(geoR, matR);
    right.scale.set(0.52, 0.66, 0.9);
    right.position.set(0.45, 0.02, 0);
    right.rotation.z = -0.05;
    this.brain.add(left, right);
    this.addFresnelShell(left, 0.38, 0xc9a961);
    this.addFresnelShell(right, 0.38, 0xc9a961);
  }

  private buildCerebellum() {
    const geo = new THREE.SphereGeometry(0.46, 64, 48);
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const d = v.clone().normalize();
      const folia = Math.sin(d.y * 26 + Math.sin(d.z * 6) * 1.5) * 0.024;
      const n = gyriNoise(d.x * 4, d.y * 4, d.z * 4) * 0.028;
      v.copy(d).multiplyScalar(1 + folia + n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, this.corticalMaterial(0x3d4a6b, false));
    mesh.scale.set(1.12, 0.58, 0.8);
    mesh.position.set(0, -0.6, -0.52);
    mesh.rotation.x = 0.22;
    this.brain.add(mesh);
    this.addFresnelShell(mesh, 0.7, 0xc9a961);
  }

  private buildBrainstem() {
    const geo = new THREE.CylinderGeometry(0.13, 0.175, 0.66, 20, 6);
    const mesh = new THREE.Mesh(geo, this.corticalMaterial(0x54607f, false));
    mesh.position.set(0, -0.6, 0.2);
    mesh.rotation.x = -0.34;
    this.brain.add(mesh);
    const pons = new THREE.Mesh(new THREE.SphereGeometry(0.155, 24, 18), this.corticalMaterial(0x5c688c, false));
    pons.scale.set(1, 0.75, 0.8);
    pons.position.set(0, -0.46, 0.3);
    this.brain.add(pons);
  }

  private buildInteriorNeurons() {
    const N = 620;
    const pos = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    const size = new Float32Array(N);
    const mix = new Float32Array(N);
    let placed = 0;
    while (placed < N) {
      const x = (Math.random() * 2 - 1) * 0.85;
      const y = (Math.random() * 2 - 1) * 0.62;
      const z = (Math.random() * 2 - 1) * 0.85;
      // superellipsoid-ish containment
      const e = Math.pow(Math.abs(x / 0.85), 2.6) + Math.pow(Math.abs(y / 0.62), 2.6) + Math.pow(Math.abs(z / 0.85), 2.6);
      if (e > 0.82) continue;
      pos[placed * 3] = x;
      pos[placed * 3 + 1] = y;
      pos[placed * 3 + 2] = z;
      phase[placed] = Math.random();
      size[placed] = 2.4 + Math.random() * 3.4;
      mix[placed] = Math.random();
      placed++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aMix', new THREE.BufferAttribute(mix, 1));
    this.sparkleMat = new THREE.ShaderMaterial({
      vertexShader: VERT_TWINKLE,
      fragmentShader: FRAG_TWINKLE,
      uniforms: {
        uTime: { value: 0 },
        uCool: { value: new THREE.Color(0xe8d8a8) },
        uWarm: { value: new THREE.Color(0xc98a2c) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sparkle = new THREE.Points(geo, this.sparkleMat);
    this.sparkle.renderOrder = 4;
    this.brain.add(this.sparkle);
  }

  private buildRegionVisuals() {
    for (const region of REGIONS) {
      const [x, y, z] = region.position;
      const color = new THREE.Color(region.color);

      let glow: THREE.Sprite | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      if (region.deep) {
        // deep structures: billboard x-ray glow so they read through the tissue
        const glowMat = new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(glowMat);
        sprite.position.set(x, y, z);
        sprite.scale.setScalar(region.size * 1.7);
        sprite.renderOrder = 9;
        this.brain.add(sprite);
        glow = sprite;
      } else {
        // cortical surface: normal-facing quad so neighbouring midline
        // glows don't billboard into one stacked column
        const glowMat = new THREE.MeshBasicMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
        });
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat);
        const normal = new THREE.Vector3(x, y - 0.02, z).normalize();
        const pos = new THREE.Vector3(x, y, z);
        quad.position.copy(pos).addScaledVector(normal, 0.045);
        quad.lookAt(pos.clone().add(normal));
        quad.scale.setScalar(region.size * 1.9);
        quad.renderOrder = 7;
        this.brain.add(quad);
        glow = quad;
      }

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(region.size * 0.32, 18, 14),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthTest: !region.deep,
          depthWrite: false,
        }),
      );
      nucleus.position.set(x, y, z);
      nucleus.renderOrder = region.deep ? 9 : 7;
      this.brain.add(nucleus);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(region.size * 0.78, 0.16), 10, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.position.set(x, y, z);
      hit.userData.regionId = region.id;
      this.brain.add(hit);
      this.hitMeshes.push(hit);

      this.activity[region.id] = region.baseActivity;
      this.regionVisuals.set(region.id, {
        id: region.id,
        glow,
        nucleus,
        hit,
        targetGlow: 0.55 + (region.baseActivity / 100) * 0.45,
        currentGlow: 0.55 + (region.baseActivity / 100) * 0.45,
        flash: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ------------------------------------------------------------ */
  setRegionActivity(map: Partial<Record<RegionId, number>>) {
    for (const [id, v] of Object.entries(map) as [RegionId, number][]) {
      this.activity[id] = v;
      const visual = this.regionVisuals.get(id);
      if (visual) visual.targetGlow = 0.14 + (v / 100) * 0.86;
    }
  }

  setAnimationMode(mode: ScenarioAnimation) {
    this.mode = mode;
  }

  selectRegion(id: RegionId | null) {
    this.selectedId = id;
    if (!id) {
      this.selectionRing.visible = false;
      this.targetFocus.set(0, -0.05, 0);
      return;
    }
    const region = REGION_MAP[id];
    const [x, y, z] = region.position;
    this.selectionRing.visible = true;
    (this.selectionRing.material as THREE.MeshBasicMaterial).color.set(region.color);
    this.selectionRing.position.set(x, y, z);
    this.targetFocus.set(x * 0.35, y * 0.35 - 0.05, z * 0.35);
  }

  setAutoRotate(v: boolean) {
    this.controls.autoRotate = v;
  }

  focusRegion(id: RegionId) {
    this.selectRegion(id);
  }

  resetView() {
    this.selectionRing.visible = false;
    this.selectedId = null;
    this.targetFocus.set(0, -0.05, 0);
  }

  /* ------- signal propagation ------- */
  firePulse(fromId: RegionId, toId: RegionId, colorHex: string, durationMs = 1400): Promise<void> {
    return new Promise((resolve) => {
      const from = new THREE.Vector3(...REGION_MAP[fromId].position);
      const to = new THREE.Vector3(...REGION_MAP[toId].position);
      const center = new THREE.Vector3(0, -0.02, 0);
      const jitterA = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      const jitterB = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      const p1 = from.clone().lerp(center, 0.55).add(jitterA);
      const p2 = to.clone().lerp(center, 0.55).add(jitterB);
      const curve = new THREE.CatmullRomCurve3([from, p1, p2, to]);

      const geo = new THREE.TubeGeometry(curve, 56, 0.014, 6, false);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uColor: { value: new THREE.Color(colorHex) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform float uProgress;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float d = vUv.x - uProgress;
            float head = exp(-pow(max(d, 0.0) * 34.0, 2.0));
            float tail = d < 0.0 ? exp(-pow(-d * 7.5, 2.0)) * 0.55 : 0.0;
            float base = 0.10 * smoothstep(0.06, 0.0, abs(d + 0.18));
            float a = clamp(head + tail + base, 0.0, 1.6);
            gl_FragColor = vec4(uColor * a * 1.9, a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      const tube = new THREE.Mesh(geo, material);
      tube.renderOrder = 12;
      this.brain.add(tube);

      const head = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: softTex,
          color: colorHex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          depthWrite: false,
        }),
      );
      head.scale.setScalar(0.16);
      head.renderOrder = 13;
      this.brain.add(head);

      this.pulses.push({ tube, head, curve, material, t: 0, duration: durationMs / 1000, target: toId, resolve });
    });
  }

  private burst(position: THREE.Vector3, colorHex: string, count = 16, speed = 0.9) {
    const N = count;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const s = (0.4 + Math.random() * 0.6) * speed;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * s;
      vel[i * 3 + 1] = Math.cos(phi) * s;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * s;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: softTex,
      color: colorHex,
      size: 0.085,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const points = new THREE.Points(geo, mat);
    points.renderOrder = 14;
    this.brain.add(points);
    this.bursts.push({ points, velocities: vel, life: 0, maxLife: 0.9 });
  }

  flashRegion(id: RegionId, strength = 1) {
    const visual = this.regionVisuals.get(id);
    if (visual) visual.flash = Math.max(visual.flash, strength);
  }

  /* ------------------------------------------------------------ */
  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.pointerClient = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  private handlePointerDown = (e: PointerEvent) => {
    this.downPos = { x: e.clientX, y: e.clientY };
  };
  private handlePointerUp = (e: PointerEvent) => {
    const moved = Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y);
    if (moved > 6) return;
    const hit = this.pickRegion();
    if (hit && this.onRegionClick) this.onRegionClick(hit);
  };
  private handlePointerLeave = () => {
    this.pointerNdc.set(-10, -10);
    if (this.hoverId) {
      this.hoverId = null;
      this.onHover?.({ id: null, x: 0, y: 0 });
    }
    this.container.style.cursor = 'default';
  };

  private pickRegion(): RegionId | null {
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    return hits.length ? (hits[0].object.userData.regionId as RegionId) : null;
  }

  private handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ------------------------------------------------------------ */
  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    if (this.sparkleMat) this.sparkleMat.uniforms.uTime.value = t;

    // brain idle motion per scenario
    const brain = this.brain;
    const baseBob = Math.sin(t * 0.75) * 0.035;
    brain.position.y = baseBob;
    let targetScale = 1;
    if (this.mode === 'slowwave') targetScale = 1 + Math.sin(t * 1.05) * 0.025;
    else if (this.mode === 'calm') targetScale = 1 + Math.sin(t * 0.6) * 0.012;
    else if (this.mode === 'seizure') {
      brain.position.x = Math.sin(t * 27) * 0.012;
      brain.position.y = baseBob + Math.cos(t * 31) * 0.012;
      targetScale = 1 + Math.sin(t * 24) * 0.008;
    } else if (this.mode === 'tremor') {
      brain.position.x = Math.sin(t * 31) * 0.0055;
      targetScale = 1;
    } else if (this.mode === 'hijack') {
      targetScale = 1 + Math.sin(t * 3.2) * 0.006;
    } else {
      brain.position.x = 0;
    }
    this.brain.scale.setScalar(THREE.MathUtils.lerp(this.brain.scale.x, targetScale, 0.1));

    // seizure light strobes
    if (this.mode === 'seizure') {
      this.seizureLight.intensity = 26 + Math.sin(t * 22) * 20 + Math.sin(t * 47) * 8;
    } else {
      this.seizureLight.intensity = THREE.MathUtils.lerp(this.seizureLight.intensity, 0, 0.08);
    }
    if (this.mode === 'hijack') {
      this.hijackLight.intensity = 12 + Math.sin(t * 5.6) * 8;
    } else {
      this.hijackLight.intensity = THREE.MathUtils.lerp(this.hijackLight.intensity, 0, 0.08);
    }

    // region glow easing + pulse + flash decay
    this.regionVisuals.forEach((v) => {
      v.currentGlow = THREE.MathUtils.lerp(v.currentGlow, v.targetGlow, 0.06);
      v.flash = Math.max(0, v.flash - delta * 1.35);
      const breathe = 1 + Math.sin(t * 1.7 + v.phase) * 0.07;
      let flicker = 1;
      if (this.mode === 'seizure') flicker = 0.55 + 0.75 * (0.5 + 0.5 * Math.sin(t * 9 - v.phase * 2.2));
      if (this.mode === 'tremor' && (v.id === 'motor' || v.id === 'cerebellum')) flicker = 0.7 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 5.2));
      if (this.mode === 'hijack' && v.id === 'amygdala') flicker = 0.85 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6.4));
      const glow = Math.min(1.35, (v.currentGlow * flicker + v.flash * 0.9) * breathe);
      const isDeep = REGION_MAP[v.id].deep;
      const glowCap = isDeep ? 0.32 : 0.45;
      v.glow.material.opacity = THREE.MathUtils.clamp(glow * (isDeep ? 0.3 : 0.42), 0.04, glowCap);
      const baseScale = REGION_MAP[v.id].size * (isDeep ? 1.7 : 1.9);
      v.glow.scale.setScalar(baseScale * (0.85 + glow * 0.5 + v.flash * 0.35));
      (v.nucleus.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(0.2 + glow * 0.5, 0.08, 0.75);
      v.nucleus.scale.setScalar(0.75 + glow * 0.55 + v.flash * 0.6);
    });

    // random ambient spark bursts in seizure mode
    if (this.mode === 'seizure' && Math.random() < 0.045) {
      const ids = [...this.regionVisuals.keys()];
      const id = ids[Math.floor(Math.random() * ids.length)];
      this.burst(new THREE.Vector3(...REGION_MAP[id].position), '#93485C', 10, 0.55);
    }

    // selection ring follows camera
    if (this.selectionRing.visible && this.selectedId) {
      const region = REGION_MAP[this.selectedId];
      const [x, y, z] = region.position;
      this.selectionRing.position.set(x, y, z);
      this.selectionRing.lookAt(this.camera.position);
      const s = region.size * (1.02 + Math.sin(t * 2.6) * 0.07);
      this.selectionRing.scale.setScalar(s);
      (this.selectionRing.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(t * 2.6) * 0.25;
    }

    // advance pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.t += delta / p.duration;
      const u = Math.min(p.t, 1);
      p.material.uniforms.uProgress.value = u;
      const headPos = p.curve.getPoint(u);
      p.head.position.copy(headPos);
      p.head.material.opacity = 0.75 + Math.sin(t * 26) * 0.25;
      if (p.t >= 1) {
        const endPos = p.curve.getPoint(1);
        this.flashRegion(p.target, 1);
        this.burst(endPos, '#' + (p.material.uniforms.uColor.value as THREE.Color).getHexString(), 18, 0.85);
        this.brain.remove(p.tube, p.head);
        p.tube.geometry.dispose();
        p.material.dispose();
        p.head.material.dispose();
        this.pulses.splice(i, 1);
        p.resolve();
      }
    }

    // advance bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life += delta;
      const posAttr = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let j = 0; j < posAttr.count; j++) {
        posAttr.setXYZ(
          j,
          posAttr.getX(j) + b.velocities[j * 3] * delta,
          posAttr.getY(j) + b.velocities[j * 3 + 1] * delta,
          posAttr.getZ(j) + b.velocities[j * 3 + 2] * delta,
        );
      }
      posAttr.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - b.life / b.maxLife);
      if (b.life >= b.maxLife) {
        this.brain.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
      }
    }

    // hover raycast (throttled by rAF cadence)
    if (this.pointerNdc.x > -5) {
      const hit = this.pickRegion();
      if (hit !== this.hoverId) {
        this.hoverId = hit;
        this.container.style.cursor = hit ? 'pointer' : 'default';
        this.onHover?.({ id: hit, x: this.pointerClient.x, y: this.pointerClient.y });
      } else if (hit) {
        this.onHover?.({ id: hit, x: this.pointerClient.x, y: this.pointerClient.y });
      }
    }

    // smooth focus
    this.controls.target.lerp(this.targetFocus, 0.06);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.autoRotateResume) clearTimeout(this.autoRotateResume);
    this.resizeObserver?.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointermove', this.handlePointerMove);
    el.removeEventListener('pointerdown', this.handlePointerDown);
    el.removeEventListener('pointerup', this.handlePointerUp);
    el.removeEventListener('pointerleave', this.handlePointerLeave);
    this.controls.dispose();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
