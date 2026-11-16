import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type OrganViewKey =
  | 'heart'
  | 'brain'
  | 'lungs'
  | 'liver'
  | 'kidneys'
  | 'stomach'
  | 'skeleton'
  | 'muscular'
  | 'vascular'
  | 'fullbody';

export type MedicalRenderMode = 'photoreal' | 'xray' | 'ct' | 'mri';

export interface AnatomicalPin {
  id: string;
  name: string;
  category: string;
  position: THREE.Vector3;
  description: string;
}

export class AnatomyAtlasScene {
  onPinClick: ((pin: AnatomicalPin) => void) | null = null;
  onHoverStructure: ((name: string | null, x: number, y: number) => void) | null = null;

  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  // Root groups
  private fullBodyGroup = new THREE.Group();
  private organFocusGroup = new THREE.Group();
  private pinsGroup = new THREE.Group();

  // Full body sub-system groups
  private systemModels = new Map<string, THREE.Object3D>();
  private systemVisibilities: Record<string, boolean> = {
    skeleton: true,
    muscular: true,
    nervous: true,
    cardiovascular: true,
    organs: true,
    skin: true,
  };
  private systemOpacities: Record<string, number> = {
    skeleton: 0.9,
    muscular: 0.2,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.85,
    skin: 0.12,
  };

