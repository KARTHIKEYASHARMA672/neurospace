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
  private heartVentriclesMesh: THREE.Mesh | null = null;
  private heartAtriaMesh: THREE.Mesh | null = null;
  private lungsMeshGroup: THREE.Group | null = null;
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

    // Hide full body and display isolated organ model
    this.fullBodyGroup.visible = false;
    this.controls.autoRotate = false;

    switch (view) {
      case 'heart':
        this.buildHighDetailHeart();
        break;
      case 'brain':
        this.buildHighDetailBrain();
        break;
      case 'lungs':
        this.buildHighDetailLungs();
        break;
      case 'liver':
        this.buildHighDetailLiver();
        break;
      case 'kidneys':
        this.buildHighDetailKidneys();
        break;
      case 'stomach':
        this.buildHighDetailDigestive();
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
    this.heartVentriclesMesh = null;
    this.heartAtriaMesh = null;
    this.lungsMeshGroup = null;
    this.brainGlowMat = null;
  }

  /* ------------------------------------------------------------ */
  /* 🫀 1. High-Detail 3D Heart Builder                            */
  /* ------------------------------------------------------------ */
  private buildHighDetailHeart() {
    const group = new THREE.Group();

    // 1. Left & Right Ventricles (Conical myocardial muscular body)
    const ventriclesGeo = new THREE.SphereGeometry(0.24, 48, 48);
    // Sculpt heart apex & conical distortion
    const pos = ventriclesGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (y < 0) {
        // Taper towards apex
        const taper = 1.0 + y * 1.5;
        x *= Math.max(0.2, taper);
        z *= Math.max(0.2, taper);
        x += y * 0.12; // Point slightly leftward
      } else {
        // Sulcus groove between ventricles
        if (Math.abs(x) < 0.05 && z > 0) {
          z *= 0.88;
        }
      }
      pos.setXYZ(i, x, y * 1.35, z);
    }
    ventriclesGeo.computeVertexNormals();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b, // Deep rich myocardial crimson
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      clippingPlanes: this.isCutaway ? [this.cutawayPlane] : [],
      clipShadows: true,
    });
    const ventricles = new THREE.Mesh(ventriclesGeo, heartMat);
    ventricles.position.set(0, -0.05, 0);
    group.add(ventricles);
    this.heartVentriclesMesh = ventricles;

    // 2. Left & Right Atria (Superior thin-walled chambers)
    const atriaGeo = new THREE.SphereGeometry(0.16, 36, 36);
    const atriaMat = new THREE.MeshPhysicalMaterial({
      color: 0x7f1d1d,
      roughness: 0.45,
      clearcoat: 0.5,
      clippingPlanes: this.isCutaway ? [this.cutawayPlane] : [],
    });
    const rightAtrium = new THREE.Mesh(atriaGeo, atriaMat);
    rightAtrium.scale.set(0.9, 0.8, 0.9);
    rightAtrium.position.set(-0.14, 0.18, 0.02);
    group.add(rightAtrium);

    const leftAtrium = new THREE.Mesh(atriaGeo, atriaMat);
    leftAtrium.scale.set(0.85, 0.75, 0.85);
    leftAtrium.position.set(0.14, 0.19, -0.04);
    group.add(leftAtrium);

    // 3. Ascending Aorta & Great Aortic Arch with 3 Carotid Branches
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.12, 0.04),
      new THREE.Vector3(0.04, 0.32, 0.02),
      new THREE.Vector3(-0.02, 0.42, -0.02),
      new THREE.Vector3(-0.08, 0.38, -0.06),
      new THREE.Vector3(-0.09, 0.12, -0.09),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.048, 24, false);
    const aortaMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626, // Bright oxygenated arterial red
      roughness: 0.3,
      clearcoat: 0.85,
    });
    const aorta = new THREE.Mesh(aortaGeo, aortaMat);
    group.add(aorta);

    // 3 Arch Branches (Brachiocephalic, Left Common Carotid, Left Subclavian)
    [-0.01, 0.02, 0.05].forEach((offset, idx) => {
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(offset, 0.41, -0.01),
        new THREE.Vector3(offset * 1.3, 0.52 + idx * 0.02, -0.01),
      ]);
      const branchGeo = new THREE.TubeGeometry(branchCurve, 16, 0.014, 16, false);
      group.add(new THREE.Mesh(branchGeo, aortaMat));
    });

    // 4. Pulmonary Trunk & Bifurcation (Crosses in front of aorta)
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.12, 0.08),
      new THREE.Vector3(-0.02, 0.28, 0.06),
      new THREE.Vector3(0.02, 0.32, -0.02),
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 24, 0.044, 20, false);
    const pulmMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // Blue deoxygenated pulmonary blood
      roughness: 0.35,
      clearcoat: 0.7,
    });
    group.add(new THREE.Mesh(pulmGeo, pulmMat));

    // Left and Right pulmonary branches
    const pLeftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.32, -0.02),
      new THREE.Vector3(0.18, 0.30, -0.06),
    ]);
    const pRightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.32, -0.02),
      new THREE.Vector3(-0.16, 0.31, -0.06),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(pLeftCurve, 16, 0.024, 16, false), pulmMat));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(pRightCurve, 16, 0.024, 16, false), pulmMat));

    // 5. Superior & Inferior Vena Cava (Large venous channels entering Right Atrium)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.44, 0.01),
      new THREE.Vector3(-0.16, 0.18, 0.01),
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 16, 0.038, 20, false);
    group.add(new THREE.Mesh(svcGeo, pulmMat));

    const ivcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 0.12, 0.01),
      new THREE.Vector3(-0.12, -0.22, 0.01),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(ivcCurve, 16, 0.034, 18, false), pulmMat));

    // 6. Coronary Arteries (Left Anterior Descending & Circumflex Arteries)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.14, 0.22),
      new THREE.Vector3(0.03, 0.02, 0.24),
      new THREE.Vector3(0.05, -0.12, 0.20),
      new THREE.Vector3(0.08, -0.26, 0.11),
      new THREE.Vector3(0.06, -0.34, 0.04),
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 32, 0.009, 12, false);
    const ladMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.1,
    });
    group.add(new THREE.Mesh(ladGeo, ladMat));

    // Right Coronary Artery (RCA)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.14, 0.18),
      new THREE.Vector3(-0.12, 0.06, 0.19),
      new THREE.Vector3(-0.14, -0.06, 0.16),
      new THREE.Vector3(-0.12, -0.18, 0.12),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 24, 0.008, 12, false), ladMat));

    // 7. Interior Cutaway Details: Papillary Muscles & Mitral / Tricuspid Valves
    if (this.isCutaway) {
      const valveRingGeo = new THREE.TorusGeometry(0.07, 0.01, 16, 32);
      const valveMat = new THREE.MeshPhysicalMaterial({
        color: 0xfef08a,
        roughness: 0.2,
        clearcoat: 0.9,
      });
      const valveMesh = new THREE.Mesh(valveRingGeo, valveMat);
      valveMesh.rotation.x = Math.PI / 2;
      valveMesh.position.set(0.06, 0.06, 0.0);
      group.add(valveMesh);

      // Papillary muscular columns
      const papGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.14, 16);
      const papMesh = new THREE.Mesh(papGeo, heartMat);
      papMesh.position.set(0.06, -0.12, 0.0);
      group.add(papMesh);
    }

    this.organFocusGroup.add(group);

    // Anatomical 3D Pins
    this.createPin({
      id: 'aorta',
      name: 'Aortic Arch',
      category: 'Arterial Conduit',
      position: new THREE.Vector3(0.0, 0.44, 0.0),
      description: 'Pumps 5 liters of oxygenated blood per minute under 120 mmHg pressure to the systemic circulation.',
    });

    this.createPin({
      id: 'left-ventricle',
      name: 'Left Ventricle',
      category: 'Systemic Myocardial Pump',
      position: new THREE.Vector3(0.08, -0.16, 0.22),
      description: 'Thickest chamber (10–12 mm wall) generating peak systolic pressure to drive systemic perfusion.',
    });

    this.createPin({
      id: 'right-atrium',
      name: 'Right Atrium & SA Node',
      category: 'Cardiac Pacemaker',
      position: new THREE.Vector3(-0.16, 0.20, 0.06),
      description: 'Receives deoxygenated venous return from venae cavae; houses the Sinoatrial (SA) natural pacemaker pacing at ~72 bpm.',
    });

    this.createPin({
      id: 'lad-artery',
      name: 'Left Anterior Descending (LAD)',
      category: 'Coronary Perfusion',
      position: new THREE.Vector3(0.05, -0.06, 0.24),
      description: 'The "widow-maker" artery supplying anterior ventricular wall and 50% of left ventricular myocardium.',
    });

    this.createPin({
      id: 'pulmonary-trunk',
      name: 'Pulmonary Trunk',
      category: 'Pulmonary Arterial Flow',
      position: new THREE.Vector3(-0.02, 0.32, 0.06),
      description: 'Directs deoxygenated venous blood from right ventricle toward lungs at 25 mmHg systolic.',
    });

    // Camera view framing
    this.targetLookAt.set(0, 0.02, 0);
    this.targetCamPos.set(0, 0.08, 0.95);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧠 2. High-Detail 3D Brain Builder                            */
  /* ------------------------------------------------------------ */
  private buildHighDetailBrain() {
    const group = new THREE.Group();

    // 1. Bilateral Cerebral Hemispheres (Left & Right) with Sulcal Fissures
    [-0.13, 0.13].forEach((xOffset) => {
      const hemiGeo = new THREE.SphereGeometry(0.26, 48, 48);
      const pos = hemiGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        // Procedural gyri & sulci wrinkles
        const noise =
          Math.sin(x * 24) * Math.cos(y * 22) * Math.sin(z * 24) * 0.014 +
          Math.sin(y * 42) * Math.cos(z * 40) * 0.008;

        // Shape into natural cerebral ellipsoid
        x *= 0.85;
        y *= 0.95;
        z *= 1.25;

        // Flatten medial hemispheric fissure
        if ((xOffset < 0 && x > 0) || (xOffset > 0 && x < 0)) {
          x *= 0.55;
        }

        pos.setXYZ(i, x + noise, y + noise, z + noise);
      }
      hemiGeo.computeVertexNormals();

      const hemiMat = new THREE.MeshPhysicalMaterial({
        color: 0xede3d0, // Warm cortical ivory
        roughness: 0.35,
        metalness: 0.08,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
      });
      const hemi = new THREE.Mesh(hemiGeo, hemiMat);
      hemi.position.set(xOffset, 0.06, 0.0);
      group.add(hemi);
    });

    // 2. Cerebellum (Posterior-inferior coordination arbor)
    const cerebGeo = new THREE.SphereGeometry(0.15, 36, 36);
    const cPos = cerebGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      let x = cPos.getX(i) * 1.3;
      let y = cPos.getY(i) * 0.75;
      let z = cPos.getZ(i) * 0.9;
      // Horizontal folia lines
      const folia = Math.sin(y * 70) * 0.007;
      cPos.setXYZ(i, x + folia, y, z + folia);
    }
    cerebGeo.computeVertexNormals();
    const cerebMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfd4be,
      roughness: 0.45,
      clearcoat: 0.4,
    });
    const cereb = new THREE.Mesh(cerebGeo, cerebMat);
    cereb.position.set(0, -0.16, -0.16);
    group.add(cereb);

    // 3. Brainstem (Pons & Medulla descending to spinal axis)
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.02, 0.0),
      new THREE.Vector3(0, -0.14, -0.02),
      new THREE.Vector3(0, -0.32, -0.05),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.052, 20, false);
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5eee0,
      roughness: 0.3,
      clearcoat: 0.8,
    });
    group.add(new THREE.Mesh(stemGeo, stemMat));

    // 4. Synaptic Neural Glow Halo
    const glowGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const glowMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.12,
      roughness: 0.1,
    });
    this.brainGlowMat = glowMat;
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    this.organFocusGroup.add(group);

    // Anatomical Pins
    this.createPin({
      id: 'prefrontal',
      name: 'Prefrontal Cortex',
      category: 'Executive Function',
      position: new THREE.Vector3(0, 0.18, 0.32),
      description: 'Governs future planning, impulse inhibition, complex working memory, and social decision-making.',
    });

    this.createPin({
      id: 'motor-strip',
      name: 'Primary Motor Cortex (M1)',
      category: 'Voluntary Movement',
      position: new THREE.Vector3(0.12, 0.28, 0.04),
      description: 'Precentral gyrus containing Betz pyramidal neurons that send corticospinal motor commands to skeletal muscles.',
    });

    this.createPin({
      id: 'visual-cortex',
      name: 'Primary Visual Cortex (V1)',
      category: 'Vision & Retinotopy',
      position: new THREE.Vector3(0, 0.06, -0.34),
      description: 'Brodmann area 17 along calcarine sulcus mapping contralateral visual fields into conscious sight.',
    });

    this.createPin({
      id: 'cerebellum',
      name: 'Cerebellum',
      category: 'Motor Precision & Timing',
      position: new THREE.Vector3(0, -0.16, -0.28),
      description: 'Contains 69 billion neurons and Purkinje cells that compute real-time motor error correction at 50 Hz.',
    });

    this.targetLookAt.set(0, 0.04, 0);
    this.targetCamPos.set(0, 0.12, 1.05);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🫁 3. High-Detail 3D Lungs & Airway Builder                   */
  /* ------------------------------------------------------------ */
  private buildHighDetailLungs() {
    const group = new THREE.Group();

    // 1. Trachea with Cartilaginous C-Rings
    const tracheaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.46, 0),
      new THREE.Vector3(0, 0.16, 0),
    ]);
    const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 20, 0.038, 20, false);
    const tracheaMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      clearcoat: 0.8,
    });
    group.add(new THREE.Mesh(tracheaGeo, tracheaMat));

    // Cartilage rings
    for (let y = 0.2; y <= 0.44; y += 0.03) {
      const ringGeo = new THREE.TorusGeometry(0.04, 0.006, 12, 24);
      const ringMesh = new THREE.Mesh(ringGeo, tracheaMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, y, 0);
      group.add(ringMesh);
    }

    // 2. Primary Bronchial Bifurcation (Carina)
    const rightBronchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(-0.08, 0.08, -0.02),
    ]);
    const leftBronchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(0.11, 0.09, -0.02),
    ]);
    const bronchMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.3 });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(rightBronchCurve, 16, 0.022, 16, false), bronchMat));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(leftBronchCurve, 16, 0.02, 16, false), bronchMat));

    // 3. Right Lung (3 Lobes: Superior, Middle, Inferior)
    const rightLungGeo = new THREE.SphereGeometry(0.26, 36, 36);
    const rPos = rightLungGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      let x = rPos.getX(i) * 0.85;
      let y = rPos.getY(i) * 1.5;
      let z = rPos.getZ(i) * 0.95;
      // Flatten medial mediastinal side
      if (x > 0) x *= 0.65;
      rPos.setXYZ(i, x, y, z);
    }
    rightLungGeo.computeVertexNormals();

    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0xbe7c72, // Warm pulmonary tissue pink/red
      roughness: 0.45,
      clearcoat: 0.6,
      clippingPlanes: this.isCutaway ? [this.cutawayPlane] : [],
    });
    const rightLung = new THREE.Mesh(rightLungGeo, lungMat);
    rightLung.position.set(-0.21, 0.02, 0);
    group.add(rightLung);

    // 4. Left Lung (2 Lobes with Cardiac Notch)
    const leftLungGeo = new THREE.SphereGeometry(0.24, 36, 36);
    const lPos = leftLungGeo.attributes.position;
    for (let i = 0; i < lPos.count; i++) {
      let x = lPos.getX(i) * 0.8;
      let y = lPos.getY(i) * 1.45;
      let z = lPos.getZ(i) * 0.95;
      // Medial cardiac notch indentation
      if (x < 0 && y < 0) {
        x *= 0.45;
        z *= 0.75;
      }
      lPos.setXYZ(i, x, y, z);
    }
    leftLungGeo.computeVertexNormals();
    const leftLung = new THREE.Mesh(leftLungGeo, lungMat);
    leftLung.position.set(0.21, 0.02, 0);
    group.add(leftLung);

    this.lungsMeshGroup = group;
    this.organFocusGroup.add(group);

    // Pins
    this.createPin({
      id: 'carina',
      name: 'Carina & Primary Bronchi',
      category: 'Airway Conduit',
      position: new THREE.Vector3(0, 0.16, 0.06),
      description: 'Bifurcation point of the trachea heavily lined with cough reflex stretch receptors.',
    });

    this.createPin({
      id: 'right-lung',
      name: 'Right Lung (3 Lobes)',
      category: 'Pulmonary Parenchyma',
      position: new THREE.Vector3(-0.28, 0.08, 0.16),
      description: 'Contains Superior, Middle, and Inferior lobes; receives ~55% of pulmonary ventilation.',
    });

    this.createPin({
      id: 'cardiac-notch',
      name: 'Left Lung & Cardiac Notch',
      category: 'Pulmonary Anatomy',
      position: new THREE.Vector3(0.18, -0.06, 0.16),
      description: 'Anatomical indentation accommodating the apex of the heart; divided by oblique fissure.',
    });

    this.targetLookAt.set(0, 0.1, 0);
    this.targetCamPos.set(0, 0.15, 1.25);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧪 4. High-Detail 3D Liver & Gallbladder Builder              */
  /* ------------------------------------------------------------ */
  private buildHighDetailLiver() {
    const group = new THREE.Group();

    // 1. Liver Parenchyma (Large Wedge Shape with Right & Left Lobes)
    const liverGeo = new THREE.SphereGeometry(0.28, 48, 48);
    const pos = liverGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Wedge shaped taper (thick right lobe, thin left wedge)
      x *= 1.4;
      y *= 0.85;
      z *= 0.95;

      if (x > 0) {
        // Left lobe taper
        y *= 1.0 - (x * 0.5);
        z *= 1.0 - (x * 0.4);
      }
      if (y < 0) {
        // Flatten visceral inferior surface
        y *= 0.6;
      }
      pos.setXYZ(i, x, y, z);
    }
    liverGeo.computeVertexNormals();

    const liverMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c2d12, // Rich dark hepatic reddish-brown
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.75,
      clearcoatRoughness: 0.2,
    });
    const liverMesh = new THREE.Mesh(liverGeo, liverMat);
    group.add(liverMesh);

    // 2. Emerald Green Gallbladder
    const gallGeo = new THREE.SphereGeometry(0.06, 24, 24);
    const gPos = gallGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      gPos.setXYZ(i, gPos.getX(i) * 0.7, gPos.getY(i) * 1.5, gPos.getZ(i) * 0.7);
    }
    gallGeo.computeVertexNormals();
    const gallMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d, // Vibrant emerald bile green
      roughness: 0.25,
      clearcoat: 0.9,
    });
    const gallbladder = new THREE.Mesh(gallGeo, gallMat);
    gallbladder.position.set(-0.08, -0.14, 0.14);
    gallbladder.rotation.z = 0.35;
    group.add(gallbladder);

    // 3. Hepatic Portal Vein & Hepatic Artery
    const portalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, -0.32, 0.04),
      new THREE.Vector3(-0.01, -0.12, 0.06),
    ]);
    const portalGeo = new THREE.TubeGeometry(portalCurve, 16, 0.025, 16, false);
    const portalMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, roughness: 0.3 });
    group.add(new THREE.Mesh(portalGeo, portalMat));

    const arteryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, -0.30, 0.06),
      new THREE.Vector3(0.01, -0.11, 0.07),
    ]);
    const arteryMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, roughness: 0.3 });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(arteryCurve, 16, 0.016, 16, false), arteryMat));

    this.organFocusGroup.add(group);

    // Pins
    this.createPin({
      id: 'right-lobe',
      name: 'Right Hepatic Lobe',
      category: 'Metabolic Parenchyma',
      position: new THREE.Vector3(-0.18, 0.08, 0.16),
      description: 'Houses Couinaud segments V, VI, VII, and VIII, executing bulk drug detoxification and glycogen storage.',
    });

    this.createPin({
      id: 'gallbladder',
      name: 'Gallbladder & Cystic Duct',
      category: 'Biliary System',
      position: new THREE.Vector3(-0.08, -0.16, 0.18),
      description: 'Stores and concentrates bile 10-fold, contracting on cholecystokinin (CCK) stimulation after fatty meals.',
    });

    this.createPin({
      id: 'porta-hepatis',
      name: 'Porta Hepatis (Portal Triad)',
      category: 'Vascular Inflow Corridor',
      position: new THREE.Vector3(0, -0.18, 0.08),
      description: 'Conduit entering liver holding Portal Vein (75% blood), Hepatic Artery (25% blood), and Bile Duct.',
    });

    this.targetLookAt.set(0, 0, 0);
    this.targetCamPos.set(0, 0.05, 1.05);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🧽 5. High-Detail 3D Kidneys & Urinary System                 */
  /* ------------------------------------------------------------ */
  private buildHighDetailKidneys() {
    const group = new THREE.Group();

    // 1. Bilateral Bean-Shaped Kidneys (Left & Right)
    [-0.22, 0.22].forEach((xOffset, idx) => {
      const kidneyGeo = new THREE.SphereGeometry(0.14, 36, 36);
      const kPos = kidneyGeo.attributes.position;
      for (let i = 0; i < kPos.count; i++) {
        let x = kPos.getX(i);
        let y = kPos.getY(i) * 1.5;
        let z = kPos.getZ(i) * 0.75;
        // Medial hilum concavity (bean indentation)
        if ((xOffset < 0 && x > 0) || (xOffset > 0 && x < 0)) {
          x *= 0.45;
        }
        kPos.setXYZ(i, x, y, z);
      }
      kidneyGeo.computeVertexNormals();

      const kidneyMat = new THREE.MeshPhysicalMaterial({
        color: 0x831843, // Rich cortical maroon
        roughness: 0.35,
        clearcoat: 0.8,
      });
      const kidneyMesh = new THREE.Mesh(kidneyGeo, kidneyMat);
      // Right kidney sits slightly lower due to liver
      kidneyMesh.position.set(xOffset, idx === 0 ? -0.03 : 0.02, 0);
      group.add(kidneyMesh);

      // Adrenal Glands (Golden suprarenal caps)
      const adrenalGeo = new THREE.ConeGeometry(0.045, 0.06, 16);
      const adrenalMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.3 });
      const adrenal = new THREE.Mesh(adrenalGeo, adrenalMat);
      adrenal.position.set(xOffset, (idx === 0 ? -0.03 : 0.02) + 0.18, 0);
      group.add(adrenal);

      // Descending Ureters
      const ureterCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xOffset * 0.6, idx === 0 ? -0.03 : 0.02, 0),
        new THREE.Vector3(xOffset * 0.45, -0.22, 0.02),
        new THREE.Vector3(xOffset * 0.25, -0.42, 0.04),
        new THREE.Vector3(0, -0.52, 0.05),
      ]);
      const ureterGeo = new THREE.TubeGeometry(ureterCurve, 20, 0.012, 12, false);
      const ureterMat = new THREE.MeshPhysicalMaterial({ color: 0xfef08a, roughness: 0.3 });
      group.add(new THREE.Mesh(ureterGeo, ureterMat));
    });

    // 2. Urinary Bladder
    const bladderGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const bladderMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.4,
      clearcoat: 0.7,
    });
    const bladder = new THREE.Mesh(bladderGeo, bladderMat);
    bladder.position.set(0, -0.54, 0.06);
    bladder.scale.set(1.1, 0.9, 1.0);
    group.add(bladder);

    this.organFocusGroup.add(group);

    // Pins
    this.createPin({
      id: 'renal-cortex',
      name: 'Renal Cortex & Glomeruli',
      category: 'Filtration Unit',
      position: new THREE.Vector3(-0.28, 0.06, 0.08),
      description: 'Holds 1 million nephrons per kidney filtering 180 liters of blood plasma daily into primary urine.',
    });

    this.createPin({
      id: 'adrenal-cap',
      name: 'Suprarenal Adrenal Gland',
      category: 'Endocrine Pacing',
      position: new THREE.Vector3(-0.22, 0.22, 0.04),
      description: 'Synthesizes aldosterone, cortisol, and discharges immediate fight-or-flight adrenaline.',
    });

    this.createPin({
      id: 'bladder',
      name: 'Urinary Bladder & Trigone',
      category: 'Excretory Reservoir',
      position: new THREE.Vector3(0, -0.54, 0.16),
      description: 'Distensible detrusor muscular container storing 400–600 mL of urine prior to parasympathetic voiding.',
    });

    this.targetLookAt.set(0, -0.15, 0);
    this.targetCamPos.set(0, -0.1, 1.25);
    this.isLerpingCamera = true;
  }

  /* ------------------------------------------------------------ */
  /* 🥨 6. High-Detail 3D Digestive System & Stomach               */
  /* ------------------------------------------------------------ */
  private buildHighDetailDigestive() {
    const group = new THREE.Group();

    // 1. J-Shaped Stomach (Fundus, Body, Antrum, Pylorus)
    const stomachCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.28, -0.02), // Esophagus inlet
      new THREE.Vector3(0.14, 0.24, 0.02),  // Fundus dome
      new THREE.Vector3(0.18, 0.08, 0.04),  // Greater curvature
      new THREE.Vector3(0.12, -0.06, 0.04), // Body
      new THREE.Vector3(-0.02, -0.08, 0.03),// Pyloric antrum
      new THREE.Vector3(-0.08, -0.02, 0.01),// Duodenum junction
    ]);
    const stomachGeo = new THREE.TubeGeometry(stomachCurve, 32, 0.09, 24, false);
    const stomachMat = new THREE.MeshPhysicalMaterial({
      color: 0x9f1239, // Gastric mucosa crimson
      roughness: 0.35,
      clearcoat: 0.8,
    });
    group.add(new THREE.Mesh(stomachGeo, stomachMat));

    // 2. Duodenal C-Loop (wraps around head of pancreas)
    const duodCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, -0.02, 0.01),
      new THREE.Vector3(-0.14, -0.08, 0.02),
      new THREE.Vector3(-0.12, -0.18, 0.02),
      new THREE.Vector3(-0.02, -0.22, 0.02),
    ]);
    const duodMat = new THREE.MeshPhysicalMaterial({ color: 0xb45309, roughness: 0.35 });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(duodCurve, 20, 0.04, 16, false), duodMat));

    // 3. Pancreas (Tucked in C-loop)
    const pancGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.18, 16);
    const pancMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.45 });
    const panc = new THREE.Mesh(pancGeo, pancMat);
    panc.rotation.z = Math.PI / 2.3;
    panc.position.set(0.01, -0.11, 0.01);
    group.add(panc);

    this.organFocusGroup.add(group);

    // Pins
    this.createPin({
      id: 'stomach-fundus',
      name: 'Gastric Fundus & Body',
      category: 'Enzymatic Digestion',
      position: new THREE.Vector3(0.16, 0.16, 0.14),
      description: 'Parietal cells secrete 2 liters of hydrochloric acid (pH 1.5) and intrinsic factor daily.',
    });

    this.createPin({
      id: 'duodenum',
      name: 'Duodenum & Pancreas',
      category: 'Nutrient Assimilation',
      position: new THREE.Vector3(-0.08, -0.12, 0.1),
      description: 'Bicarbonate neutralization and insulin secretion from pancreatic Islets of Langerhans.',
    });

    this.targetLookAt.set(0, 0.02, 0);
    this.targetCamPos.set(0, 0.05, 1.05);
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
    if (this.isBeating && this.heartVentriclesMesh) {
      const beatFreq = 1.2; // 72 bpm
      const cycle = (time * beatFreq) % 1.0;
      let scale = 1.0;

      // Systole: rapid contraction (Lub) followed by secondary recoil (Dub)
      if (cycle < 0.15) {
        scale = 1.0 + Math.sin((cycle / 0.15) * Math.PI) * 0.08;
      } else if (cycle > 0.22 && cycle < 0.38) {
        scale = 1.0 + Math.sin(((cycle - 0.22) / 0.16) * Math.PI) * 0.05;
      }

      this.heartVentriclesMesh.scale.set(scale, scale * 1.02, scale);
    }

    // 2. Respiration Breathing Cycle Animation
    if (this.isBreathing && this.lungsMeshGroup) {
      const breathPhase = Math.sin(time * 1.4); // 14 breaths / min
      const expansion = 1.0 + (breathPhase + 1.0) * 0.035;
      this.lungsMeshGroup.scale.set(expansion, expansion * 1.02, expansion);
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
