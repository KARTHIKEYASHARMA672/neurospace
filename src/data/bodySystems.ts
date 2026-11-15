export type ViewMode = 'brain' | 'fullbody' | 'nervous' | 'organs' | 'skin';

export type BodyPartId =
  // Brain & Central
  | 'brain'
  | 'spinal-cord'
  | 'cranial-nerves'
  // Peripheral Nerves & Plexuses
  | 'brachial-plexus'
  | 'radial-nerve'
  | 'median-nerve'
  | 'sciatic-nerve'
  | 'femoral-nerve'
  | 'tibial-nerve'
  | 'vagus-nerve'
  // Sensory & Skin Integumentary
  | 'epidermis-skin'
  | 'touch-receptors'
  | 'dermatomes'
  // Autonomic & Internal Organs
  | 'cardiac-plexus'
  | 'pulmonary-network'
  | 'celiac-plexus'
  | 'enteric-gut'
  | 'renal-adrenal';

export interface BodySystemPart {
  id: BodyPartId;
  name: string;
  system: 'Central Nervous' | 'Peripheral Nervous' | 'Autonomic & Visceral' | 'Integumentary & Sensory';
  tagline: string;
  anatomicalLocation: string;
  innervation: string;
  nerveFiberType: string;
  color: string;
  position3D: [number, number, number]; // [x, y, z] in normalized body coordinates
  scale: [number, number, number];
  size: number;
  firingPropensity: number; // 0-100 baseline activity
  clinicalPearls: string;
  deepPhysiology: string;
  keyFunctions: string[];
  associatedPathologies: string[];
}

