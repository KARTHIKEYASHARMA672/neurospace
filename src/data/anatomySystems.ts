export type AnatomySystemId =
  | 'skeleton'
  | 'muscular'
  | 'nervous'
  | 'cardiovascular'
  | 'organs'
  | 'skin';

export type RenderingViewMode = 'standard' | 'xray' | 'ct' | 'mri' | 'isolated';

export interface AnatomySystemConfig {
  id: AnatomySystemId;
  name: string;
  latinName: string;
  tagline: string;
  modelUrl: string;
  defaultColor: number;
  xrayColor: number;
  defaultOpacity: number;
  xrayOpacity: number;
  description: string;
  structuresCount: string;
  clinicalSignificance: string;
}

export const ANATOMY_SYSTEMS: Record<AnatomySystemId, AnatomySystemConfig> = {
  skeleton: {
    id: 'skeleton',
    name: 'Skeletal System',
    latinName: 'Systema skeletale',
    tagline: '206 articulated bones & mineral reservoir',
    modelUrl: '/models/anatomy/z-skeleton.glb',
    defaultColor: 0xe8e2d4, // Bone Ivory
    xrayColor: 0xdde7f0, // High-density radiopaque white
    defaultOpacity: 1.0,
    xrayOpacity: 0.95,
    description:
      'Rigid axial and appendicular framework providing mechanical leverage for locomotion, protection of delicate visceral and central neural cavities, hematopoiesis in red marrow, and systemic calcium/phosphate homeostasis.',
    structuresCount: '206 bones · 230 joints',
    clinicalSignificance:
      'Primary target of osteoporotic microarchitectural deterioration, pathological fractures, osteoarthritis of articulating synovial surfaces, and osteosarcoma.',
  },
  muscular: {
    id: 'muscular',
    name: 'Muscular System',
    latinName: 'Systema musculare',
    tagline: '650+ skeletal muscles & somatic kinetics',
    modelUrl: '/models/anatomy/z-muscular.glb',
    defaultColor: 0xa84838, // Muscle Red / Deep Terracotta
    xrayColor: 0xb55a4a, // Soft tissue density
    defaultOpacity: 0.88,
    xrayOpacity: 0.28,
    description:
      'Fasciculated contractile motor units executing bipedal propulsion, fine manipulative dexterity, diaphragmatic respiration, venous blood return, and thermoregulatory shivering.',
    structuresCount: '650+ skeletal muscles',
    clinicalSignificance:
      'Myasthenia gravis acetylcholine receptor blockade, muscular dystrophies, rhabdomyolysis muscle necrosis, and sarcopenic wasting.',
  },
  nervous: {
    id: 'nervous',
    name: 'Nervous System & Brain',
    latinName: 'Systema nervosum',
    tagline: 'Master central computational engine & peripheral plexus',
    modelUrl: '/models/anatomy/z-nervous.glb',
    defaultColor: 0xc98a2c, // Synaptic Gold / Amber
    xrayColor: 0xffd166, // Luminescent neural neon
    defaultOpacity: 1.0,
    xrayOpacity: 1.0,
    description:
      'Central Brain and Spinal Cord coordinating high-order cognition, descending motor volition, autonomic homeostasis, and over 150,000 km of peripheral somatosensory conduction.',
    structuresCount: '86B neurons · 31 spinal root pairs',
    clinicalSignificance:
      'Ischemic stroke, Parkinsonian striatal dopamine loss, multiple sclerosis central demyelination, and peripheral neuropathies.',
  },
  cardiovascular: {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    latinName: 'Systema cardiovasculare',
    tagline: 'Closed high-pressure hemodynamic circuit',
    modelUrl: '/models/anatomy/z-cardiovascular.glb',
    defaultColor: 0xb92343, // Crimson arterial red
    xrayColor: 0xff4d6d, // Fluorescent radiopaque angiogram
    defaultOpacity: 0.92,
    xrayOpacity: 0.85,
    description:
      'Central 4-chambered myocardial pump generating systemic arterial blood pressure, distributing oxygen and nutrients through coronary, carotid, aortic, and peripheral vascular networks.',
    structuresCount: '100,000 km blood vessels · 5L/min CO',
    clinicalSignificance:
      'Atherosclerotic coronary artery disease, aortic aneurysms, hypertension, and ischemic tissue perfusion failure.',
  },
  organs: {
    id: 'organs',
    name: 'Internal Visceral Organs',
    latinName: 'Viscera & Organa interna',
    tagline: 'Thoracic, abdominal & pelvic metabolic machinery',
    modelUrl: '/models/anatomy/z-organs.glb',
    defaultColor: 0x8a5830, // Natural visceral tone
    xrayColor: 0x4cc9f0, // Soft visceral contrast
    defaultOpacity: 0.9,
    xrayOpacity: 0.45,
    description:
      'Complex visceral architecture comprising the heart, lungs, liver, gastrointestinal tract, pancreas, spleen, and kidneys executing digestion, oxygenation, excretion, and endocrine balance.',
    structuresCount: 'Thoracic & Abdominal Viscera',
    clinicalSignificance:
      'Acute myocardial infarction, pulmonary embolism, cirrhosis, renal failure, and visceral neoplasias.',
  },
  skin: {
    id: 'skin',
    name: 'Integumentary System (Skin)',
    latinName: 'Integumentum commune',
    tagline: '2 m² protective boundary & sensory envelope',
    modelUrl: '/models/anatomy/z-skin.glb',
    defaultColor: 0x30356f, // Midnight Indigo / Translucent dermis
    xrayColor: 0x64748b, // X-ray radiolucent shadow contour
    defaultOpacity: 0.35,
    xrayOpacity: 0.12,
    description:
      'Multi-layered epithelial envelope acting as primary barrier against ultraviolet radiation, microbial invasion, thermoregulatory fluid loss, and containing millions of tactile mechanoreceptors.',
    structuresCount: '1.8–2.0 m² surface area',
    clinicalSignificance:
      'Severe burn shock, cutaneous melanoma, psoriasis, and dermatomal herpes zoster reactivation.',
  },
};
