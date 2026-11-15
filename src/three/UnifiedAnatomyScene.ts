import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { REGIONS, REGION_MAP, type RegionId } from '../data/regions';
import { BODY_PARTS, BODY_PART_MAP, type BodyPartId, type ViewMode } from '../data/bodySystems';
import type { SystemLayerVisibility } from '../data/anatomyLayers';
import type { ScenarioAnimation } from '../data/scenarios';

/* ------------------------------------------------------------------ */
/*  Procedural Gyri & Anatomical Noise Functions                      */
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

function makeGlowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.3)'): THREE.CanvasTexture {
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

export interface HoverInfo {
  id: RegionId | BodyPartId | null;
  kind: 'region' | 'bodyPart' | null;
  name?: string;
  x: number;
  y: number;
}

interface VisualNode {
  id: string;
  glow: THREE.Object3D;
  nucleus: THREE.Mesh;
  hit: THREE.Mesh;
  targetGlow: number;
  currentGlow: number;
  flash: number;
  phase: number;
}

interface Pulse {
  tube: THREE.Mesh;
  head: THREE.Sprite;
  curve: THREE.CatmullRomCurve3;
  material: THREE.ShaderMaterial;
  t: number;
  duration: number;
  target: string;
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

export class UnifiedAnatomyScene {
  onRegionClick: ((id: RegionId) => void) | null = null;
  onBodyPartClick: ((id: BodyPartId) => void) | null = null;
  onHover: ((info: HoverInfo) => void) | null = null;

  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  // Root hierarchical groups
  private rootGroup = new THREE.Group();
  private brainGroup = new THREE.Group();
  private fullBodyGroup = new THREE.Group();
  private realisticMeshGroup = new THREE.Group();
  private nervousSystemGroup = new THREE.Group();
  private visceralOrgansGroup = new THREE.Group();
  private skinIntegumentaryGroup = new THREE.Group();
  private dermatomeGroup = new THREE.Group();

  private clock = new THREE.Clock();
  private raf = 0;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-10, -10);
  private pointerClient = { x: 0, y: 0 };
  private hitMeshes: THREE.Mesh[] = [];

  private regionVisuals = new Map<RegionId, VisualNode>();
  private bodyPartVisuals = new Map<BodyPartId, VisualNode>();

  private pulses: Pulse[] = [];
  private bursts: Burst[] = [];

  private viewMode: ViewMode = 'fullbody';
  private layers: SystemLayerVisibility = {
    brain: true,
    centralNervous: true,
    peripheralNerves: true,
    autonomicOrgans: true,
    skinIntegumentary: true,
    nerveImpulses: true,
    dermatomeBands: false,
  };

  private regionActivity: Record<RegionId, number> = {} as Record<RegionId, number>;
  private bodyPartActivity: Record<BodyPartId, number> = {} as Record<BodyPartId, number>;
  private mode: ScenarioAnimation = 'baseline';

  private selectedRegionId: RegionId | null = null;
  private selectedBodyPartId: BodyPartId | null = null;

  private selectionRing!: THREE.Mesh;
  private cameraTarget = new THREE.Vector3(0, 0.4, 0);
  private cameraPosTarget = new THREE.Vector3(0, 0.6, 4.4);

  private autoRotateResume: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private downPos = { x: 0, y: 0 };
  private resizeObserver: ResizeObserver | null = null;