export const BODY_PARTS: BodySystemPart[] = [
  {
    id: 'brain',
    name: 'Cerebrum & Encephalon',
    system: 'Central Nervous',
    tagline: 'Master central computational engine',
    anatomicalLocation: 'Cranial cavity · Superior aspect of CNS',
    innervation: 'Processes all 12 pairs of cranial nerves + ascending spinal tracts',
    nerveFiberType: 'Oligodendrocyte-myelinated CNS axons & unmyelinated gray matter dendrites',
    color: '#30356F', // Midnight Indigo
    position3D: [0, 1.82, 0.02],
    scale: [0.38, 0.36, 0.44],
    size: 0.35,
    firingPropensity: 78,
    clinicalPearls: 'Consumes 20% of resting metabolic oxygen despite representing only 2% of total body mass. Protected by the selective blood-brain barrier (BBB).',
    deepPhysiology: 'The cerebral cortex contains ~16 billion cortical neurons with laminar 6-layer architecture, executing sensory synthesis, motor volition, and high-order executive cognition.',
    keyFunctions: [
      'Conscious perception & cognitive planning',
      'Integration of afferent sensory streams',
      'Motor initiation via corticospinal upper motor neurons',
      'Neuroendocrine homeostasis via hypothalamic-pituitary axis',
    ],
    associatedPathologies: [
      'Ischemic Stroke & Hemorrhage',
      'Alzheimers & Neurodegenerative Tauopathies',
      'Focal & Generalized Epilepsies',
      'Glioblastoma & Meningioma Neoplasms',
    ],
  },
  {
    id: 'spinal-cord',
    name: 'Medulla Spinalis (Spinal Cord)',
    system: 'Central Nervous',
    tagline: 'High-speed 120 m/s neural trunk & reflex axis',
    anatomicalLocation: 'Vertebral canal from foramen magnum to L1/L2 conus medullaris',
    innervation: '31 pairs of spinal nerves (8 cervical, 12 thoracic, 5 lumbar, 5 sacral, 1 coccygeal)',
    nerveFiberType: 'Descending corticospinal & ascending spinothalamic tracts (A-alpha / A-beta fibers)',
    color: '#C98A2C', // Warm Amber/Gold
    position3D: [0, 0.95, -0.06],
    scale: [0.08, 0.88, 0.08],
    size: 0.22,
    firingPropensity: 65,
    clinicalPearls: 'Terminates around L1-L2 in adults, leaving the cauda equina bathing in CSF, making L3-L4/L4-L5 safe for diagnostic lumbar puncture.',
    deepPhysiology: 'Features an H-shaped gray matter core surrounded by funiculi of ascending sensory and descending motor white matter columns, coordinating stereotypic withdrawal reflexes.',
    keyFunctions: [
      'Bidirectional neural transmission between brain & periphery',
      'Monosynaptic deep tendon & polysynaptic withdrawal reflexes',
      'Central Pattern Generators (CPGs) for rhythmic locomotion',
      'Sympathetic preganglionic output from T1-L2 intermediolateral horn',
    ],
    associatedPathologies: [
      'Spinal Cord Injury (Paraplegia / Tetraplegia)',
      'Amyotrophic Lateral Sclerosis (ALS)',
      'Multiple Sclerosis plaque demyelination',
      'Brown-Séquard hemisection syndrome',
    ],
  },
  {
    id: 'cranial-nerves',
    name: 'Cranial Nerve Nuclei & Complex (CN I–XII)',
    system: 'Central Nervous',
    tagline: 'Special sensory & somatic face/neck interface',
    anatomicalLocation: 'Brainstem (Midbrain, Pons, Medulla Oblongata) & Skull Base Foramina',
    innervation: 'Olfaction, vision, facial sensation, mimetic muscles, swallowing, vocal cords',
    nerveFiberType: 'Special visceral afferent, branchial motor & general somatic fibers',
    color: '#8E3B2F', // Burgundy Red
    position3D: [0, 1.55, 0.12],
    scale: [0.24, 0.18, 0.18],
    size: 0.18,
    firingPropensity: 72,
    clinicalPearls: 'CN III (Oculomotor) compression from uncal herniation causes classic ipsilateral blown, non-reactive pupil with "down-and-out" eye deviation.',
    deepPhysiology: 'Crucial bridge coordinating the pupillary light reflex (CN II/III), corneal blink reflex (CN V1/VII), and vestibulo-ocular reflex (VOR, CN VIII/III/VI).',
    keyFunctions: [
      'Special senses: Olfaction, vision, gustation, audition, vestibular balance',
      'Mastication (CN V3) & facial expressions (CN VII)',
      'Pharyngeal deglutition & soft palate elevation (CN IX, X)',
      'Tongue mobility & articulation (CN XII)',
    ],
    associatedPathologies: [
      'Bell Palsy (idiopathic CN VII neuropathy)',
      'Trigeminal Neuralgia (tic douloureux)',
      'Bulbar and Pseudobulbar Palsy',
      'Acoustic Neuroma / Vestibular Schwannoma',
    ],
  },
  {
    id: 'brachial-plexus',
    name: 'Brachial Plexus (C5–T1)',
    system: 'Peripheral Nervous',
    tagline: 'Upper limb motor-sensory distribution highway',
    anatomicalLocation: 'Posterior triangle of the neck down through axillary apex',
    innervation: 'Shoulder girdle, arm, forearm, hand and digital precision flexors',
    nerveFiberType: 'Myelinated motor and sensory fibers with Schwann cell neurolemma',
    color: '#22527B', // Deep Marine
    position3D: [0.38, 1.25, 0.02],
    scale: [0.32, 0.22, 0.14],
    size: 0.20,
    firingPropensity: 58,
    clinicalPearls: 'Erb-Duchenne palsy (upper trunk C5-C6 stretch during delivery) results in the classic "waiters tip" adducted, internally rotated and pronated limb posture.',
    deepPhysiology: 'Organized systematically into Roots (5), Trunks (3), Divisions (6), Cords (3), and terminal Branches (5: Musculocutaneous, Axillary, Radial, Median, Ulnar).',
    keyFunctions: [
      'Complete motor innervation of pectoralis, deltoid, biceps, and triceps',
      'Sensory mapping of C5–T1 dermatomes over arm and forearm',
      'Proprioceptive positional awareness of wrist and elbow joints',
      'Vasomotor tone control of radial and ulnar digital arteries',
    ],
    associatedPathologies: [
      'Thoracic Outlet Compression Syndrome (TOS)',
      'Erb-Duchenne & Klumpke Paralysis',
      'Parsonage-Turner Syndrome (Neuralgic Amyotrophy)',
      'Traumatic traction injuries in motorcycling accidents',
    ],
  },
  {
    id: 'radial-nerve',
    name: 'Radial Nerve & Extensor Trunk',
    system: 'Peripheral Nervous',
    tagline: 'Extensor power of arm, wrist and digits',
    anatomicalLocation: 'Posterior cord through spiral groove of humerus to dorsal hand',
    innervation: 'Triceps brachii, brachioradialis, extensor carpi radialis/ulnaris, extensor digitorum',
    nerveFiberType: 'Large myelinated A-alpha motor & A-beta cutaneous sensory fibers',
    color: '#3B7080', // Slate Teal
    position3D: [0.62, 0.95, -0.04],
    scale: [0.12, 0.55, 0.08],
    size: 0.16,
    firingPropensity: 52,
    clinicalPearls: 'Mid-shaft humerus fractures directly endanger the radial nerve in the spiral groove, precipitating immediate wrist drop and sensory loss over first dorsal webspace.',
    deepPhysiology: 'Supplies the entire extensor compartment of the upper extremity. Its deep branch pierces the supinator muscle to become the Posterior Interosseous Nerve (PIN).',
    keyFunctions: [
      'Forearm extension at the humeroulnar joint',
      'Wrist dorsiflexion and radial deviation',
      'Extension of metacarpophalangeal joints',
      'Cutaneous sensation over dorsal aspect of thumb, index, and middle fingers',
    ],
    associatedPathologies: [
      'Wrist Drop / "Saturday Night Palsy" (spiral groove compression)',
      'Posterior Interosseous Nerve (PIN) entrapment',
      'Humerus mid-diaphyseal fracture neuropraxia',
      'Cheiralgia Paresthetica (Wartenbergs syndrome)',
    ],
  },
  {
    id: 'median-nerve',
    name: 'Median Nerve & Precision Digital Axis',
    system: 'Peripheral Nervous',
    tagline: 'Precision grip & carpal tunnel corridor',
    anatomicalLocation: 'Anterior compartment of forearm through flexor retinaculum into thenar space',
    innervation: 'Pronators, wrist flexors, digital flexors, thenar muscles, lateral 2 lumbricals',
    nerveFiberType: 'A-alpha motor, A-beta tactile & sympathetic vasomotor fibers',
    color: '#5C7A58', // Muted Sage
    position3D: [0.68, 0.58, 0.04],
    scale: [0.10, 0.48, 0.06],
    size: 0.15,
    firingPropensity: 64,
    clinicalPearls: 'Carpal Tunnel Syndrome is the most prevalent peripheral entrapment neuropathy globally, causing nocturnal acroparesthesias relieved by "shaking out" the hands (Flick sign).',
    deepPhysiology: 'Controls fine precision fingertip pinch and pincer grasp. Its recurrent motor branch hooks around the distal edge of flexor retinaculum to power the abductor pollicis brevis.',
    keyFunctions: [
      'Thumb opposition, abduction, and index finger flexion',
      'High-resolution tactile sensory disc feedback from fingertips 1–3.5',
      'Pronation of the forearm via pronator teres & quadratus',
      'Sympathetic sudomotor moisture control of palmar grasp skin',
    ],
    associatedPathologies: [
      'Carpal Tunnel Syndrome (CTS)',
      'Ape Hand deformity & Hand of Benediction',
      'Pronator Teres Syndrome',
      'Anterior Interosseous Nerve (AIN) Kiloh-Nevin syndrome',
    ],
  },
  {
    id: 'sciatic-nerve',
    name: 'Sciatic Nerve (Nervus Ischiadicus, L4–S3)',
    system: 'Peripheral Nervous',
    tagline: 'Largest single nerve in human anatomy (2 cm caliber)',
    anatomicalLocation: 'Exits pelvis via greater sciatic foramen beneath piriformis into posterior thigh',
    innervation: 'Hamstrings, adductor magnus, and via tibial/peroneal branches all leg & foot muscles',
    nerveFiberType: 'High-density bundled A-alpha motor, A-beta sensory, and C-pain fibers',
    color: '#9C6B30', // Ochre Amber
    position3D: [-0.22, 0.10, -0.06],
    scale: [0.16, 0.82, 0.12],
    size: 0.24,
    firingPropensity: 60,
    clinicalPearls: 'L5-S1 lumbar disc herniation compresses descending nerve roots, sending shooting, lancinating pain from gluteus down the posterior thigh to the lateral heel (radiculopathy).',
    deepPhysiology: 'Composed of two distinct trunks bundled inside a single epineural sheath: the medial Tibial Nerve and lateral Common Fibular (Peroneal) Nerve, bifurcating at popliteal fossa.',
    keyFunctions: [
      'Knee flexion via semitendinosus, semimembranosus, and biceps femoris',
      'Power transmission for bipedal upright propulsion and running gait',
      'Proprioceptive balance feedback from the entire plantar footbed',
      'Conduction of pain and thermal signals from the lower extremity',
    ],
    associatedPathologies: [
      'Sciatica / Lumbar Radiculopathy (L4, L5, S1)',
      'Piriformis Syndrome (deep gluteal syndrome)',
      'Intramuscular injection nerve trauma',
      'Posterior hip dislocation traction injury',
    ],
  },
  {
    id: 'femoral-nerve',
    name: 'Femoral Nerve (L2–L4)',
    system: 'Peripheral Nervous',
    tagline: 'Quadriceps extensor & patellar reflex arc',
    anatomicalLocation: 'Posterior abdominal wall, under inguinal ligament into femoral triangle',
    innervation: 'Iliopsoas, pectineus, sartorius, quadriceps femoris (rectus, vasti)',
    nerveFiberType: 'Somatic motor & saphenous cutaneous sensory fibers',
    color: '#8A5243', // Terracotta Rust
    position3D: [0.22, 0.22, 0.08],
    scale: [0.14, 0.65, 0.10],
    size: 0.18,
    firingPropensity: 54,
    clinicalPearls: 'Tapping the patellar ligament tests the L2-L4 integrity via the femoral nerve; an absent knee jerk (Westphals sign) indicates lower motor neuron pathology.',
    deepPhysiology: 'Crucial for posture stabilization and stair climbing; extends down the medial calf and malleolus as the sensory-only Saphenous Nerve.',
    keyFunctions: [
      'Knee extension against gravity (standing upright, stair ascents)',
      'Hip flexion via rectus femoris and iliopsoas',
      'Cutaneous sensation over anterior thigh and anteromedial knee',
      'Maintenance of bipedal knee stability during heel-strike gait',
    ],
    associatedPathologies: [
      'Femoral Neuropathy (pelvic hematoma, lithotomy positioning)',
      'Loss of patellar reflex & quadriceps muscle wasting',
      'Meralgia Paresthetica (lateral femoral cutaneous nerve compression)',
      'Saphenous nerve entrapment at adductor canal',
    ],
  },
  {
    id: 'tibial-nerve',
    name: 'Tibial & Peroneal Terminal Branches',
    system: 'Peripheral Nervous',
    tagline: 'Plantar push-off & dorsal foot clearance',
    anatomicalLocation: 'Popliteal fossa down through deep posterior calf into tarsal tunnel & plantar foot',
    innervation: 'Gastrocnemius, soleus, tibialis posterior, toe flexors, intrinsic foot muscles',
    nerveFiberType: 'High-speed motor conduction & dense mechanoreceptor afferents',
    color: '#4B6B61', // Deep Forest Pine
    position3D: [-0.22, -0.68, -0.04],
    scale: [0.12, 0.85, 0.10],
    size: 0.17,
    firingPropensity: 62,
    clinicalPearls: 'Common Peroneal nerve injury at the fibular neck results in complete foot drop with classic "steppage gait" where the knee must be lifted high to avoid tripping.',
    deepPhysiology: 'The tibial nerve supplies the powerful plantarflexors that generate up to 3× body weight propulsion during sprinting, while providing sensory feedback for postural sway.',
    keyFunctions: [
      'Plantarflexion & push-off propulsion via Achilles tendon',
      'Dorsiflexion toe clearance via anterior tibialis (deep peroneal)',
      'Sensory discrimination across sole of foot via medial/lateral plantar nerves',
      'Achilles deep tendon reflex (S1-S2) mediation',
    ],
    associatedPathologies: [
      'Foot Drop (Peroneal nerve entrapment at fibular head)',
      'Tarsal Tunnel Syndrome (posterior tibial nerve compression)',
      'Diabetic Peripheral Neuropathy ("stocking-glove" sensory loss)',
      'Mortons Neuroma of the interdigital plantars',
    ],
  },
  {
    id: 'vagus-nerve',
    name: 'Vagus Nerve (Cranial Nerve X)',
    system: 'Autonomic & Visceral',
    tagline: 'The great parasympathetic "wanderer"',
    anatomicalLocation: 'Medulla through jugular foramen down carotid sheath into thorax and abdomen',
    innervation: 'Sinoatrial node, bronchial smooth muscle, esophagus, stomach, liver, pancreas, intestines',
    nerveFiberType: '80% sensory afferents carrying gut-brain data, 20% cholinergic parasympathetic efferents',
    color: '#8A3B60', // Deep Berry Plum
    position3D: [0.04, 1.25, 0.08],
    scale: [0.14, 0.72, 0.14],
    size: 0.22,
    firingPropensity: 70,
    clinicalPearls: 'Excessive vagal stimulation triggers sudden bradycardia and systemic vasodilation (neurocardiogenic syncope) causing brief fainting spells under acute emotional stress.',
    deepPhysiology: 'The vagus nerve is the biological backbone of the parasympathetic "Rest & Digest" response, releasing acetylcholine onto muscarinic M2 receptors in the heart to lower heart rate.',
    keyFunctions: [
      'Deceleration of cardiac sinoatrial pacemaker (bradycardic tone)',
      'Stimulation of gastrointestinal peristalsis & digestive secretomotor output',
      'Afferent inflammatory reflex sensing systemic cytokine release',
      'Vocal cord motor control via the Recurrent Laryngeal Nerve',
    ],
    associatedPathologies: [
      'Vasovagal (Neurocardiogenic) Syncope',
      'Gastroparesis in longstanding diabetes mellitus',
      'Hoarseness from recurrent laryngeal nerve palsy (aortic aneurysm / thyroid surgery)',
      'Vagus Nerve Stimulation (VNS) for refractory epilepsy & depression',
    ],
  },
  {
    id: 'epidermis-skin',
    name: 'Cutaneous Integumentary Envelope',
    system: 'Integumentary & Sensory',
    tagline: 'Primary environmental boundary & 2 m² sensory organ',
    anatomicalLocation: 'Complete external surface of human body (approx 1.8–2.0 m² surface area)',
    innervation: 'Free nerve endings, Merkel discs, Meissner corpuscles, Pacinian corpuscles, Ruffini endings',
    nerveFiberType: 'A-beta (touch/vibration), A-delta (fast acute pain/cool), C-fibers (slow burning pain/warmth)',
    color: '#A06E50', // Warm Sandy Amber
    position3D: [0, 0.45, 0.01],
    scale: [0.92, 1.95, 0.48],
    size: 0.40,
    firingPropensity: 68,
    clinicalPearls: 'Third-degree full-thickness burns destroy cutaneous nerve endings, paradoxically producing painless center wounds surrounded by agonizingly hyperesthetic partial-thickness borders.',
    deepPhysiology: 'Features 5 epidermal strata (basale, spinosum, granulosum, lucidum, corneum) supported by a dense vascular dermis rich in sympathetic sudomotor sweat glands for thermoregulation.',
    keyFunctions: [
      'Physical, microbial, and ultraviolet barrier against environmental damage',
      'Thermoregulatory sweating and cutaneous capillary vasoconstriction/dilation',
      'Sensory transduction of touch, texture, thermal shifts, and mechanical pain',
      'Photochemical synthesis of Vitamin D (cholecalciferol) from 7-dehydrocholesterol',
    ],
    associatedPathologies: [
      'Psoriasis & Atopic Dermatitis flare-ups',
      'Herpes Zoster (Shingles) dermatomal reactivation',
      'Severe burn injury shock & hypothermia',
      'Skin neoplasms: Melanoma, Basal Cell, Squamous Cell carcinoma',
    ],
  },
  {
    id: 'touch-receptors',
    name: 'Somatosensory Mechanoreceptor Matrix',
    system: 'Integumentary & Sensory',
    tagline: 'High-fidelity tactile & vibration transducers',
    anatomicalLocation: 'Glabrous and hairy skin, fingertips, lips, palms, and plantar surfaces',
    innervation: 'Dorsal Root Ganglia (DRG) pseudounipolar primary sensory neurons',
    nerveFiberType: 'Fast-adapting (Meissner, Pacinian) & slowly-adapting (Merkel, Ruffini) type I/II fibers',
    color: '#B5753A', // Rich Ochre
    position3D: [0.55, 0.62, 0.14],
    scale: [0.22, 0.25, 0.18],
    size: 0.16,
    firingPropensity: 75,
    clinicalPearls: 'Two-point discrimination threshold on fingertips is ~2–3 mm due to hyperdense Merkel/Meissner fields, compared to 40–50 mm on the upper back.',
    deepPhysiology: 'Pacinian corpuscles consist of 20–70 concentric lamellae around a single unmyelinated axon terminal, acting as a mechanical band-pass filter sensitive to 200–300 Hz micro-vibrations.',
    keyFunctions: [
      'Pacinian: High-frequency transient vibration & textural micro-slip detection',
      'Meissner: Low-frequency flutter (10–50 Hz) and dynamic grip slippage feedback',
      'Merkel discs: Sustained touch, point pressure, and spatial Braille reading',
      'Ruffini cylinders: Sustained skin stretch, joint angle tracking, and shear stress',
    ],
    associatedPathologies: [
      'Peripheral Sensory Polyneuropathy',
      'Tactile Allodynia (non-painful touch perceived as excruciating)',
      'Phantom Limb sensations following amputation',
      'Loss of protective sensation (Semmes-Weinstein monofilament failure)',
    ],
  },
  {
    id: 'dermatomes',
    name: 'Sensory Dermatome Architecture (C2–S5)',
    system: 'Integumentary & Sensory',
    tagline: 'Topographic segmental skin mapping of spinal roots',
    anatomicalLocation: 'Continuous segmental bands encircling torso and extending longitudinally down limbs',
    innervation: 'Specific dorsal roots of the 31 spinal segments (e.g. C6 thumb, T4 nipples, T10 umbilicus, L4 knee)',
    nerveFiberType: 'Cutaneous somatic sensory afferents entering dorsal horn of spinal cord',
    color: '#A85A32', // Terracotta Spice
    position3D: [0, 0.72, 0.12],
    scale: [0.52, 0.95, 0.28],
    size: 0.26,
    firingPropensity: 50,
    clinicalPearls: 'Varicella-zoster virus lies dormant in dorsal root ganglia for decades; reactivation produces excruciating radicular burning followed by a blistering unilateral dermatomal rash.',
    deepPhysiology: 'Crucial in acute trauma and neurology exams to accurately localize the exact spinal level of injury or disc herniation without immediate MRI access.',
    keyFunctions: [
      'Segmental somatotopic spatial encoding into primary somatosensory cortex S1',
      'Referred visceral pain mapping (e.g. cardiac ischemia referred to T1-T4 left arm)',
      'Reflex cutaneous vasoconstriction under localized cold stress',
      'Sensory discrimination and diagnostic spinal localization',
    ],
    associatedPathologies: [
      'Herpes Zoster (Shingles dermatomal eruption)',
      'Radicular pain syndrome / Sciatica',
      'Complete sensory level loss in spinal cord transection',
      'Post-herpetic Neuralgia (intractable chronic neuropain)',
    ],
  },
  {
    id: 'cardiac-plexus',
    name: 'Cardiac Autonomic Plexus & Conduction Loop',
    system: 'Autonomic & Visceral',
    tagline: 'Intrinsic cardiac nervous system & pacemaker drive',
    anatomicalLocation: 'Base of heart around aortic arch and pulmonary trunk bifurcation',
    innervation: 'Sympathetic postganglionic fibers (cervical/thoracic ganglia) + Parasympathetic vagal fibers',
    nerveFiberType: 'Adrenergic beta-1 excitatory and cholinergic muscarinic M2 inhibitory fibers',
    color: '#76283B', // Wine Red
    position3D: [-0.04, 1.12, 0.08],
    scale: [0.26, 0.24, 0.22],
    size: 0.22,
    firingPropensity: 76,
    clinicalPearls: 'Sympathetic surge during intense emotional grief or terror can induce Takotsubo cardiomyopathy ("Broken Heart Syndrome"), mimicking acute anterior myocardial infarction.',
    deepPhysiology: 'Coordinates the SA node (intrinsic rate 100 bpm, depressed to 70 bpm by tonic vagal brake), AV node delay (0.09 s), and His-Purkinje ventricular rapid depolarization.',
    keyFunctions: [
      'Chronotropy (heart rate modulation via SA node pacing)',
      'Inotropy (ventricular myocardial contractile force modulation)',
      'Dromotropy (AV nodal conduction velocity regulation)',
      'Coronary artery vasomotor tone adaptation to cardiac oxygen demand',
    ],
    associatedPathologies: [
      'Atrial Fibrillation & Ventricular Tachyarrhythmias',
      'Sick Sinus Syndrome & AV Heart Blocks',
      'Takotsubo (Stress-Induced) Cardiomyopathy',
      'Sudden Cardiac Arrest from autonomic dysregulation',
    ],
  },
  {
    id: 'pulmonary-network',
    name: 'Pulmonary Neurovascular Plexus & Respiratory Drive',
    system: 'Autonomic & Visceral',
    tagline: 'Bronchomotor tone & medullary chemoreflex loop',
    anatomicalLocation: 'Root of both lungs around bilateral primary bronchi',
    innervation: 'Vagus nerve branches + sympathetic fibers from T2–T5 thoracic sympathetic trunk',
    nerveFiberType: 'Bronchoconstrictor parasympathetic, bronchodilator sympathetic & Hering-Breuer stretch receptors',
    color: '#28586A', // Deep Ocean Teal
    position3D: [0.08, 1.08, 0.02],
    scale: [0.44, 0.32, 0.24],
    size: 0.24,
    firingPropensity: 66,
    clinicalPearls: 'The Hering-Breuer inflation reflex prevents pulmonary overdistension: pulmonary stretch receptors fire via the vagus to shut off the medullary inspiratory center.',
    deepPhysiology: 'Coordinates with central medullary chemoreceptors (sensitive to CSF pH/PCO2) and peripheral carotid/aortic bodies to modulate alveolar ventilation rate minute-by-minute.',
    keyFunctions: [
      'Bronchial diameter regulation (beta-2 dilation during exercise, M3 constriction)',
      'Hering-Breuer pulmonary stretch protective feedback',
      'Pulmonary arterial vasoconstriction in response to alveolar hypoxia (HPV)',
      'Mucus secretomotor clearance via tracheobronchial ciliated epithelium',
    ],
    associatedPathologies: [
      'Asthma exacerbation (hyperactive bronchospasm & airway remodeling)',
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Pulmonary Embolism with reflex tachypnea',
      'Cheyne-Stokes periodic breathing in advanced heart failure',
    ],
  },
  {
    id: 'celiac-plexus',
    name: 'Celiac & Splanchnic Nerve Hub',
    system: 'Autonomic & Visceral',
    tagline: '"Solar Plexus" — the major abdominal sympathetic clearinghouse',
    anatomicalLocation: 'Retroperitoneum anterior to abdominal aorta at T12–L1 vertebrae level',
    innervation: 'Greater, lesser, and least splanchnic nerves synapsing onto paired celiac ganglia',
    nerveFiberType: 'Pre- and postganglionic sympathetic fibers with dense sensory nociceptive afferents',
    color: '#704228', // Earth Amber
    position3D: [0, 0.82, -0.02],
    scale: [0.22, 0.18, 0.16],
    size: 0.20,
    firingPropensity: 58,
    clinicalPearls: 'Percutaneous Celiac Plexus Neurolytic Block (using absolute alcohol) provides dramatic pain relief for patients with intractable pain from advanced pancreatic carcinoma.',
    deepPhysiology: 'Acts as the primary autonomic routing exchange supplying the stomach, duodenum, liver, gallbladder, spleen, pancreas, kidneys, and suprarenal glands.',
    keyFunctions: [
      'Inhibition of upper gastrointestinal peristalsis during fight-or-flight',
      'Splanchnic vascular bed vasoconstriction to redirect blood flow to skeletal muscles',
      'Conduction of visceral nociception from upper abdominal viscera to CNS',
      'Hepatic glycogenolysis mobilization during systemic hypoglycemic stress',
    ],
    associatedPathologies: [
      'Pancreatic carcinoma intractable visceral pain',
      'Chronic mesenteric ischemia ("abdominal angina")',
      'Orthostatic hypotension in diabetic autonomic neuropathy',
      'Blunt abdominal solar plexus impact reflex shock',
    ],
  },
  {
    id: 'enteric-gut',
    name: 'Enteric Nervous System (ENS) — "Second Brain"',
    system: 'Autonomic & Visceral',
    tagline: '500 million neurons lining the gastrointestinal tract',
    anatomicalLocation: 'Myenteric (Auerbach) and Submucosal (Meissner) plexuses from esophagus to rectum',
    innervation: 'Autonomous intrinsic neural circuits with modulating vagal and sympathetic inputs',
    nerveFiberType: 'Complete reflex arcs with sensory neurons, interneurons, and motor effectors',
    color: '#8A5830', // Warm Ochre Sienna
    position3D: [0, 0.52, 0.06],
    scale: [0.38, 0.42, 0.28],
    size: 0.28,
    firingPropensity: 74,
    clinicalPearls: 'Approximately 90% of the entire human body’s serotonin (5-HT) is synthesized inside the gut by enterochromaffin cells, heavily influencing mood and motility.',
    deepPhysiology: 'Capable of functioning completely independently of the CNS, orchestrating the migrating motor complex (MMC), peristaltic waves, mucosal secretion, and local immune responses.',
    keyFunctions: [
      'Peristaltic propulsion and segmentation contractions for nutrient digestion',
      'Submucosal secretomotor regulation of fluid, electrolyte, and enzyme fluxes',
      'Gut-Brain axis signaling modulating mood, satiety, and anxiety',
      'Barrier defense and enteric immune surveillance via gut-associated lymphoid tissue (GALT)',
    ],
    associatedPathologies: [
      'Irritable Bowel Syndrome (IBS) with visceral hypersensitivity',
      'Hirschsprung Disease (congenital aganglionic megacolon)',
      'Inflammatory Bowel Disease (Crohn’s and Ulcerative Colitis)',
      'Parkinsons early alpha-synuclein pathology in Lewy body enteric staging',
    ],
  },
  {
    id: 'renal-adrenal',
    name: 'Sympathoadrenal & Renal Neuroendocrine Axis',
    system: 'Autonomic & Visceral',
    tagline: 'Systemic adrenaline flood & blood pressure baroregulation',
    anatomicalLocation: 'Posterior abdominal wall over superior poles of bilateral kidneys (T12–L1)',
    innervation: 'Direct preganglionic sympathetic fibers from greater splanchnic nerve via celiac plexus',
    nerveFiberType: 'Cholinergic preganglionic fibers synapsing directly onto adrenal chromaffin cells',
    color: '#802838', // Deep Crimson
    position3D: [0.24, 0.72, -0.04],
    scale: [0.28, 0.26, 0.20],
    size: 0.22,
    firingPropensity: 64,
    clinicalPearls: 'Pheochromocytoma (chromaffin cell tumor) causes episodic hypertension, pounding headaches, diaphoresis, and palpitations due to uninhibited catecholamine release.',
    deepPhysiology: 'Adrenal chromaffin cells are modified postganglionic sympathetic neurons that release 80% epinephrine and 20% norepinephrine directly into systemic circulation for acute alarm response.',
    keyFunctions: [
      'Massive systemic epinephrine/norepinephrine surge within 500 ms of threat',
      'Renin-Angiotensin-Aldosterone System (RAAS) activation for blood pressure maintenance',
      'Renal tubular sodium reabsorption and glomerular filtration rate modulation',
      'Cortisol glucocorticoid circadian mobilization via hypothalamic-pituitary-adrenal (HPA) axis',
    ],
    associatedPathologies: [
      'Pheochromocytoma & Paraganglioma catecholamine crises',
      'Addisons Disease (primary adrenal insufficiency)',
      'Renal Artery Stenosis secondary renovascular hypertension',
      'Cushing Syndrome with hypercortisolemic metabolic dysfunction',
    ],
  },
];

export const BODY_PART_MAP: Record<BodyPartId, BodySystemPart> = Object.fromEntries(
  BODY_PARTS.map((p) => [p.id, p]),
) as Record<BodyPartId, BodySystemPart>;
