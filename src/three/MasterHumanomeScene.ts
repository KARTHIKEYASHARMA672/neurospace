import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ANATOMY_SYSTEMS,
  type AnatomySystemId,
  type RenderingViewMode,
} from '../data/anatomySystems';

export interface AnatomicalHoverInfo {
  name: string;
  system: string;
  x: number;
  y: number;
}

export class MasterHumanomeScene {
  onHover: ((info: AnatomicalHoverInfo | null) => void) | null = null;
  onStructureClick: ((name: string, system: string) => void) | null = null;

  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private rootGroup = new THREE.Group();
  private systemGroups = new Map<AnatomySystemId, THREE.Group>();
  private loadedModels = new Map<AnatomySystemId, THREE.Object3D>();

  private clock = new THREE.Clock();
  private raf = 0;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-10, -10);
  private pointerClient = { x: 0, y: 0 };
  private selectableMeshes: THREE.Mesh[] = [];

  private activeSystems: Record<AnatomySystemId, boolean> = {
    skeleton: true,
    muscular: true,
    nervous: true,
    cardiovascular: true,
    organs: true,
    skin: true,
  };

  private currentViewMode: RenderingViewMode = 'xray';
  private systemOpacities: Record<AnatomySystemId, number> = {
    skeleton: 0.95,
    muscular: 0.28,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.55,
    skin: 0.12,
  };

  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x100f0c, 0.016);

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this.camera.position.set(0, 0.2, 3.4);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.minDistance = 0.6;
    this.controls.maxDistance = 8.5;
    this.controls.target.set(0, 0, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;

    // High fidelity surgical / medical lighting rig
    this.scene.add(new THREE.HemisphereLight(0xf2f4f8, 0x12141c, 0.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x77a6e8, 1.1);
    rimLight.position.set(-3, 2, -3);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xb5653a, 0.6);
    fillLight.position.set(0, -3, 2);
    this.scene.add(fillLight);

    this.scene.add(this.rootGroup);

    // Initialize individual system groups
    (Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[]).forEach((sysId) => {
      const g = new THREE.Group();
      this.systemGroups.set(sysId, g);
      this.rootGroup.add(g);
    });

    this.buildStarfield();
    this.loadAllAnatomySystems();

    // Event listeners
    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.handlePointerMove);
    el.addEventListener('pointerup', this.handlePointerUp);
    el.addEventListener('pointerleave', this.handlePointerLeave);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.tick();
  }

  private buildStarfield() {
    const N = 1000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 16 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      c.setHex(Math.random() < 0.75 ? 0xede3d0 : 0xc9a961).multiplyScalar(0.4 + Math.random() * 0.6);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  private loadAllAnatomySystems() {
    const loader = new GLTFLoader();

    (Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[]).forEach((sysId) => {
      const cfg = ANATOMY_SYSTEMS[sysId];
      const group = this.systemGroups.get(sysId)!;

      loader.load(
        cfg.modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Compute bounding box and normalize scale & center
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // Calibrate to uniform 1.8m human anatomical coordinates
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 1.9 / (maxDim || 1);
          model.scale.setScalar(scaleFactor);
          model.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.userData.system = sysId;
              mesh.userData.structureName = mesh.name || cfg.name;
              this.selectableMeshes.push(mesh);
            }
          });

          this.loadedModels.set(sysId, model);
          group.add(model);

          // Apply current rendering mode and visibility
          this.applySystemAppearance(sysId);
        },
        undefined,
        (err) => console.warn(`Error loading system ${sysId}:`, err),
      );
    });
  }

  /* ------------------------------------------------------------ */
  /* Real-Time System Visibility & X-Ray Rendering Shader Passes  */
  /* ------------------------------------------------------------ */
  setSystemVisibility(sysId: AnatomySystemId, visible: boolean) {
    this.activeSystems[sysId] = visible;
    const group = this.systemGroups.get(sysId);
    if (group) group.visible = visible;
  }

  setSystemOpacity(sysId: AnatomySystemId, opacity: number) {
    this.systemOpacities[sysId] = opacity;
    this.applySystemAppearance(sysId);
  }

  setViewMode(mode: RenderingViewMode) {
    this.currentViewMode = mode;
    (Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[]).forEach((sysId) => {
      this.applySystemAppearance(sysId);
    });
  }

  private applySystemAppearance(sysId: AnatomySystemId) {
    const model = this.loadedModels.get(sysId);
    if (!model) return;
    const cfg = ANATOMY_SYSTEMS[sysId];
    const isXray = this.currentViewMode === 'xray';
    const isCT = this.currentViewMode === 'ct';
    const isMRI = this.currentViewMode === 'mri';

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        if (isXray) {
          // Radiopaque translucent X-ray shader with edge glow
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: cfg.xrayColor,
            emissive: cfg.xrayColor,
            emissiveIntensity: sysId === 'nervous' ? 0.6 : sysId === 'cardiovascular' ? 0.4 : 0.15,
            roughness: 0.25,
            metalness: 0.1,
            clearcoat: 0.8,
            transparent: true,
            opacity: this.systemOpacities[sysId] ?? cfg.xrayOpacity,
            depthWrite: sysId === 'skeleton',
            blending: THREE.NormalBlending,
            side: sysId === 'skin' ? THREE.DoubleSide : THREE.FrontSide,
          });
        } else if (isCT) {
          // Radiological bone & contrast density
          const isHighDensity = sysId === 'skeleton' || sysId === 'cardiovascular';
          mesh.material = new THREE.MeshStandardMaterial({
            color: isHighDensity ? 0xffffff : 0x4a4a52,
            roughness: 0.4,
            metalness: 0.2,
            transparent: !isHighDensity,
            opacity: isHighDensity ? 1.0 : 0.25,
          });
        } else if (isMRI) {
          // T2-weighted MRI soft tissue high signal
          const isWaterFat = sysId === 'nervous' || sysId === 'organs' || sysId === 'muscular';
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: isWaterFat ? 0x90e0ef : 0x1e2230,
            emissive: isWaterFat ? 0x0077b6 : 0x000000,
            emissiveIntensity: 0.35,
            roughness: 0.3,
            transparent: true,
            opacity: isWaterFat ? 0.85 : 0.3,
          });
        } else {
          // Realistic photographic anatomical tissue
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: cfg.defaultColor,
            roughness: sysId === 'skeleton' ? 0.6 : 0.35,
            metalness: 0.05,
            clearcoat: sysId === 'organs' || sysId === 'nervous' ? 0.6 : 0.2,
            clearcoatRoughness: 0.3,
            transparent: sysId === 'skin',
            opacity: sysId === 'skin' ? 0.4 : 1.0,
          });
        }
      }
    });
  }

  /* ------------------------------------------------------------ */
  /* Raycasting & Interactive Inspection                          */
  /* ------------------------------------------------------------ */
  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerClient.x = e.clientX;
    this.pointerClient.y = e.clientY;
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private handlePointerUp = () => {
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const visibleMeshes = this.selectableMeshes.filter(
      (m) => this.activeSystems[m.userData.system as AnatomySystemId],
    );
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);
    if (hits.length > 0) {
      const top = hits[0].object;
      if (this.onStructureClick) {
        this.onStructureClick(top.userData.structureName, top.userData.system);
      }
    }
  };

  private handlePointerLeave = () => {
    this.pointerNdc.set(-10, -10);
    if (this.onHover) this.onHover(null);
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

  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);

    this.controls.update();

    // Hover raycasting
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const visibleMeshes = this.selectableMeshes.filter(
      (m) => this.activeSystems[m.userData.system as AnatomySystemId],
    );
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);
    if (hits.length > 0) {
      const top = hits[0].object;
      if (this.onHover) {
        this.onHover({
          name: top.userData.structureName,
          system: ANATOMY_SYSTEMS[top.userData.system as AnatomySystemId]?.name || top.userData.system,
          x: this.pointerClient.x,
          y: this.pointerClient.y,
        });
      }
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
