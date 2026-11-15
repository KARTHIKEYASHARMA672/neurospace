export type RegionId =
  | 'prefrontal'
  | 'motor'
  | 'somatosensory'
  | 'parietal'
  | 'occipital'
  | 'temporal'
  | 'wernicke'
  | 'broca'
  | 'hippocampus'
  | 'amygdala'
  | 'cerebellum'
  | 'brainstem';

export interface BrainRegion {
  id: RegionId;
  name: string;
  tagline: string;
  location: string;
  hemisphere: 'Left' | 'Right' | 'Bilateral';
  color: string;
  /** anchor point in brain-local units (x right+, y up+, z front+) */
  position: [number, number, number];
  /** glow radius in scene units */
  size: number;
  /** true for structures seated deep inside the hemispheres (rendered x-ray) */
  deep: boolean;
  baseActivity: number; // 0–100 resting firing propensity
  neurons: string;
  description: string;
  functions: string[];
  clinical: string;
  fact: string;
}

export const REGIONS: BrainRegion[] = [
  {
    id: 'prefrontal',
    name: 'Prefrontal Cortex',
    tagline: 'Executive command center',
    location: 'Frontal lobe · anterior pole',
    hemisphere: 'Bilateral',
    color: '#C9A961',
    position: [0, 0.3, 0.78],
    size: 0.30,
    deep: false,
    baseActivity: 62,
    neurons: '≈ 2.6B neurons',
    description:
      'The most evolved region of the human brain. The prefrontal cortex orchestrates working memory, planning, impulse control, social reasoning and moral judgment — the seat of what we call character.',
    functions: [
      'Working memory & mental rehearsal',
      'Planning, prioritisation & goal pursuit',
      'Impulse inhibition & emotional regulation',
      'Abstract reasoning & social cognition',
    ],
    clinical: 'Lesions produce disinhibition, poor judgment and personality change — classically seen in frontotemporal dementia and after orbitofrontal injury.',
    fact: 'The prefrontal cortex is not fully myelinated until ~age 25, which is why teenage judgement leans heavily on the amygdala.',
  },
  {
    id: 'motor',
    name: 'Primary Motor Cortex',
    tagline: 'Voluntary movement out',
    location: 'Frontal lobe · precentral gyrus',
    hemisphere: 'Bilateral',
    color: '#7D8B5A',
    position: [0, 0.6, 0.04],
    size: 0.26,
    deep: false,
    baseActivity: 48,
    neurons: '≈ 1.1B pyramidal cells',
    description:
      'A somatotopic strip that maps every voluntary muscle. Motor neurons here fire in precise sequences — hand and face occupy disproportionately large territories, mirroring dexterity and speech demands.',
    functions: [
      'Execution of voluntary movement',
      'Somatotopic body mapping (the “motor homunculus”)',
      'Force, trajectory & fine motor tuning',
      'Corticospinal tract origination',
    ],
    clinical: 'Upper motor neuron lesions cause contralateral weakness, hyperreflexia and spasticity — the hallmark of stroke in the middle cerebral artery territory.',
    fact: 'Your hand area of motor cortex occupies roughly the same cortical surface as your entire leg — precision costs neurons.',
  },
  {
    id: 'somatosensory',
    name: 'Somatosensory Cortex',
    tagline: 'The body’s inward sense',
    location: 'Parietal lobe · postcentral gyrus',
    hemisphere: 'Bilateral',
    color: '#A8B05C',
    position: [0, 0.58, -0.26],
    size: 0.25,
    deep: false,
    baseActivity: 44,
    neurons: '≈ 1.4B neurons',
    description:
      'Receives every touch, temperature, pain and proprioceptive signal from the body. Like its neighbour the motor strip, it is mapped as a homunculus — lips and fingertips dominate the real estate.',
    functions: [
      'Touch, pressure, vibration & texture',
      'Proprioception — where your limbs are',
      'Temperature & nociception processing',
      'Tactile object identification',
    ],
    clinical: 'Lesions cause contralateral sensory loss and hemispatial neglect — patients may ignore food on the left side of their plate entirely.',
    fact: 'The sensory homunculus has no trunk proportion — gorilla-sized hands and lips, twig-sized legs.',
  },
  {
    id: 'parietal',
    name: 'Parietal Association Cortex',
    tagline: 'Spatial reality engine',
    location: 'Parietal lobe · angular & supramarginal gyri',
    hemisphere: 'Bilateral',
    color: '#C98A2C',
    position: [0, 0.42, -0.56],
    size: 0.26,
    deep: false,
    baseActivity: 50,
    neurons: '≈ 1.8B neurons',
    description:
      'Fuses vision, touch and proprioception into a unified spatial map. This is where “self” meets “world” — navigation, number sense, tool use and the geometry of attention live here.',
    functions: [
      'Spatial reasoning & navigation',
      'Mental rotation & geometry',
      'Numerical cognition & calculation',
      'Cross-modal sensory integration',
    ],
    clinical: 'The angular gyrus anchors reading and arithmetic — lesions can produce Gerstmann syndrome: finger agnosia, agraphia and dyscalculia.',
    fact: 'Einstein’s parietal lobes were found to be 15% wider than average — possibly the anatomy of spatial genius.',
  },
  {
    id: 'occipital',
    name: 'Occipital Lobe',
    tagline: 'The seeing machine',
    location: 'Occipital lobe · posterior pole',
    hemisphere: 'Bilateral',
    color: '#7A5A78',
    position: [0, 0.14, -0.84],
    size: 0.28,
    deep: false,
    baseActivity: 58,
    neurons: '≈ 1.5B neurons',
    description:
      'The brain’s visual engine. Raw photons arrive as electrical noise and leave as edges, faces, motion and meaning. Nearly 30% of human cortex is devoted to vision.',
    functions: [
      'Edge, orientation & motion detection',
      'Colour & depth perception',
      'Face and object recognition streams',
      'Visual attention gating',
    ],
    clinical: 'Bilateral lesions cause cortical blindness — eyes intact, signal perfect, but the world simply never renders. Anton syndrome patients deny being blind.',
    fact: 'Visual processing starts in V1 but meaning only exists ~40ms later in the ventral stream — you live in a rendered simulation.',
  },
  {
    id: 'temporal',
    name: 'Temporal Lobe',
    tagline: 'Sound, faces & meaning',
    location: 'Temporal lobe · lateral surface',
    hemisphere: 'Bilateral',
    color: '#A8543C',
    position: [0.8, -0.26, 0.05],
    size: 0.27,
    deep: false,
    baseActivity: 52,
    neurons: '≈ 1.6B neurons',
    description:
      'The great decoder. A1 decodes sound, fusiform gyrus decodes faces, and the surrounding cortex decodes semantic meaning — this is where the world becomes legible.',
    functions: [
      'Auditory processing & music',
      'Face recognition (fusiform gyrus)',
      'Semantic memory & object naming',
      'Emotional tone of voices',
    ],
    clinical: 'Fusiform damage causes prosopagnosia — loved ones become strangers with familiar voices. Right temporal strokes blunt musical perception.',
    fact: 'The “Jennifer Aniston neuron” — a single temporal-lobe neuron can fire selectively for a specific concept or person.',
  },
  {
    id: 'wernicke',
    name: 'Wernicke’s Area',
    tagline: 'Language comprehension',
    location: 'Posterior superior temporal gyrus · left',
    hemisphere: 'Left',
    color: '#93485C',
    position: [-0.76, -0.21, -0.25],
    size: 0.2,
    deep: false,
    baseActivity: 46,
    neurons: '≈ 0.4B neurons',
    description:
      'The dictionary of the brain. Wernicke’s area maps sound onto meaning — without it, speech arrives as fluent noise. Connected to Broca’s area by the arcuate fasciculus.',
    functions: [
      'Speech comprehension',
      'Semantic access & word meaning',
      'Reading comprehension relay',
      'Language monitoring',
    ],
    clinical: 'Wernicke’s aphasia: fluent, grammatical, gloriously empty speech — patients speak in confident word salad and cannot monitor it.',
    fact: 'Damage here and you can read the music but never hear the song in your own voice.',
  },
  {
    id: 'broca',
    name: 'Broca’s Area',
    tagline: 'The speech forge',
    location: 'Inferior frontal gyrus · left (Brodmann 44/45)',
    hemisphere: 'Left',
    color: '#B5653A',
    position: [-0.55, 0.0, 0.53],
    size: 0.2,
    deep: false,
    baseActivity: 47,
    neurons: '≈ 0.4B neurons',
    description:
      'Assembles grammar, organises phonemes and choreographs the motor plan for speech. Every hesitant “…um” and perfectly placed comma passes through here.',
    functions: [
      'Speech motor planning',
      'Grammar & syntax construction',
      'Verbal working memory',
      'Sign-language production',
    ],
    clinical: 'Broca’s aphasia: comprehension intact, utterance heroic — one-word sentences with tremendous effort. The patient knows exactly what they want to say.',
    fact: 'Broca’s area also activates when you listen to complex syntax — grammar is partly a production system run silently.',
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus',
    tagline: 'Memory’s writing desk',
    location: 'Medial temporal lobe · deep in the fold',
    hemisphere: 'Bilateral',
    color: '#B04A3A',
    position: [0.4, -0.4, -0.02],
    size: 0.21,
    deep: true,
    baseActivity: 55,
    neurons: '≈ 20M pyramidal cells',
    description:
      'A seahorse-shaped ledger that stamps experience into long-term storage. It does not keep memories forever — it replays them nightly until the cortex shelves them permanently.',
    functions: [
      'Forming new episodic memories',
      'Spatial mapping & navigation',
      'Consolidation during NREM sleep',
      'Pattern separation & completion',
    ],
    clinical: 'First structure destroyed in Alzheimer’s — and the epicentre of what was removed in patient H.M., who lived 55 years unable to form a new memory.',
    fact: 'London taxi drivers grow measurably larger hippocampi after memorising 25,000 streets — the brain literally repours itself.',
  },
  {
    id: 'amygdala',
    name: 'Amygdala',
    tagline: 'The threat detector',
    location: 'Medial temporal lobe · anterior to hippocampus',
    hemisphere: 'Bilateral',
    color: '#8E3B2F',
    position: [-0.4, -0.36, 0.28],
    size: 0.19,
    deep: true,
    baseActivity: 57,
    neurons: '≈ 13M neurons',
    description:
      'An almond-sized alarm system that tags every experience with emotional significance — especially fear. It can hijack the brain before the cortex ever gets a vote.',
    functions: [
      'Fear conditioning & threat detection',
      'Emotional salience tagging',
      'Fight / flight / freeze orchestration',
      'Emotional memory modulation',
    ],
    clinical: 'Hyperactive amygdalae drive PTSD hypervigilance and anxiety disorders. Rare bilateral lesions (Urbach–Wiethe) erase the capacity to feel fear entirely.',
    fact: 'Threat signals reach the amygdala ~12ms before they reach conscious cortex — you flinch first, decide later.',
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    tagline: 'The movement equalizer',
    location: 'Posterior fossa · beneath the occipital lobes',
    hemisphere: 'Bilateral',
    color: '#5F8280',
    position: [0, -0.66, -0.58],
    size: 0.3,
    deep: false,
    baseActivity: 60,
    neurons: '≈ 69B neurons — 80% of the brain!',
    description:
      'Outnumbers the rest of the brain combined. The cerebellum runs the error-correction loop for every movement you make — timing, balance and coordination, recalculated 50 times a second.',
    functions: [
      'Balance & postural control',
      'Motor learning & error correction',
      'Timing of movement and speech',
      'Procedural skill automation',
    ],
    clinical: 'Cerebellar stroke produces drunken gait, intention tremor and slurred “scanning” speech — coordination without weakness.',
    fact: 'You contain ~86 billion neurons; 69 billion are in the cerebellum, folding an entire cortical surface into a fist-sized structure.',
  },
  {
    id: 'brainstem',
    name: 'Brainstem',
    tagline: 'Life’s autopilot',
    location: 'Posterior cranial fossa · midbrain → medulla',
    hemisphere: 'Bilateral',
    color: '#8A8378',
    position: [0, -0.66, 0.28],
    size: 0.21,
    deep: false,
    baseActivity: 66,
    neurons: '≈ 190M neurons + nuclei',
    description:
      'Three centimetres of ancient circuitry keeping you alive — heartbeat, breath, arousal and consciousness. Reticular activating system lives here: damage it and the lights simply go out.',
    functions: [
      'Cardiac & respiratory rhythm',
      'Consciousness & arousal (RAS)',
      'Swallowing, gag reflex & vestibular relay',
      'Cranial nerve highways (III–XII)',
    ],
    clinical: 'Brainstem strokes are catastrophic — locked-in syndrome, coma or respiratory arrest. Even tiny lesions silence the whole cortex.',
    fact: 'Your heartbeat has never once asked your permission — the brainstem runs it since before your first breath.',
  },
];

export const REGION_MAP: Record<RegionId, BrainRegion> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
) as Record<RegionId, BrainRegion>;
