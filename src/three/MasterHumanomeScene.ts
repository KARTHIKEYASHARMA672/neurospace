import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
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

export interface OrganTargetConfig {
  x: number;
  y: number;
  z: number;
  camDist: number;
  keywords: string[];
  system: AnatomySystemId;
  title: string;
}

export const ORGAN_TARGET_CONFIGS: Record<string, OrganTargetConfig> = {
  heart: {
    x: 0.02,
    y: 1.28 - 0.87,
    z: 0.03,
    camDist: 0.38,
    keywords: ['atrium', 'ventricle', 'aorta', 'papillary', 'cardiac', 'leaflet', 'circumflex', 'interventricular'],
    system: 'cardiovascular',
    title: 'Heart & Ventricles (4 Chambers, Great Vessels & Coronary Circulation)',
  },
  brain: {
    x: 0.0,
    y: 1.62 - 0.87,
    z: 0.0,
    camDist: 0.42,
    keywords: ['cerebrum', 'brain', 'cortex', 'cerebell', 'thalamus', 'temporal', 'frontal', 'occipital', 'parietal'],
    system: 'nervous',
    title: 'Brain & Cerebral Cortex (12 Cortical Territories & Limbic System)',
  },
  lungs: {
    x: 0.0,
    y: 1.30 - 0.87,
    z: 0.02,
    camDist: 0.55,
    keywords: ['lung', 'bronch', 'pleura', 'trachea', 'lobe'],
    system: 'organs',
    title: 'Lungs & Tracheobronchial Tree (Bilateral 5 Lobes & Alveoli)',
  },
  liver: {
    x: -0.04,
    y: 1.15 - 0.87,
    z: 0.02,
    camDist: 0.48,
    keywords: ['liver', 'hepatic', 'gallbladder', 'bile'],
    system: 'organs',
    title: 'Liver & Hepatic Segments (8 Couinaud Segments & Biliary System)',
  },
  stomach: {
    x: 0.04,
    y: 1.18 - 0.87,
    z: 0.02,
    camDist: 0.44,
    keywords: ['stomach', 'gastric', 'oesophagus', 'esophagus', 'pylorus'],
    system: 'organs',
    title: 'Stomach & Gastric Reservoir (Rugae, Fundus, Body & Pyloric Antrum)',
  },
  kidneys: {
    x: 0.0,
    y: 1.08 - 0.87,
    z: -0.02,
    camDist: 0.46,
    keywords: ['kidney', 'renal', 'ureter'],
    system: 'organs',
    title: 'Kidneys & Urinary Excretory Axis (Renal Cortex, Medulla & Ureters)',
  },
  pancreas: {
    x: 0.01,
    y: 1.14 - 0.87,
    z: 0.0,
    camDist: 0.40,
    keywords: ['pancreas', 'pancreatic', 'islet', 'duodenum'],
    system: 'organs',
    title: 'Pancreas & Duodenal C-Loop (Endocrine Islets & Exocrine Acini)',
  },
  intestines: {
    x: 0.0,
    y: 0.98 - 0.87,
    z: 0.02,
    camDist: 0.52,
    keywords: ['jejunum', 'duodenum', 'colon', 'caecum', 'cecum', 'appendix', 'taenia', 'omentum', 'mesocolon'],
    system: 'organs',
    title: 'Intestinal Tract & Enteric Second Brain (Small & Large Intestine)',
  },
  bladder: {
    x: 0.0,
    y: 0.80 - 0.87,
    z: 0.03,
    camDist: 0.38,
    keywords: ['bladder', 'urethra', 'prostate'],
    system: 'organs',
    title: 'Urinary Bladder & Pelvic Reservoirs (Detrusor Muscle & Trigone)',
  },
  thyroid: {
    x: 0.0,
    y: 1.48 - 0.87,
    z: 0.03,
    camDist: 0.34,
    keywords: ['thyroid', 'parathyroid', 'larynx', 'epiglottis'],
    system: 'organs',
    title: 'Thyroid & Parathyroid Glands (Endocrine Metabolic Regulators)',
  },
  adrenals: {
    x: 0.0,
    y: 1.16 - 0.87,
    z: -0.02,
    camDist: 0.36,
    keywords: ['suprarenal', 'adrenal'],
    system: 'organs',
    title: 'Suprarenal Adrenal Glands (Cortisol & Fight-or-Flight Adrenaline)',
  },
  spleen: {
    x: 0.08,
    y: 1.18 - 0.87,
    z: -0.02,
    camDist: 0.38,
    keywords: ['spleen', 'splenic'],
    system: 'organs',
    title: 'Spleen (Red & White Pulp Immunological & Hematological Filter)',
  },
  skeleton: {
    x: 0.0,
    y: 0.0,
    z: 0.0,
    camDist: 2.6,
    keywords: ['bone', 'vertebra', 'rib', 'femur', 'skull', 'pelvis'],
    system: 'skeleton',
    title: 'Skeletal System (206 Articulated Axial & Appendicular Bones)',
  },
  muscular: {
    x: 0.0,
    y: 0.0,
    z: 0.0,
    camDist: 2.6,
    keywords: ['muscle', 'pectoral', 'biceps', 'gluteus', 'rectus'],
    system: 'muscular',
    title: 'Muscular System (Over 650 Skeletal Muscles & Kinetic Chains)',
  },
};