  // State
  private currentView: OrganViewKey = 'heart';
  private renderMode: MedicalRenderMode = 'photoreal';
  private isBeating = true;
  private isBreathing = true;
  private isCutaway = false;
  private cutawayPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02);

  // Dynamic animation handles
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;

  // Camera lerp targets
  private targetLookAt = new THREE.Vector3(0, 0, 0);
  private targetCamPos = new THREE.Vector3(0, 0.1, 1.2);
  private isLerpingCamera = false;

  // Organ specific animated nodes
  private heartNode: THREE.Object3D | null = null;
  private lungsNode: THREE.Object3D | null = null;
  private brainGlowMat: THREE.MeshPhysicalMaterial | null = null;

  // Pins
  private activePins: AnatomicalPin[] = [];
  private pinSprites: { pin: AnatomicalPin; obj: THREE.Object3D }[] = [];

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
    this.renderer.localClippingEnabled = true; // Enables coronal cutaway cross-sections
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x091211, 0.02);

    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.05, 50);
    this.camera.position.set(0, 0.1, 1.2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.15;
    this.controls.maxDistance = 6.0;
    this.controls.target.set(0, 0, 0);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.4;

    this.setupLighting();

    this.scene.add(this.fullBodyGroup);
    this.scene.add(this.organFocusGroup);
    this.scene.add(this.pinsGroup);

    // Center full body model so Y=0 is center of chest
    this.fullBodyGroup.position.set(0, -0.87, 0);

    this.buildStarfield();
    this.loadFullBodyZAnatomy();

    // Default to Heart View
    this.switchToView('heart');

    // Events
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.tick();
  }

  private setupLighting() {
    this.scene.add(new THREE.HemisphereLight(0xf2f7f6, 0x091413, 1.0));

    // Surgical Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2.5, 3.5, 3.0);
    this.scene.add(keyLight);

    // Cyan / Teal Rim Light
    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.4);
    rimLight.position.set(-3.0, 1.5, -2.5);
    this.scene.add(rimLight);

    // Warm Amber Fill Light
    const fillLight = new THREE.DirectionalLight(0xd97706, 0.65);
    fillLight.position.set(0.5, -3.0, 2.0);
    this.scene.add(fillLight);

    // Direct Visceral Spotlight
    const spot = new THREE.SpotLight(0xfff7ed, 2.5, 6, Math.PI / 4, 0.35);
    spot.position.set(0, 1.2, 1.8);
    this.scene.add(spot);
  }

  private buildStarfield() {
    const N = 600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 14 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      c.setHex(Math.random() < 0.75 ? 0x14b8a6 : 0xf6f3e9).multiplyScalar(0.25 + Math.random() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  /* ------------------------------------------------------------ */
  /* Z-Anatomy 6 System Loader with MeshoptDecoder                */
  /* ------------------------------------------------------------ */
  private loadFullBodyZAnatomy() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const systems = [
      { id: 'skeleton', url: '/models/anatomy/z-skeleton.glb', color: 0xe8e2d2 },
      { id: 'organs', url: '/models/anatomy/z-organs.glb', color: 0x8b3a3a },
      { id: 'muscular', url: '/models/anatomy/z-muscular.glb', color: 0xa83232 },
      { id: 'nervous', url: '/models/anatomy/z-nervous.glb', color: 0x14b8a6 },
      { id: 'cardiovascular', url: '/models/anatomy/z-cardiovascular.glb', color: 0xdc2626 },
      { id: 'skin', url: '/models/anatomy/z-skin.glb', color: 0xf4d0b0 },
    ];

    systems.forEach((sys) => {
      loader.load(
        sys.url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1, 1, 1);
          model.position.set(0, 0, 0);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              m.userData.system = sys.id;
              m.userData.defaultColor = sys.color;
            }
          });

          this.systemModels.set(sys.id, model);
          this.fullBodyGroup.add(model);
          this.applyFullBodyMaterials(sys.id);
          this.switchToView(this.currentView);
        },
        undefined,
        (err) => console.warn(`Failed loading system ${sys.id}:`, err),
      );
    });
  }

  private applyFullBodyMaterials(sysId: string) {
    const model = this.systemModels.get(sysId);
    if (!model) return;

    const visible = this.systemVisibilities[sysId] ?? true;
    model.visible = visible;
    if (!visible) return;

    const opacity = this.systemOpacities[sysId] ?? 0.8;
    const isXray = this.renderMode === 'xray';
    const isCT = this.renderMode === 'ct';
    const isMRI = this.renderMode === 'mri';

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const baseColor = (mesh.userData.defaultColor as number) || 0x14b8a6;

        if (isXray) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: baseColor,
            emissive: baseColor,
            emissiveIntensity: sysId === 'nervous' ? 0.6 : 0.25,
            roughness: 0.25,
            metalness: 0.1,
            clearcoat: 0.9,
            transparent: true,
            opacity: opacity * 0.8,
            depthWrite: sysId === 'skeleton',
            side: sysId === 'skin' ? THREE.DoubleSide : THREE.FrontSide,
          });
        } else if (isCT) {
          const isBone = sysId === 'skeleton';
          mesh.material = new THREE.MeshStandardMaterial({
            color: isBone ? 0xffffff : 0x475569,
            roughness: 0.4,
            transparent: !isBone,
            opacity: isBone ? 1.0 : 0.25,
          });
        } else if (isMRI) {
          const isSoft = sysId === 'nervous' || sysId === 'organs';
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: isSoft ? 0x2dd4bf : 0x1e293b,
            emissive: isSoft ? 0x0f766e : 0x000000,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: isSoft ? 0.85 : 0.2,
          });
        } else {
          // Photoreal
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: baseColor,
            roughness: sysId === 'skeleton' ? 0.6 : 0.35,
            metalness: 0.05,
            clearcoat: sysId === 'organs' ? 0.6 : 0.1,
            transparent: sysId === 'skin',
            opacity: sysId === 'skin' ? 0.35 : 1.0,
          });
        }
      }
    });
  }

  /* ------------------------------------------------------------ */
  /* Dedicated High-Detail 3D Organ Procedural Builders           */
  /* ------------------------------------------------------------ */
  public switchToView(view: OrganViewKey) {
    this.currentView = view;
    this.clearOrganFocus();

    if (view === 'fullbody') {
      this.fullBodyGroup.visible = true;
      (Object.keys(this.systemVisibilities)).forEach((k) => {
        this.applyFullBodyMaterials(k);
      });
      this.targetLookAt.set(0, 0, 0);
      this.targetCamPos.set(0, 0.1, 2.7);
      this.isLerpingCamera = true;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.4;
      return;
    }

    switch (view) {
      case 'heart':
        this.buildClinicalHeart();
        break;
      case 'brain':
        this.buildClinicalBrain();
        break;
      case 'lungs':
        this.buildClinicalLungs();
        break;
      case 'liver':
        this.buildClinicalLiver();
        break;
      case 'kidneys':
        this.buildClinicalKidneys();
        break;
      case 'stomach':
        this.buildClinicalDigestive();
        break;
      case 'skeleton':
        this.buildIsolatedSkeleton();
        break;
      case 'muscular':
        this.buildIsolatedMuscular();
        break;
      case 'vascular':
        this.buildIsolatedVascular();
        break;
    }
  }

  private clearOrganFocus() {
    while (this.organFocusGroup.children.length > 0) {
      const obj = this.organFocusGroup.children[0];
      this.organFocusGroup.remove(obj);
    }
    while (this.pinsGroup.children.length > 0) {
      const p = this.pinsGroup.children[0];
      this.pinsGroup.remove(p);
    }
    this.activePins = [];
    this.pinSprites = [];
    if (this.heartNode) {
      this.heartNode.scale.set(5, 5, 5);
      this.heartNode = null;
    }
    if (this.lungsNode) {
      this.lungsNode.scale.set(0.8, 0.8, 0.8);
      this.lungsNode = null;
    }
    this.brainGlowMat = null;
  }

  /* ------------------------------------------------------------ */
  /* Clinical 3D Z-Anatomy Organ Mesh Isolation Engine            */
  /* ------------------------------------------------------------ */
  private isolateOrganMeshes(systemKey: string, allowedKeywords: string[], secondarySystemKeys: string[] = []): THREE.Mesh[] {
    const matchedMeshes: THREE.Mesh[] = [];
    this.fullBodyGroup.visible = true;

    // Isolate target systems: hide all others
    this.systemModels.forEach((model, key) => {
      if (key !== systemKey && !secondarySystemKeys.includes(key)) {
        model.visible = false;
      } else {
        model.visible = true;
      }
    });

    const targetSystems = [systemKey, ...secondarySystemKeys];
    targetSystems.forEach((sysKey) => {
      const root = this.systemModels.get(sysKey);
      if (!root) return;
      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          let match = false;
          let curr: THREE.Object3D | null = mesh;
          while (curr && curr !== root) {
            const nameLower = (curr.name || '').toLowerCase();
            if (allowedKeywords.some((kw) => nameLower.includes(kw))) {
              match = true;
              break;
            }
            curr = curr.parent;
          }

          mesh.visible = match;
          if (match) {
            matchedMeshes.push(mesh);
            if (mesh.material) {
              const mat = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mat.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
                  m.clippingPlanes = this.isCutaway ? [this.cutawayPlane] : [];
                  m.clipShadows = true;
                }
              });
            }
          }
        }
      });
    });

    return matchedMeshes;
  }

  /* ------------------------------------------------------------ */
  /* 🫀 1. Clinical 3D Heart (Z-Anatomy Mesh Isolation)          */
  /* ------------------------------------------------------------ */
  private buildClinicalHeart() {
    this.isolateOrganMeshes('cardiovascular', [
      'heart',
      'arteries_of_heart',
      'valvular',
      'aorta',
      'pulmonary_trunk',
    ]);

    // Find Heartg node for lub-dub pulse animation
    const cardio = this.systemModels.get('cardiovascular');
    if (cardio) {
      cardio.traverse((child) => {
        if ((child.name || '').toLowerCase().includes('heartg')) {
          this.heartNode = child;
        }
      });
    }

    this.createPin({
      id: 'lad-artery',
      name: 'Left Anterior Descending (LAD)',
      category: 'Coronary Perfusion',
      position: new THREE.Vector3(0.02, 0.41, 0.06),
      description: 'The anterior interventricular artery supplies 50% of left ventricular myocardium.',
    });

    this.createPin({
      id: 'aortic-arch',
      name: 'Ascending Aorta & Arch',
      category: 'Systemic Outflow',
      position: new THREE.Vector3(0.01, 0.49, 0.04),
      description: 'Receives stroke volume (~70 mL) during peak left ventricular systole at 120 mmHg.',
    });

    this.createPin({
      id: 'right-atrium',
      name: 'Right Atrium & SA Node',
      category: 'Pacemaker Axis',
      position: new THREE.Vector3(-0.03, 0.43, 0.05),
      description: 'Sinoatrial node generates spontaneous intrinsic action potentials at 60–100 bpm.',
    });

    this.createPin({
      id: 'left-ventricle',
      name: 'Left Ventricle Myocardium',
      category: 'Pumping Chamber',
      position: new THREE.Vector3(0.04, 0.40, 0.04),
      description: 'Thick muscular wall generates high hydrostatic pressure for systemic circulation.',
    });

    this.targetLookAt.set(0.02, 0.43, 0.02);
    this.targetCamPos.set(0.02, 0.43, 0.38);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧠 2. Clinical 3D Brain (Z-Anatomy Mesh Isolation)           */
  /* ------------------------------------------------------------ */
  private buildClinicalBrain() {
    this.isolateOrganMeshes('nervous', ['brain']);

    // Enable synaptic glow on cerebral cortex
    const nervous = this.systemModels.get('nervous');
    if (nervous) {
      nervous.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (
            mesh.material instanceof THREE.MeshStandardMaterial ||
            mesh.material instanceof THREE.MeshPhysicalMaterial
          ) {
            mesh.material.emissive = new THREE.Color(0x14b8a6);
            mesh.material.emissiveIntensity = 0.35;
            this.brainGlowMat = mesh.material as THREE.MeshPhysicalMaterial;
          }
        }
      });
    }

    this.createPin({
      id: 'frontal-cortex',
      name: 'Prefrontal Cortex',
      category: 'Executive Function',
      position: new THREE.Vector3(0.0, 0.78, 0.06),
      description: 'Orchestrates working memory, abstract reasoning, decision planning, and personality moderation.',
    });

    this.createPin({
      id: 'occipital-lobe',
      name: 'Occipital Lobe (V1 / Brodmann 17)',
      category: 'Sensory Vision',
      position: new THREE.Vector3(0.0, 0.76, -0.08),
      description: 'Primary visual cortex processing retinotopic orientation, spatial frequency, and color signals.',
    });

    this.createPin({
      id: 'cerebellum',
      name: 'Cerebellar Hemispheres',
      category: 'Motor Coordination',
      position: new THREE.Vector3(0.0, 0.71, -0.05),
      description: 'Contains >50% of total brain neurons; calibrates micro-timing and vestibular equilibrium.',
    });

    this.createPin({
      id: 'brainstem-pons',
      name: 'Brainstem & Pons',
      category: 'Autonomic Vital Axis',
      position: new THREE.Vector3(0.0, 0.69, -0.01),
      description: 'Houses cardiorespiratory pacemaker nuclei, ascending reticular activating system, and cranial nerves.',
    });

    this.targetLookAt.set(0.0, 0.75, -0.01);
    this.targetCamPos.set(0.0, 0.76, 0.42);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🫁 3. Clinical 3D Lungs & Airway (Z-Anatomy Mesh Isolation)  */
  /* ------------------------------------------------------------ */
  private buildClinicalLungs() {
    this.isolateOrganMeshes('organs', ['lung', 'trachea', 'bronch']);

    // Find Lungsg node for respiration breathing animation
    const organs = this.systemModels.get('organs');
    if (organs) {
      organs.traverse((child) => {
        if ((child.name || '').toLowerCase().includes('lungsg')) {
          this.lungsNode = child;
        }
      });
    }

    this.createPin({
      id: 'trachea-carina',
      name: 'Trachea & Carina Bifurcation',
      category: 'Airway Conduction',
      position: new THREE.Vector3(0.0, 0.52, 0.02),
      description: 'Reinforced by 16–20 hyaline cartilage rings, bifurcates into primary left and right bronchi at T4/T5.',
    });

    this.createPin({
      id: 'right-superior-lobe',
      name: 'Right Superior Lobe',
      category: 'Pulmonary Ventilation',
      position: new THREE.Vector3(-0.06, 0.46, 0.04),
      description: 'Tri-lobar right lung provides 55% of alveolar gas diffusion capacity across 300 million alveoli.',
    });

    this.createPin({
      id: 'left-cardiac-notch',
      name: 'Left Lung & Cardiac Notch',
      category: 'Pulmonary Anatomy',
      position: new THREE.Vector3(0.06, 0.41, 0.05),
      description: 'Accommodates the pericardial cardiac apex; features lingular segment analogous to middle lobe.',
    });

    this.createPin({
      id: 'diaphragmatic-base',
      name: 'Diaphragmatic Base',
      category: 'Inspiratory Mechanics',
      position: new THREE.Vector3(-0.05, 0.35, 0.03),
      description: 'Phrenic-nerve driven diaphragmatic descent increases thoracic volume, generating -8 cmH2O pleural pressure.',
    });

    this.targetLookAt.set(0.0, 0.43, 0.01);
    this.targetCamPos.set(0.0, 0.43, 0.62);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧪 4. Clinical 3D Liver & Biliary (Z-Anatomy Mesh Isolation) */
  /* ------------------------------------------------------------ */
  private buildClinicalLiver() {
    this.isolateOrganMeshes('organs', ['liver', 'gallbladder', 'biliary', 'cystic']);

    this.createPin({
      id: 'right-hepatic-lobe',
      name: 'Right Hepatic Lobe (Couinaud V–VIII)',
      category: 'Metabolic Clearance',
      position: new THREE.Vector3(-0.06, 0.31, 0.04),
      description: 'Comprises 65% of hepatic parenchyma; detoxifies portal venous blood via cytochrome P450 monooxygenases.',
    });

    this.createPin({
      id: 'left-hepatic-lobe',
      name: 'Left Hepatic Lobe (Segments II–IV)',
      category: 'Glycogen Synthesis',
      position: new THREE.Vector3(0.05, 0.31, 0.04),
      description: 'Synthesizes albumin, prothrombin, and clotting factors I, II, VII, IX, and X.',
    });

    this.createPin({
      id: 'gallbladder-fundus',
      name: 'Gallbladder & Cystic Duct',
      category: 'Biliary Storage',
      position: new THREE.Vector3(-0.03, 0.26, 0.05),
      description: 'Concentrates hepatic bile 5- to 10-fold; contracts in response to cholecystokinin (CCK) post-lipids.',
    });

    this.createPin({
      id: 'porta-hepatis',
      name: 'Porta Hepatis & Falciform',
      category: 'Vascular Gateway',
      position: new THREE.Vector3(0.0, 0.32, 0.05),
      description: 'Gateway for hepatic portal vein (75% blood inflow), hepatic artery proper, and common hepatic duct.',
    });

    this.targetLookAt.set(-0.01, 0.30, 0.02);
    this.targetCamPos.set(-0.01, 0.30, 0.50);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧽 5. Clinical 3D Kidneys & Urinary (Z-Anatomy Mesh Isolation)*/
  /* ------------------------------------------------------------ */
  private buildClinicalKidneys() {
    this.isolateOrganMeshes('organs', ['kidney', 'renal', 'ureter', 'bladder']);

    this.createPin({
      id: 'right-renal-cortex',
      name: 'Right Renal Cortex & Glomeruli',
      category: 'Glomerular Filtration',
      position: new THREE.Vector3(-0.07, 0.29, -0.01),
      description: 'Contains ~1,000,000 nephrons filtering 180 liters of plasma daily at a GFR of 125 mL/min.',
    });

    this.createPin({
      id: 'left-renal-hilum',
      name: 'Left Renal Hilum & Pelvis',
      category: 'Renal Vasculature',
      position: new THREE.Vector3(0.07, 0.29, -0.01),
      description: 'Site of renal artery entry and renal vein drainage, delivering 20% of resting cardiac output.',
    });

    this.createPin({
      id: 'ureters-bilateral',
      name: 'Retroperitoneal Ureters',
      category: 'Urine Peristalsis',
      position: new THREE.Vector3(0.04, 0.21, 0.0),
      description: 'Smooth muscle peristaltic waves propagate concentrated urine down into the trigone.',
    });

    this.createPin({
      id: 'urinary-bladder',
      name: 'Urinary Bladder & Detrusor',
      category: 'Storage & Micturition',
      position: new THREE.Vector3(0.0, 0.12, 0.04),
      description: 'Detrusor muscle accommodates 400–600 mL under low intravesical pressure before parasympathetic voiding.',
    });

    this.targetLookAt.set(0.0, 0.23, -0.01);
    this.targetCamPos.set(0.0, 0.23, 0.48);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🥨 6. Clinical 3D Digestive System (Z-Anatomy Mesh Isolation) */
  /* ------------------------------------------------------------ */
  private buildClinicalDigestive() {
    this.isolateOrganMeshes('organs', ['stomach', 'pancreas', 'duodenum']);

    this.createPin({
      id: 'gastric-fundus',
      name: 'Gastric Fundus & Greater Curvature',
      category: 'Acid & Enzymatic Churn',
      position: new THREE.Vector3(0.06, 0.32, 0.05),
      description: 'Parietal cells secrete HCl (pH 1.5–2.0) and intrinsic factor; chief cells synthesize pepsinogen.',
    });

    this.createPin({
      id: 'pyloric-sphincter',
      name: 'Pyloric Antrum & Sphincter',
      category: 'Gastric Emptying',
      position: new THREE.Vector3(-0.01, 0.28, 0.05),
      description: 'Muscular sphincter metering acidic chyme delivery into the duodenum at 2–3 mL per peristaltic wave.',
    });

    this.createPin({
      id: 'pancreatic-parenchyma',
      name: 'Pancreas (Endocrine & Exocrine)',
      category: 'Enzyme & Hormone Axis',
      position: new THREE.Vector3(0.02, 0.29, 0.02),
      description: 'Acinar cells secrete trypsinogen, lipase, and amylase; Islets of Langerhans secrete insulin and glucagon.',
    });

    this.createPin({
      id: 'duodenal-c-loop',
      name: 'Duodenum (C-Loop)',
      category: 'Bicarbonate Neutralization',
      position: new THREE.Vector3(-0.03, 0.28, 0.04),
      description: 'Receives bile and pancreatic juices via the Ampulla of Vater (Sphincter of Oddi) to neutralize gastric acid.',
    });

    this.targetLookAt.set(0.04, 0.30, 0.04);
    this.targetCamPos.set(0.04, 0.30, 0.45);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🦴 7. Isolated Skeleton & 8. Vascular                          */
  /* ------------------------------------------------------------ */
  private buildIsolatedSkeleton() {
    this.fullBodyGroup.visible = true;
    (Object.keys(this.systemVisibilities)).forEach((k) => {
      this.setSystemVisibility(k, k === 'skeleton');
    });
    this.targetLookAt.set(0, 0, 0);
    this.targetCamPos.set(0, 0.1, 2.7);
    this.isLerpingCamera = true;
  }

  private buildIsolatedMuscular() {
    this.fullBodyGroup.visible = true;
    (Object.keys(this.systemVisibilities)).forEach((k) => {
      this.setSystemVisibility(k, k === 'muscular' || k === 'skeleton');
      if (k === 'skeleton') this.setSystemOpacity(k, 0.25);
      if (k === 'muscular') this.setSystemOpacity(k, 0.95);
    });
    this.targetLookAt.set(0, 0, 0);
    this.targetCamPos.set(0, 0.1, 2.7);
    this.isLerpingCamera = true;
  }

  private buildIsolatedVascular() {
    this.fullBodyGroup.visible = true;
    (Object.keys(this.systemVisibilities)).forEach((k) => {
      this.setSystemVisibility(k, k === 'cardiovascular' || k === 'skeleton');
      if (k === 'skeleton') this.setSystemOpacity(k, 0.15);
    });
    this.targetLookAt.set(0, 0.2, 0);
    this.targetCamPos.set(0, 0.25, 2.0);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* Pins / Annotation Callouts                                   */
  /* ------------------------------------------------------------ */
  private createPin(pin: AnatomicalPin) {
    this.activePins.push(pin);

    // 3D Visual Pin: glowing sphere with pulse ring
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(pin.position);

    const coreGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.userData.pin = pin;
    pinGroup.add(core);

    const ringGeo = new THREE.RingGeometry(0.024, 0.03, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    pinGroup.add(ring);

    this.pinsGroup.add(pinGroup);
    this.pinSprites.push({ pin, obj: pinGroup });
  }

  /* ------------------------------------------------------------ */
  /* Controls & Toggles                                           */
  /* ------------------------------------------------------------ */
  setRenderMode(mode: MedicalRenderMode) {
    this.renderMode = mode;
    // Reapply to all models
    (Object.keys(this.systemVisibilities)).forEach((sysId) => {
      this.applyFullBodyMaterials(sysId);
    });
    // Rebuild active organ view to apply new shaders
    if (this.currentView !== 'fullbody' && this.currentView !== 'skeleton' && this.currentView !== 'vascular') {
      this.switchToView(this.currentView);
    }
  }

  setBeating(active: boolean) {
    this.isBeating = active;
  }

  setBreathing(active: boolean) {
    this.isBreathing = active;
  }

  setCutaway(active: boolean) {
    this.isCutaway = active;
    if (this.currentView === 'heart' || this.currentView === 'lungs') {
      this.switchToView(this.currentView);
    }
  }

  setSystemVisibility(sysId: string, visible: boolean) {
    this.systemVisibilities[sysId] = visible;
    this.applyFullBodyMaterials(sysId);
  }

  setSystemOpacity(sysId: string, opacity: number) {
    this.systemOpacities[sysId] = opacity;
    this.applyFullBodyMaterials(sysId);
  }

  resetCamera() {
    if (this.currentView === 'fullbody') {
      this.targetLookAt.set(0, 0, 0);
      this.targetCamPos.set(0, 0.1, 2.7);
    } else {
      this.switchToView(this.currentView);
    }
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* Raycasting & Click Events                                    */
  /* ------------------------------------------------------------ */
  private handlePointerUp = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    const hitPins = raycaster.intersectObjects(this.pinsGroup.children, true);
    if (hitPins.length > 0) {
      let topObj: THREE.Object3D | null = hitPins[0].object;
      while (topObj && !topObj.userData.pin && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData.pin && this.onPinClick) {
        this.onPinClick(topObj.userData.pin as AnatomicalPin);
      }
    }
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
  /* Tick Loop: Dual-Phase Lub-Dub Heartbeat & Breathing Cycle     */
  /* ------------------------------------------------------------ */
  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);

    const time = this.clock.getElapsedTime();

    // 1. Dual-Phase Lub-Dub Cardiac Cycle Animation
    if (this.isBeating && this.heartNode) {
      const beatFreq = 1.2; // 72 bpm
      const cycle = (time * beatFreq) % 1.0;
      let scale = 1.0;

      // Systole: rapid contraction (Lub) followed by secondary recoil (Dub)
      if (cycle < 0.15) {
        scale = 1.0 + Math.sin((cycle / 0.15) * Math.PI) * 0.08;
      } else if (cycle > 0.22 && cycle < 0.38) {
        scale = 1.0 + Math.sin(((cycle - 0.22) / 0.16) * Math.PI) * 0.05;
      }

      // Base scale for Heartg in Z-Anatomy is 5.0
      this.heartNode.scale.set(5.0 * scale, 5.0 * scale * 1.02, 5.0 * scale);
    }

    // 2. Respiration Breathing Cycle Animation
    if (this.isBreathing && this.lungsNode) {
      const breathPhase = Math.sin(time * 1.4); // 14 breaths / min
      const expansion = 1.0 + (breathPhase + 1.0) * 0.035;
      // Base scale for Lungsg in Z-Anatomy is 0.8
      this.lungsNode.scale.set(0.8 * expansion, 0.8 * expansion * 1.02, 0.8 * expansion);
    }

    // 3. Brain Synaptic Pulse Glow
    if (this.brainGlowMat) {
      this.brainGlowMat.emissiveIntensity = 0.25 + Math.sin(time * 3.5) * 0.15;
    }

    // 4. Billboard Pins to face Camera
    this.pinSprites.forEach(({ obj }) => {
      obj.quaternion.copy(this.camera.quaternion);
    });

    // 5. Smooth Camera Lerp
    if (this.isLerpingCamera) {
      this.controls.target.lerp(this.targetLookAt, 0.07);
      this.camera.position.lerp(this.targetCamPos, 0.07);

      if (
        this.controls.target.distanceTo(this.targetLookAt) < 0.005 &&
        this.camera.position.distanceTo(this.targetCamPos) < 0.005
      ) {
        this.isLerpingCamera = false;
      }
    }

    this.controls.update();
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