  // High-res realistic body mesh reference
  private bodyMesh: THREE.Object3D | null = null;
  private headMesh: THREE.Object3D | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x100f0c, 0.02);

    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.set(0, 0.6, 4.4);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = true;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0.4, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.45;

    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      if (this.autoRotateResume) clearTimeout(this.autoRotateResume);
    });
    this.controls.addEventListener('end', () => {
      if (this.autoRotateResume) clearTimeout(this.autoRotateResume);
      this.autoRotateResume = setTimeout(() => (this.controls.autoRotate = true), 3500);
    });

    // Lights
    this.scene.add(new THREE.HemisphereLight(0xf2e2c4, 0x1e140c, 0.7));
    const key = new THREE.DirectionalLight(0xffe8c8, 1.3);
    key.position.set(3.5, 4.5, 4.5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xc9a961, 1.1);
    rim.position.set(-4.5, 2.5, -3.5);
    this.scene.add(rim);

    const fill = new THREE.DirectionalLight(0xb5653a, 0.7);
    fill.position.set(-2.5, -2, 3.5);
    this.scene.add(fill);

    this.scene.add(this.rootGroup);
    this.rootGroup.add(this.brainGroup);
    this.rootGroup.add(this.fullBodyGroup);

    this.fullBodyGroup.add(this.realisticMeshGroup);
    this.fullBodyGroup.add(this.nervousSystemGroup);
    this.fullBodyGroup.add(this.visceralOrgansGroup);
    this.fullBodyGroup.add(this.skinIntegumentaryGroup);
    this.fullBodyGroup.add(this.dermatomeGroup);

    // Build anatomical sub-systems
    this.buildStarfield();
    this.buildBrainModel();
    this.loadHighResAnatomyModels();
    this.buildNervousSystemNetwork();
    this.buildVisceralOrgans();
    this.buildSkinIntegumentaryEnvelope();
    this.buildDermatomeBands();

    // Selection ring
    const ringGeo = new THREE.TorusGeometry(1, 0.035, 8, 64);
    this.selectionRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        color: 0xc9a961,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    this.selectionRing.visible = false;
    this.selectionRing.renderOrder = 25;
    this.rootGroup.add(this.selectionRing);

    // Events
    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.handlePointerMove);
    el.addEventListener('pointerdown', this.handlePointerDown);
    el.addEventListener('pointerup', this.handlePointerUp);
    el.addEventListener('pointerleave', this.handlePointerLeave);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.setViewMode('fullbody');
    this.tick();
  }

  /* ------------------------------------------------------------ */
  /* Starfield / Cosmic Ambient Background                         */
  /* ------------------------------------------------------------ */
  private buildStarfield() {
    const N = 1200;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const color = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 18 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const pick = Math.random();
      if (pick < 0.7) color.setHex(0xede3d0);
      else if (pick < 0.88) color.setHex(0xc9a961);
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
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  /* ------------------------------------------------------------ */
  /* Load Realistic 3D Human Body Anatomy (GLTF)                  */
  /* ------------------------------------------------------------ */
  private loadHighResAnatomyModels() {
    const loader = new GLTFLoader();

    // 1. Load Humanoid Anatomy Body
    loader.load(
      '/models/human_body.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(1.2);
        model.position.set(0, -1.35, 0);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x30356f,
              roughness: 0.45,
              metalness: 0.15,
              clearcoat: 0.85,
              clearcoatRoughness: 0.35,
              transparent: true,
              opacity: 0.28,
              wireframe: false,
              side: THREE.DoubleSide,
            });
          }
        });

        this.bodyMesh = model;
        this.realisticMeshGroup.add(model);
      },
      undefined,
      (err) => console.warn('Could not load human_body.glb, fallback active:', err),
    );

    // 2. Load High-Res Cranial Head
    loader.load(
      '/models/head.glb',
      (gltf) => {
        const head = gltf.scene;
        head.scale.setScalar(0.048);
        head.position.set(0, 1.82, -0.02);

        head.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x222650,
              roughness: 0.4,
              metalness: 0.15,
              clearcoat: 0.9,
              transparent: true,
              opacity: 0.35,
              wireframe: false,
            });
          }
        });

        this.headMesh = head;
        this.realisticMeshGroup.add(head);
      },
      undefined,
      (err) => console.warn('Could not load head.glb, fallback active:', err),
    );
  }

  /* ------------------------------------------------------------ */
  /* 3D Brain Anatomy Sub-Assembly                                */
  /* ------------------------------------------------------------ */
  private buildBrainModel() {
    const geoL = new THREE.SphereGeometry(1, 64, 48);
    this.displaceGeometry(geoL, 0.075, 1);
    const geoR = new THREE.SphereGeometry(1, 64, 48);
    this.displaceGeometry(geoR, 0.075, -1);

    const matL = this.corticalMaterial(0x30356f);
    const matR = this.corticalMaterial(0x30356f);

    const left = new THREE.Mesh(geoL, matL);
    left.scale.set(0.52, 0.66, 0.9);
    left.position.set(-0.45, 0.02, 0);
    left.rotation.z = 0.05;

    const right = new THREE.Mesh(geoR, matR);
    right.scale.set(0.52, 0.66, 0.9);
    right.position.set(0.45, 0.02, 0);
    right.rotation.z = -0.05;

    this.brainGroup.add(left, right);
    this.addFresnelShell(left, 0.38, 0xc9a961, this.brainGroup);
    this.addFresnelShell(right, 0.38, 0xc9a961, this.brainGroup);

    // Cerebellum
    const cerGeo = new THREE.SphereGeometry(0.46, 48, 36);
    const pos = cerGeo.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const d = v.clone().normalize();
      const folia = Math.sin(d.y * 24 + Math.sin(d.z * 6) * 1.5) * 0.024;
      const n = gyriNoise(d.x * 4, d.y * 4, d.z * 4) * 0.028;
      v.copy(d).multiplyScalar(1 + folia + n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    cerGeo.computeVertexNormals();
    const cerebellum = new THREE.Mesh(cerGeo, this.corticalMaterial(0x3b4260, false));
    cerebellum.scale.set(1.12, 0.58, 0.8);
    cerebellum.position.set(0, -0.6, -0.52);
    cerebellum.rotation.x = 0.22;
    this.brainGroup.add(cerebellum);
    this.addFresnelShell(cerebellum, 0.65, 0xc9a961, this.brainGroup);

    // Brainstem & Pons
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.175, 0.66, 20), this.corticalMaterial(0x485270, false));
    stem.position.set(0, -0.6, 0.2);
    stem.rotation.x = -0.34;
    this.brainGroup.add(stem);

    const pons = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 16), this.corticalMaterial(0x525c7e, false));
    pons.scale.set(1, 0.75, 0.8);
    pons.position.set(0, -0.46, 0.3);
    this.brainGroup.add(pons);

    this.buildBrainRegionNodes();
  }

  private buildBrainRegionNodes() {
    for (const region of REGIONS) {
      const [x, y, z] = region.position;
      const color = new THREE.Color(region.color);

      let glow: THREE.Object3D;
      if (region.deep) {
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
        this.brainGroup.add(sprite);
        glow = sprite;
      } else {
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
        this.brainGroup.add(quad);
        glow = quad;
      }

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(region.size * 0.32, 16, 12),
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
      this.brainGroup.add(nucleus);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(region.size * 0.78, 0.16), 10, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.position.set(x, y, z);
      hit.userData.kind = 'region';
      hit.userData.regionId = region.id;
      this.brainGroup.add(hit);
      this.hitMeshes.push(hit);

      this.regionActivity[region.id] = region.baseActivity;
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
  /* Full-Body Nervous System & Plexus Network                    */
  /* ------------------------------------------------------------ */
  private buildNervousSystemNetwork() {
    // 1. Central Spinal Cord Trunk
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.62, 0.04),
      new THREE.Vector3(0, 1.35, -0.03),
      new THREE.Vector3(0, 1.05, -0.06),
      new THREE.Vector3(0, 0.75, -0.05),
      new THREE.Vector3(0, 0.42, -0.02),
    ]);
    const cordTube = new THREE.Mesh(
      new THREE.TubeGeometry(cordCurve, 40, 0.028, 12, false),
      new THREE.MeshStandardMaterial({
        color: 0xc98a2c,
        emissive: 0xc98a2c,
        emissiveIntensity: 0.65,
        roughness: 0.3,
        metalness: 0.2,
      }),
    );
    this.nervousSystemGroup.add(cordTube);

    // 2. Cauda Equina Filaments
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const spread = 0.04 + (i % 3) * 0.02;
      const strandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.42, -0.02),
        new THREE.Vector3(Math.cos(angle) * spread * 0.5, 0.3, -0.02),
        new THREE.Vector3(Math.cos(angle) * spread, 0.16, -0.02),
      ]);
      const strand = new THREE.Mesh(
        new THREE.TubeGeometry(strandCurve, 16, 0.006, 6, false),
        new THREE.MeshBasicMaterial({ color: 0xc9a961, transparent: true, opacity: 0.7 }),
      );
      this.nervousSystemGroup.add(strand);
    }

    // 3. Bilateral Spinal Nerve Roots (C1–S5 Segmentals)
    const yStarts = [1.5, 1.42, 1.34, 1.26, 1.18, 1.1, 1.02, 0.94, 0.86, 0.78, 0.7, 0.62, 0.54, 0.46];
    yStarts.forEach((y, idx) => {
      [-1, 1].forEach((side) => {
        const rootCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, y, -0.04),
          new THREE.Vector3(side * 0.06, y - 0.01, -0.02),
          new THREE.Vector3(side * 0.14, y - 0.03, 0.01),
        ]);
        const rootMesh = new THREE.Mesh(
          new THREE.TubeGeometry(rootCurve, 10, 0.008, 6, false),
          new THREE.MeshBasicMaterial({
            color: idx < 4 ? 0x22527b : idx < 10 ? 0xb5653a : 0x9c6b30,
            transparent: true,
            opacity: 0.85,
          }),
        );
        this.nervousSystemGroup.add(rootMesh);
      });
    });

    // 4. Brachial Plexus & Arm Peripheral Nerves (Bilateral)
    [-1, 1].forEach((side) => {
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.08, 1.4, -0.02),
        new THREE.Vector3(side * 0.24, 1.34, 0.01),
        new THREE.Vector3(side * 0.38, 1.25, 0.02),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(trunkCurve, 16, 0.014, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x22527b }),
        ),
      );

      const radialCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.38, 1.25, 0.02),
        new THREE.Vector3(side * 0.44, 1.12, -0.04),
        new THREE.Vector3(side * 0.5, 0.95, -0.03),
        new THREE.Vector3(side * 0.54, 0.72, 0.01),
        new THREE.Vector3(side * 0.62, 0.45, 0.04),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(radialCurve, 24, 0.01, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x3b7080 }),
        ),
      );

      const medianCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.38, 1.25, 0.02),
        new THREE.Vector3(side * 0.42, 1.08, 0.03),
        new THREE.Vector3(side * 0.48, 0.88, 0.04),
        new THREE.Vector3(side * 0.55, 0.65, 0.05),
        new THREE.Vector3(side * 0.64, 0.38, 0.06),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(medianCurve, 24, 0.01, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x5c7a58 }),
        ),
      );
    });

    // 5. Lumbosacral Plexus, Sciatic & Femoral Nerves (Bilateral)
    [-1, 1].forEach((side) => {
      const sciaticCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.08, 0.35, -0.04),
        new THREE.Vector3(side * 0.14, 0.22, -0.07),
        new THREE.Vector3(side * 0.16, -0.05, -0.06),
        new THREE.Vector3(side * 0.16, -0.42, -0.05),
        new THREE.Vector3(side * 0.17, -0.58, -0.03),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(sciaticCurve, 24, 0.018, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x9c6b30 }),
        ),
      );

      const femoralCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.06, 0.42, 0.01),
        new THREE.Vector3(side * 0.12, 0.28, 0.06),
        new THREE.Vector3(side * 0.15, 0.08, 0.07),
        new THREE.Vector3(side * 0.16, -0.22, 0.06),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(femoralCurve, 20, 0.012, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x8a5243 }),
        ),
      );

      const tibialCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.17, -0.58, -0.03),
        new THREE.Vector3(side * 0.17, -0.85, -0.04),
        new THREE.Vector3(side * 0.18, -1.15, -0.02),
        new THREE.Vector3(side * 0.19, -1.26, 0.05),
      ]);
      this.nervousSystemGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(tibialCurve, 20, 0.01, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x4b6b61 }),
        ),
      );
    });

    this.buildBodyPartNodes();
  }

  private buildBodyPartNodes() {
    for (const part of BODY_PARTS) {
      const [x, y, z] = part.position3D;
      const color = new THREE.Color(part.color);

      const glowMat = new THREE.SpriteMaterial({
        map: glowTex,
        color,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.position.set(x, y, z);
      glow.scale.setScalar(part.size * 1.6);
      glow.renderOrder = 18;
      this.nervousSystemGroup.add(glow);

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(part.size * 0.34, 16, 12),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      nucleus.position.set(x, y, z);
      nucleus.renderOrder = 19;
      this.nervousSystemGroup.add(nucleus);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(part.size * 0.75, 0.14), 10, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.position.set(x, y, z);
      hit.userData.kind = 'bodyPart';
      hit.userData.bodyPartId = part.id;
      this.nervousSystemGroup.add(hit);
      this.hitMeshes.push(hit);

      this.bodyPartActivity[part.id] = part.firingPropensity;
      this.bodyPartVisuals.set(part.id, {
        id: part.id,
        glow,
        nucleus,
        hit,
        targetGlow: 0.5 + (part.firingPropensity / 100) * 0.5,
        currentGlow: 0.5 + (part.firingPropensity / 100) * 0.5,
        flash: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ------------------------------------------------------------ */
  /* Visceral & Autonomic Organs 3D Group                         */
  /* ------------------------------------------------------------ */
  private buildVisceralOrgans() {
    // 1. Heart & Cardiac Plexus
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 24, 18),
      new THREE.MeshPhysicalMaterial({
        color: 0x76283b,
        emissive: 0x4a1824,
        emissiveIntensity: 0.5,
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.5,
      }),
    );
    heart.scale.set(0.9, 1.1, 0.85);
    heart.position.set(-0.04, 1.12, 0.08);
    this.visceralOrgansGroup.add(heart);

    // 2. Bilateral Lungs & Pulmonary Tree
    [-1, 1].forEach((side) => {
      const lung = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.38, 20),
        new THREE.MeshPhysicalMaterial({
          color: 0x28586a,
          roughness: 0.6,
          metalness: 0.1,
          transparent: true,
          opacity: 0.55,
        }),
      );
      lung.scale.set(1, 1, 0.75);
      lung.position.set(side * 0.15, 1.08, 0.02);
      lung.rotation.z = side * 0.1;
      this.visceralOrgansGroup.add(lung);
    });

    // 3. Enteric Stomach & Intestinal Coil ("Second Brain")
    const stomach = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.065, 16, 32, Math.PI * 1.3),
      new THREE.MeshPhysicalMaterial({
        color: 0x8a5830,
        emissive: 0x402510,
        emissiveIntensity: 0.4,
        roughness: 0.5,
      }),
    );
    stomach.position.set(-0.06, 0.78, 0.04);
    stomach.rotation.set(0.2, 0.3, -0.4);
    this.visceralOrgansGroup.add(stomach);

    const coil = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 16),
      new THREE.MeshStandardMaterial({
        color: 0x7a4d28,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      }),
    );
    coil.scale.set(1.1, 0.85, 0.8);
    coil.position.set(0, 0.54, 0.06);
    this.visceralOrgansGroup.add(coil);

    // 4. Bilateral Kidneys & Adrenals
    [-1, 1].forEach((side) => {
      const kidney = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x802838, roughness: 0.4 }),
      );
      kidney.scale.set(0.7, 1.2, 0.8);
      kidney.position.set(side * 0.15, 0.72, -0.04);
      this.visceralOrgansGroup.add(kidney);

      const adrenal = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.045, 12),
        new THREE.MeshStandardMaterial({ color: 0xc98a2c, emissive: 0xc98a2c, emissiveIntensity: 0.5 }),
      );
      adrenal.position.set(side * 0.15, 0.8, -0.04);
      this.visceralOrgansGroup.add(adrenal);
    });
  }

  /* ------------------------------------------------------------ */
  /* Skin Integumentary Envelope & Sensory Tactile Shell          */
  /* ------------------------------------------------------------ */
  private buildSkinIntegumentaryEnvelope() {
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0x30356f,
      roughness: 0.4,
      metalness: 0.08,
      transparent: true,
      opacity: 0.16,
      clearcoat: 0.7,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
    });

    const torsoSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 1.15, 32), skinMat);
    torsoSkin.position.set(0, 0.95, -0.01);
    this.skinIntegumentaryGroup.add(torsoSkin);

    // Tactile sensory dots over fingertips and palms
    const N = 200;
    const dotPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      dotPos[i * 3] = side * (0.62 + (Math.random() - 0.5) * 0.1);
      dotPos[i * 3 + 1] = 0.36 + (Math.random() - 0.5) * 0.14;
      dotPos[i * 3 + 2] = 0.06 + (Math.random() - 0.5) * 0.06;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xb5753a,
      size: 0.024,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.skinIntegumentaryGroup.add(new THREE.Points(dotGeo, dotMat));
  }

  /* ------------------------------------------------------------ */
  /* Dermatome Segmental Bands (C2–S5) Visual Overlay             */
  /* ------------------------------------------------------------ */
  private buildDermatomeBands() {
    const bandHeights = [
      { y: 1.42, name: 'C3–C4', col: 0x22527b },
      { y: 1.25, name: 'T1–T2', col: 0x3b7080 },
      { y: 1.12, name: 'T4 (Nipples)', col: 0x8a5243 },
      { y: 0.94, name: 'T7–T8', col: 0x9c6b30 },
      { y: 0.78, name: 'T10 (Umbilicus)', col: 0xc98a2c },
      { y: 0.62, name: 'T12–L1 (Inguinal)', col: 0x5c7a58 },
      { y: 0.42, name: 'L2–L3', col: 0x4b6b61 },
    ];

    bandHeights.forEach((band) => {
      const ringGeo = new THREE.TorusGeometry(0.3, 0.008, 8, 36);
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: band.col, transparent: true, opacity: 0.7 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, band.y, -0.01);
      this.dermatomeGroup.add(ring);
    });
  }

  /* ------------------------------------------------------------ */
  /* Helper Materials & Shaders                                   */
  /* ------------------------------------------------------------ */
  private corticalMaterial(tint: number, withVertexColors = true): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      roughness: 0.52,
      metalness: 0.04,
      clearcoat: 0.42,
      clearcoatRoughness: 0.5,
      emissive: 0x171a35,
      emissiveIntensity: 0.45,
      sheen: 0.2,
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
      if (sign === 1 && v.x > 0) v.x *= 0.62;
      if (sign === -1 && v.x < 0) v.x *= 0.62;
      posAttr.setXYZ(i, v.x, v.y, v.z);
      const t = THREE.MathUtils.clamp((n + 1.15) / 2.3, 0, 1);
      const brightness = 0.55 + 0.5 * t;
      colors[i * 3] = brightness * 0.95;
      colors[i * 3 + 1] = brightness * 0.92;
      colors[i * 3 + 2] = Math.min(1, brightness * 0.98);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
  }

  private addFresnelShell(source: THREE.Mesh, intensity: number, color: number, parent: THREE.Group) {
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
    parent.add(shell);
  }

  /* ------------------------------------------------------------ */
  /* View Modes & Layer Control API                               */
  /* ------------------------------------------------------------ */
  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    if (mode === 'brain') {
      this.brainGroup.visible = true;
      this.fullBodyGroup.visible = false;
      this.cameraTarget.set(0, -0.05, 0);
      this.cameraPosTarget.set(2.4, 3.4, 4.4);
      this.controls.minDistance = 2.5;
      this.controls.maxDistance = 8.5;
    } else {
      this.brainGroup.visible = false;
      this.fullBodyGroup.visible = true;
      this.cameraTarget.set(0, 0.4, 0);
      this.cameraPosTarget.set(0, 0.6, 4.4);
      this.controls.minDistance = 1.0;
      this.controls.maxDistance = 12;

      this.realisticMeshGroup.visible = true;
      this.nervousSystemGroup.visible = this.layers.peripheralNerves || this.layers.centralNervous;
      this.visceralOrgansGroup.visible = mode === 'organs' || (mode === 'fullbody' && this.layers.autonomicOrgans);
      this.skinIntegumentaryGroup.visible = mode === 'skin' || (mode === 'fullbody' && this.layers.skinIntegumentary);
      this.dermatomeGroup.visible = this.layers.dermatomeBands;
    }
  }

  setLayerVisibility(layers: SystemLayerVisibility) {
    this.layers = { ...layers };
    if (this.viewMode !== 'brain') {
      this.nervousSystemGroup.visible = layers.peripheralNerves || layers.centralNervous;
      this.visceralOrgansGroup.visible = layers.autonomicOrgans;
      this.skinIntegumentaryGroup.visible = layers.skinIntegumentary;
      this.dermatomeGroup.visible = layers.dermatomeBands;
      if (this.bodyMesh) {
        this.bodyMesh.visible = layers.skinIntegumentary;
      }
    }
  }

  selectRegion(id: RegionId | null) {
    this.selectedRegionId = id;
    if (id && this.viewMode === 'brain') {
      const reg = REGION_MAP[id];
      const [x, y, z] = reg.position;
      this.selectionRing.visible = true;
      this.selectionRing.position.set(x, y, z);
      this.selectionRing.scale.setScalar(reg.size * 1.8);
      this.cameraTarget.set(x * 0.45, y * 0.45, z * 0.45);
    } else if (!this.selectedBodyPartId) {
      this.selectionRing.visible = false;
      if (this.viewMode === 'brain') this.cameraTarget.set(0, -0.05, 0);
    }
  }

  selectBodyPart(id: BodyPartId | null) {
    this.selectedBodyPartId = id;
    if (id) {
      const part = BODY_PART_MAP[id];
      const [x, y, z] = part.position3D;
      this.selectionRing.visible = true;
      this.selectionRing.position.set(x, y, z);
      this.selectionRing.scale.setScalar(part.size * 1.5);
      this.cameraTarget.set(x * 0.35, y, z * 0.35 + 0.1);
    } else if (!this.selectedRegionId) {
      this.selectionRing.visible = false;
      this.cameraTarget.set(0, 0.4, 0);
    }
  }

  setRegionActivity(map: Partial<Record<RegionId, number>>) {
    for (const [id, v] of Object.entries(map) as [RegionId, number][]) {
      this.regionActivity[id] = v;
      const visual = this.regionVisuals.get(id);
      if (visual) visual.targetGlow = 0.14 + (v / 100) * 0.86;
    }
  }

  setBodyPartActivity(map: Partial<Record<BodyPartId, number>>) {
    for (const [id, v] of Object.entries(map) as [BodyPartId, number][]) {
      this.bodyPartActivity[id] = v;
      const visual = this.bodyPartVisuals.get(id);
      if (visual) visual.targetGlow = 0.2 + (v / 100) * 0.8;
    }
  }

  setAnimationMode(mode: ScenarioAnimation) {
    this.mode = mode;
  }

  /* ------------------------------------------------------------ */
  /* Neural Signal Pulse Propagation                              */
  /* ------------------------------------------------------------ */
  fireSignalPulse(
    fromCoords: [number, number, number],
    toCoords: [number, number, number],
    colorHex: string,
    durationMs = 1200,
  ): Promise<void> {
    return new Promise((resolve) => {
      const p1 = new THREE.Vector3(...fromCoords);
      const p2 = new THREE.Vector3(...toCoords);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.y += 0.08;
      mid.z += 0.08;

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.016, 8, false);

      const color = new THREE.Color(colorHex);
      const mat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uHead;
          varying vec2 vUv;
          void main() {
            float dist = abs(vUv.x - uHead);
            float pulse = smoothstep(0.24, 0.0, dist);
            gl_FragColor = vec4(uColor * (1.0 + pulse * 2.0), pulse * 0.95);
          }
        `,
        uniforms: {
          uColor: { value: color },
          uHead: { value: 0.0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const tube = new THREE.Mesh(tubeGeo, mat);
      tube.renderOrder = 30;

      const headMat = new THREE.SpriteMaterial({
        map: glowTex,
        color,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const head = new THREE.Sprite(headMat);
      head.scale.setScalar(0.18);
      head.renderOrder = 32;

      const group = this.viewMode === 'brain' ? this.brainGroup : this.fullBodyGroup;
      group.add(tube);
      group.add(head);

      this.pulses.push({
        tube,
        head,
        curve,
        material: mat,
        t: 0,
        duration: durationMs / 1000,
        target: '',
        resolve: () => {
          group.remove(tube);
          group.remove(head);
          tubeGeo.dispose();
          mat.dispose();
          headMat.dispose();
          resolve();
        },
      });
    });
  }

  /* ------------------------------------------------------------ */
  /* Event Listeners & Interaction                                */
  /* ------------------------------------------------------------ */
  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerClient.x = e.clientX;
    this.pointerClient.y = e.clientY;
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.downPos = { x: e.clientX, y: e.clientY };
  };

  private handlePointerUp = (e: PointerEvent) => {
    const dx = Math.abs(e.clientX - this.downPos.x);
    const dy = Math.abs(e.clientY - this.downPos.y);
    if (dx > 5 || dy > 5) return;

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    if (hits.length > 0) {
      const top = hits[0].object;
      if (top.userData.kind === 'region' && this.onRegionClick) {
        this.onRegionClick(top.userData.regionId);
      } else if (top.userData.kind === 'bodyPart' && this.onBodyPartClick) {
        this.onBodyPartClick(top.userData.bodyPartId);
      }
    }
  };

  private handlePointerLeave = () => {
    this.pointerNdc.set(-10, -10);
    if (this.onHover) this.onHover({ id: null, kind: null, x: 0, y: 0 });
  };

  private handleResize() {
    if (!this.container || this.disposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ------------------------------------------------------------ */
  /* Animation Tick Loop                                          */
  /* ------------------------------------------------------------ */
  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    this.controls.update();
    this.controls.target.lerp(this.cameraTarget, 0.08);

    // Pulse animation
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.t += dt / p.duration;
      if (p.t >= 1) {
        p.resolve();
        this.pulses.splice(i, 1);
      } else {
        p.material.uniforms.uHead.value = p.t;
        const pt = p.curve.getPointAt(p.t);
        p.head.position.copy(pt);
      }
    }

    // Hover raycast
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    if (hits.length > 0) {
      const top = hits[0].object;
      if (top.userData.kind === 'region') {
        const reg = REGION_MAP[top.userData.regionId as RegionId];
        if (this.onHover) {
          this.onHover({
            id: reg.id,
            kind: 'region',
            name: reg.name,
            x: this.pointerClient.x,
            y: this.pointerClient.y,
          });
        }
      } else if (top.userData.kind === 'bodyPart') {
        const part = BODY_PART_MAP[top.userData.bodyPartId as BodyPartId];
        if (this.onHover) {
          this.onHover({
            id: part.id,
            kind: 'bodyPart',
            name: part.name,
            x: this.pointerClient.x,
            y: this.pointerClient.y,
          });
        }
      }
    }

    // Gentle organic breathing oscillation
    const breath = 1 + Math.sin(time * 1.4) * 0.012;
    if (this.viewMode === 'fullbody') {
      this.fullBodyGroup.scale.set(1, breath, 1);
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