export class MasterHumanomeScene {
  onHover: ((info: AnatomicalHoverInfo | null) => void) | null = null;
  onStructureClick: ((name: string, system: string) => void) | null = null;
  onLoadingProgress: ((loaded: number, total: number) => void) | null = null;

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
    muscular: 0.25,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.75,
    skin: 0.12,
  };

  // Camera animation lerp state
  private targetLookAt = new THREE.Vector3(0, 0, 0);
  private targetCamPos = new THREE.Vector3(0, 0.1, 2.7);
  private isAnimatingCamera = false;
  private selectedMeshList: THREE.Mesh[] = [];
  private pulsePhase = 0;

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
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x100f0c, 0.016);

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.05, 100);
    this.camera.position.set(0, 0.1, 2.7);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.minDistance = 0.2;
    this.controls.maxDistance = 8.0;
    this.controls.target.set(0, 0, 0);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.4;

    // Surgical & Diagnostic Medical Lighting
    this.scene.add(new THREE.HemisphereLight(0xf2f4f8, 0x12141c, 0.9));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 4, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x77a6e8, 1.2);
    rimLight.position.set(-3, 2, -3);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xb5653a, 0.7);
    fillLight.position.set(0, -3, 2);
    this.scene.add(fillLight);

    // Subtle axial spotlight for deep visceral illumination
    const visceralSpot = new THREE.SpotLight(0xfff5e6, 2.0, 5, Math.PI / 4, 0.4);
    visceralSpot.position.set(0, 1.2, 1.5);
    this.scene.add(visceralSpot);

    // Shared root group: shifted down so body center (Y = 0.87m) is at Y = 0
    this.rootGroup.position.set(0, -0.87, 0);
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
    const N = 800;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 16 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      c.setHex(Math.random() < 0.75 ? 0xede3d0 : 0xc9a961).multiplyScalar(0.3 + Math.random() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  private loadAllAnatomySystems() {
    const loader = new GLTFLoader();
    // Critical: decode EXT_meshopt_compression used by all Z-Anatomy models
    loader.setMeshoptDecoder(MeshoptDecoder);

    const systemKeys = Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[];
    let loadedCount = 0;

    systemKeys.forEach((sysId) => {
      const cfg = ANATOMY_SYSTEMS[sysId];
      const group = this.systemGroups.get(sysId)!;

      loader.load(
        cfg.modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // All 6 Z-Anatomy models share the identical 1.74m anatomical world space!
          // We keep scale at 1.0 and origin at (0,0,0) so all 6 systems lock together.
          model.scale.set(1, 1, 1);
          model.position.set(0, 0, 0);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.userData.system = sysId;
              mesh.userData.structureName = mesh.name || cfg.name;
              mesh.castShadow = false;
              mesh.receiveShadow = false;
              this.selectableMeshes.push(mesh);
            }
          });

          this.loadedModels.set(sysId, model);
          group.add(model);

          // Apply current rendering mode and visibility
          this.applySystemAppearance(sysId);

          loadedCount += 1;
          if (this.onLoadingProgress) {
            this.onLoadingProgress(loadedCount, systemKeys.length);
          }
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

        // Skip currently selected & pulsing meshes to avoid overwriting their glow
        if (this.selectedMeshList.includes(mesh)) return;

        if (isXray) {
          // Radiopaque translucent X-ray shader with edge glow
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: cfg.xrayColor,
            emissive: cfg.xrayColor,
            emissiveIntensity: sysId === 'nervous' ? 0.6 : sysId === 'cardiovascular' ? 0.45 : sysId === 'organs' ? 0.35 : 0.15,
            roughness: 0.25,
            metalness: 0.1,
            clearcoat: 0.8,
            transparent: true,
            opacity: this.systemOpacities[sysId] ?? cfg.xrayOpacity,
            depthWrite: sysId === 'skeleton' || sysId === 'organs',
            blending: THREE.NormalBlending,
            side: sysId === 'skin' ? THREE.DoubleSide : THREE.FrontSide,
          });
        } else if (isCT) {
          // Radiological bone & contrast density
          const isHighDensity = sysId === 'skeleton' || sysId === 'cardiovascular';
          mesh.material = new THREE.MeshStandardMaterial({
            color: isHighDensity ? 0xffffff : 0x5a5a64,
            roughness: 0.4,
            metalness: 0.2,
            transparent: !isHighDensity,
            opacity: isHighDensity ? 1.0 : 0.3,
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
          let organColor = cfg.defaultColor;
          // Sub-color specific visceral organs for high anatomical realism in photoreal mode
          if (sysId === 'organs') {
            const nl = mesh.name.toLowerCase();
            if (nl.includes('liver')) organColor = 0x6e2626; // Deep hepatic red/brown
            else if (nl.includes('gallbladder')) organColor = 0x2d6a4f; // Bile emerald green
            else if (nl.includes('stomach')) organColor = 0xbe7c72; // Warm gastric mucosa
            else if (nl.includes('kidney')) organColor = 0x8b3a3a; // Cortical maroon
            else if (nl.includes('lung')) organColor = 0xb48282; // Pulmonary alveolar pink
            else if (nl.includes('pancreas')) organColor = 0xd4a373; // Ochre pancreatic glandular
            else if (nl.includes('colon') || nl.includes('jejunum')) organColor = 0xc59b76; // Intestinal tube
            else if (nl.includes('bladder')) organColor = 0xc8a27a; // Amber detrusor
            else if (nl.includes('thyroid')) organColor = 0xa3485e; // Endocrine crimson
            else if (nl.includes('trachea')) organColor = 0xd8d8d8; // Cartilaginous rings
          } else if (sysId === 'cardiovascular') {
            const nl = mesh.name.toLowerCase();
            if (nl.includes('vein') || nl.includes('vena')) organColor = 0x2255aa; // Deoxygenated venous blue
            else organColor = 0xcc2222; // Arterial oxygenated crimson
          }

          mesh.material = new THREE.MeshPhysicalMaterial({
            color: organColor,
            roughness: sysId === 'skeleton' ? 0.55 : 0.35,
            metalness: 0.05,
            clearcoat: sysId === 'organs' || sysId === 'nervous' ? 0.7 : 0.2,
            clearcoatRoughness: 0.3,
            transparent: sysId === 'skin',
            opacity: sysId === 'skin' ? 0.35 : 1.0,
          });
        }
      }
    });
  }

  /* ------------------------------------------------------------ */
  /* Camera Targeting & Organ Focus                               */
  /* ------------------------------------------------------------ */
  focusOnOrgan(organKey: string) {
    const key = organKey.toLowerCase().trim();
    let config: OrganTargetConfig | null = null;

    for (const [cfgKey, cfg] of Object.entries(ORGAN_TARGET_CONFIGS)) {
      if (key.includes(cfgKey) || cfgKey.includes(key)) {
        config = cfg;
        break;
      }
    }

    // Default fallback to chest if not explicitly matched
    if (!config) {
      config = {
        x: 0,
        y: 0.3,
        z: 0,
        camDist: 0.6,
        keywords: [key],
        system: 'organs',
        title: organKey,
      };
    }

    // Ensure the system of that organ is enabled and clearly visible
    this.setSystemVisibility(config.system, true);
    if (config.system === 'organs') {
      // If inspecting organs, increase organs opacity and dim skin/muscles slightly
      this.setSystemOpacity('organs', 0.95);
      this.setSystemOpacity('muscular', 0.15);
      this.setSystemOpacity('skin', 0.08);
    } else if (config.system === 'cardiovascular') {
      this.setSystemOpacity('cardiovascular', 1.0);
      this.setSystemOpacity('muscular', 0.12);
      this.setSystemOpacity('skin', 0.08);
    }

    // Highlight all matching meshes
    this.clearOrganHighlight();
    const keywords = config.keywords;

    this.selectableMeshes.forEach((mesh) => {
      const name = mesh.name.toLowerCase();
      const matches = keywords.some((kw) => name.includes(kw));
      if (matches) {
        this.selectedMeshList.push(mesh);
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: 0xffd166,
          emissive: 0xff9f1c,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.2,
          clearcoat: 1.0,
          transparent: false,
          opacity: 1.0,
        });
      }
    });

    // Set animation target
    this.targetLookAt.set(config.x, config.y, config.z);
    this.targetCamPos.set(config.x, config.y + 0.05, config.z + config.camDist);
    this.isAnimatingCamera = true;
    this.controls.autoRotate = false;
  }

  clearOrganHighlight() {
    this.selectedMeshList = [];
    (Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[]).forEach((sysId) => {
      this.applySystemAppearance(sysId);
    });
  }

  resetToFullBody() {
    this.clearOrganHighlight();
    this.targetLookAt.set(0, 0, 0);
    this.targetCamPos.set(0, 0.1, 2.7);
    this.isAnimatingCamera = true;
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
      const top = hits[0].object as THREE.Mesh;
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

    const delta = this.clock.getDelta();

    // Smooth camera transitions when focusing on organs
    if (this.isAnimatingCamera) {
      this.controls.target.lerp(this.targetLookAt, 0.08);
      this.camera.position.lerp(this.targetCamPos, 0.08);

      if (
        this.controls.target.distanceTo(this.targetLookAt) < 0.005 &&
        this.camera.position.distanceTo(this.targetCamPos) < 0.005
      ) {
        this.isAnimatingCamera = false;
      }
    }

    // Pulse highlight for selected organ meshes
    if (this.selectedMeshList.length > 0) {
      this.pulsePhase += delta * 4;
      const glow = 0.5 + Math.sin(this.pulsePhase) * 0.4;
      this.selectedMeshList.forEach((m) => {
        const mat = m.material as THREE.MeshPhysicalMaterial;
        if (mat && mat.emissive) {
          mat.emissiveIntensity = glow;
        }
      });
    }

    this.controls.update();

    // Hover raycasting
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const visibleMeshes = this.selectableMeshes.filter(
      (m) => this.activeSystems[m.userData.system as AnatomySystemId],
    );
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);
    if (hits.length > 0) {
      const top = hits[0].object as THREE.Mesh;
      if (this.onHover) {
        this.onHover({
          name: top.userData.structureName.replace(/_/g, ' '),
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
