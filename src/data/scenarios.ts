import type { RegionId } from './regions';

export type ScenarioAnimation =
  | 'baseline'
  | 'tremor'
  | 'seizure'
  | 'hypofunction'
  | 'calm'
  | 'slowwave'
  | 'hijack'
  | 'lesion';

export interface EEGBands {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface NeuroScenario {
  id: string;
  name: string;
  category: string;
  tagline: string;
  color: string;
  severity: 'NOMINAL' | 'CRITICAL' | 'ONCOURSE';
  tag: string;
  description: string;
  mechanism: string[];
  clinical: string[];
  eeg: EEGBands;
  neurotransmitters: {
    dopamine: number;
    serotonin: number;
    cortisol: number;
    gaba: number;
    acetylcholine: number;
    norepinephrine: number;
  };
  metrics: {
    signalEfficiency: number;
    focusIndex: number;
    neuralSync: number;
    plasticity: number;
  };
  /** overrides for the per-region activity meters (0–100) */
  regionActivity: Partial<Record<RegionId, number>>;
  animation: ScenarioAnimation;
  aiSeed: string;
  pearl: string;
  onset: string;
  prevalence: string;
}

export const SCENARIOS: NeuroScenario[] = [
  {
    id: 'baseline',
    name: 'Awakened Baseline',
    category: 'HEALTHY',
    tagline: 'Resting conscious state',
    color: '#C9A961',
    severity: 'NOMINAL',
    tag: 'CTRL-01',
    description:
      'Relaxed wakefulness with eyes open. Alpha activity idles, beta shimmers, and ~86 billion neurons trade 10 quadrillion synaptic whispers per second — a symphony you never notice.',
    mechanism: [
      'Reticular activating system maintains cortical arousal via the brainstem',
      'Default-mode ↔ task-positive networks alternate every few seconds',
      'Balanced glutamate (excitatory) and GABA (inhibitory) tone',
      'Acetylcholine and norepinephrine hold signal-to-noise high',
    ],
    clinical: ['Normal EEG: posterior alpha rhythm 8–12 Hz, attenuated on eye opening', 'Symmetrical hemispheric activity', 'No epileptiform discharges'],
    eeg: { delta: 8, theta: 14, alpha: 38, beta: 42, gamma: 18 },
    neurotransmitters: { dopamine: 62, serotonin: 66, cortisol: 30, gaba: 58, acetylcholine: 64, norepinephrine: 55 },
    metrics: { signalEfficiency: 84, focusIndex: 78, neuralSync: 81, plasticity: 72 },
    regionActivity: {},
    animation: 'baseline',
    aiSeed: 'What does a healthy EEG look like?',
    pearl: 'Your brain burns ~20 watts — about one dim lightbulb — while outcomputing every supercomputer ever built.',
    onset: '—',
    prevalence: 'Everyone, most of the day',
  },
  {
    id: 'sleep',
    name: 'Deep NREM Sleep',
    category: 'SLEEP',
    tagline: 'Glymphatic rinse cycle',
    color: '#6B6E8E',
    severity: 'ONCOURSE',
    tag: 'SLP-03',
    description:
      'Stage 3 slow-wave sleep. Thalamus stops relaying the world, delta waves sweep the cortex at 0.5–2 Hz, and cerebrospinal fluid washes metabolic debris — including beta-amyloid — out of the brain.',
    mechanism: [
      'Thalamic reticular nucleus blocks sensory relay → cortical silence',
      'Slow oscillations synchronise hippocampal replay → memory consolidation',
      'Glymphatic flow increases ~60% — the brain’s only self-cleaning cycle',
      'Growth hormone peaks — tissue repair at the cellular level',
    ],
    clinical: ['High-voltage delta (0.5–2 Hz) dominates >20% of the epoch', 'K-complexes and sleep spindles on the N2 boundary', 'Muscle atonia absent — you can still move, rarely do'],
    eeg: { delta: 88, theta: 30, alpha: 6, beta: 4, gamma: 2 },
    neurotransmitters: { dopamine: 12, serotonin: 28, cortisol: 8, gaba: 78, acetylcholine: 15, norepinephrine: 10 },
    metrics: { signalEfficiency: 34, focusIndex: 8, neuralSync: 88, plasticity: 95 },
    regionActivity: { prefrontal: 14, motor: 6, somatosensory: 8, parietal: 10, occipital: 8, temporal: 12, wernicke: 6, broca: 5, hippocampus: 68, amygdala: 22, cerebellum: 12, brainstem: 58 },
    animation: 'slowwave',
    aiSeed: 'Why do we need deep sleep?',
    pearl: 'Sleep is the only known glymphatic detox — skip it and beta-amyloid literally accumulates faster.',
    onset: 'Cycle 3–4 of the night',
    prevalence: '~20% of total sleep time',
  },
  {
    id: 'meditation',
    name: 'Zen Meditation',
    category: 'CONSCIOUSNESS',
    tagline: 'Coherent calm focus',
    color: '#6E8B6B',
    severity: 'NOMINAL',
    tag: 'ZEN-08',
    description:
      'Expert meditators show globally coherent alpha and theta — a state of relaxed alertness. Default-mode chatter (mind-wandering) quiets, and the amygdala unhooks from threat.',
    mechanism: [
      'Default-mode network (mind-wandering) deactivates ~40%',
      'Frontal midline theta coherence rises — sustained attention',
      'Amygdala reactivity dampens; prefrontal regulation strengthens',
      'GABA tone rises — an anxiolytic state without drugs',
    ],
    clinical: ['Increased frontal theta & posterior alpha coherence', 'Reduced amygdala BOLD response to aversive stimuli', 'Measurable grey-matter gain in hippocampus after 8 weeks (MBSR)'],
    eeg: { delta: 10, theta: 46, alpha: 58, beta: 14, gamma: 22 },
    neurotransmitters: { dopamine: 48, serotonin: 78, cortisol: 12, gaba: 82, acetylcholine: 40, norepinephrine: 22 },
    metrics: { signalEfficiency: 79, focusIndex: 88, neuralSync: 92, plasticity: 76 },
    regionActivity: { prefrontal: 58, hippocampus: 40, amygdala: 14 },
    animation: 'calm',
    aiSeed: 'What does meditation do to the brain?',
    pearl: 'Eight weeks of mindfulness measurably thickens hippocampal grey matter and thins the amygdala.',
    onset: '~12 minutes of practice',
    prevalence: 'Practised by 200M+ humans daily',
  },
  {
    id: 'epilepsy',
    name: 'Temporal Lobe Seizure',
    category: 'CRITICAL',
    tagline: 'Runaway synchronisation',
    color: '#93485C',
    severity: 'CRITICAL',
    tag: 'SZR-11',
    description:
      'A hyper-synchronous storm. Thousands of neurons fire in lockstep, recruiting neighbouring cortex in a propagating wave — aura, déjà vu, then motor and autonomic chaos.',
    mechanism: [
      'Paroxysmal depolarising shift — neurons fire 500 Hz bursts',
      'GABA inhibition fails locally → regenerative recruitment wave',
      'Kindling: each seizure lowers threshold for the next',
      'Spread: temporal → limbic → bilateral motor cortex within seconds',
    ],
    clinical: ['Ictal EEG: rhythmic 3–5 Hz sharp activity building to 10 Hz', 'Postictal suppression follows the storm', 'Status epilepticus = >5 min continuous activity — a neurological emergency'],
    eeg: { delta: 18, theta: 26, alpha: 4, beta: 38, gamma: 96 },
    neurotransmitters: { dopamine: 30, serotonin: 24, cortisol: 78, gaba: 9, acetylcholine: 70, norepinephrine: 88 },
    metrics: { signalEfficiency: 7, focusIndex: 2, neuralSync: 100, plasticity: 18 },
    regionActivity: { temporal: 100, wernicke: 96, amygdala: 92, hippocampus: 88, prefrontal: 30, broca: 64, brainstem: 70 },
    animation: 'seizure',
    aiSeed: 'Why do seizures happen?',
    pearl: 'A seizure is the brain sings in unison — 100 million neurons, one note, zero harmony.',
    onset: 'Seconds — often an “aura” of déjà vu or rising epigastric warmth',
    prevalence: '~1 in 26 people develop epilepsy in their lifetime',
  },
  {
    id: 'alzheimers',
    name: 'Alzheimer’s Disease',
    category: 'NEURODEGENERATIVE',
    tagline: 'Memory’s lights going out',
    color: '#A8543C',
    severity: 'CRITICAL',
    tag: 'AD-26',
    description:
      'Amyloid plaques and tau tangles strangle synapses, beginning in the hippocampus and entorhinal cortex. Acetylcholine collapses; the brain archives fewer and fewer pages until the library empties.',
    mechanism: [
      'Beta-amyloid oligomers clog synaptic clefts → signal decay',
      'Tau hyperphosphorylation → neurofibrillary tangles → cell death',
      'Cholinergic basal forebrain degeneration → acetylcholine −70%',
      'Hippocampal atrophy ~5%/year — anterograde memory erodes first',
    ],
    clinical: ['EEG: generalised slowing, reduced alpha, loss of reactivity', 'MRI: hippocampal and cortical atrophy (MTA score ≥2)', 'PET: temporoparietal hypometabolism + amyloid burden'],
    eeg: { delta: 42, theta: 44, alpha: 12, beta: 10, gamma: 3 },
    neurotransmitters: { dopamine: 41, serotonin: 38, cortisol: 46, gaba: 44, acetylcholine: 18, norepinephrine: 35 },
    metrics: { signalEfficiency: 31, focusIndex: 24, neuralSync: 29, plasticity: 16 },
    regionActivity: { hippocampus: 12, wernicke: 28, temporal: 26, prefrontal: 30, parietal: 24, occipital: 30, amygdala: 34 },
    animation: 'hypofunction',
    aiSeed: 'What causes Alzheimer’s disease?',
    pearl: 'By the time symptoms appear, the hippocampus has already lost a quarter of its neurons — plaques whisper for decades.',
    onset: 'Insidious — 10–15 years before diagnosis',
    prevalence: '~55 million people worldwide live with dementia',
  },
  {
    id: 'parkinsons',
    name: 'Parkinson’s Disease',
    category: 'NEURODEGENERATIVE',
    tagline: 'The dopamine drought',
    color: '#C98A2C',
    severity: 'CRITICAL',
    tag: 'PD-14',
    description:
      'Dopaminergic neurons in the substantia nigra die off. With the fuel line cut, movements become slow, rigid and tremulous — a hand that knows the way but cannot deliver the signal.',
    mechanism: [
      'Lewy bodies (α-synuclein) corrode substantia nigra neurons',
      'Dopamine −70–80% before motor symptoms emerge',
      'Basal ganglia direct pathway silenced → bradykinesia & rigidity',
      'Beta-band oscillation excess (15–30 Hz) → 4–6 Hz resting tremor',
    ],
    clinical: ['Pill-rolling resting tremor, 4–6 Hz, suppressed by action', 'Cogwheel rigidity + bradykinesia (UK Brain Bank criteria)', 'DaTscan: asymmetric striatal dopamine transporter uptake'],
    eeg: { delta: 12, theta: 20, alpha: 24, beta: 58, gamma: 8 },
    neurotransmitters: { dopamine: 14, serotonin: 45, cortisol: 38, gaba: 52, acetylcholine: 74, norepinephrine: 48 },
    metrics: { signalEfficiency: 42, focusIndex: 55, neuralSync: 38, plasticity: 30 },
    regionActivity: { motor: 34, somatosensory: 40, cerebellum: 26, prefrontal: 44, brainstem: 48 },
    animation: 'tremor',
    aiSeed: 'Why do hands tremble in Parkinson’s?',
    pearl: 'You lose 70% of your dopamine neurons before the first tremor — the system was buffered, then bankrupt.',
    onset: 'Insidious, asymmetric — one hand first',
    prevalence: '~10 million people worldwide; 1–2% of over-60s',
  },
  {
    id: 'stroke',
    name: 'Broca’s Aphasia (Stroke)',
    category: 'VASCULAR',
    tagline: 'Speech behind a locked door',
    color: '#B5653A',
    severity: 'CRITICAL',
    tag: 'CVA-39',
    description:
      'A middle-cerebral-artery clot starves the left inferior frontal gyrus. Comprehension survives; the machinery of utterance does not — every word must be wrenched past an ischemic gate.',
    mechanism: [
      'MCA occlusion → left Brodmann 44/45 ischemia within minutes',
      'Motor speech planning network goes silent — Broca offline',
      'Arcuate fasciculus severed — Wernicke cannot hand off to Broca',
      'Surrounding penumbra is salvageable — time is brain (1.9M neurons/min)',
    ],
    clinical: ['Non-fluent, effortful, telegraphic speech — comprehension intact', 'CT within 25 min excludes hemorrhage; MRI DWI confirms infarct', 'tPA window 4.5 h — beyond that, mechanical thrombectomy'],
    eeg: { delta: 34, theta: 38, alpha: 18, beta: 12, gamma: 4 },
    neurotransmitters: { dopamine: 35, serotonin: 40, cortisol: 60, gaba: 38, acetylcholine: 45, norepinephrine: 62 },
    metrics: { signalEfficiency: 28, focusIndex: 40, neuralSync: 22, plasticity: 44 },
    regionActivity: { broca: 4, wernicke: 55, temporal: 48, prefrontal: 40, motor: 30 },
    animation: 'lesion',
    aiSeed: 'What happens in a Broca’s stroke?',
    pearl: 'Every minute untreated, 1.9 million neurons die permanently — stroke is a fire, not a leak.',
    onset: 'Seconds to minutes — “FAST”: Face, Arms, Speech, Time',
    prevalence: '1 in 4 adults will have a stroke in their lifetime',
  },
  {
    id: 'stress',
    name: 'Amygdala Hijack',
    category: 'STRESS AXIS',
    tagline: 'When fear drives the bus',
    color: '#8E3B2F',
    severity: 'CRITICAL',
    tag: 'STX-47',
    description:
      'Chronic stress floods the system with cortisol. The amygdala fattens and shouts, the prefrontal cortex starves and whispers — reactivity replaces reason, and the body pays the invoice.',
    mechanism: [
      'HPA axis: hypothalamus → pituitary → adrenal → cortisol surge',
      'Amygdala dendrites hypertrophy — threat sensitivity dials up',
      'Prefrontal & hippocampal dendrites atrophy — regulation dials down',
      'Chronic cortisol impairs memory consolidation and immunity',
    ],
    clinical: ['Elevated salivary cortisol & dehydroepiandrosterone ratio', 'fMRI: amygdala hyperreactivity + reduced dlPFC coupling', 'Linked to anxiety, insomnia, hypertension and accelerated cellular ageing'],
    eeg: { delta: 6, theta: 22, alpha: 16, beta: 64, gamma: 34 },
    neurotransmitters: { dopamine: 34, serotonin: 28, cortisol: 94, gaba: 21, acetylcholine: 58, norepinephrine: 90 },
    metrics: { signalEfficiency: 48, focusIndex: 30, neuralSync: 35, plasticity: 28 },
    regionActivity: { amygdala: 100, prefrontal: 18, hippocampus: 30, brainstem: 78 },
    animation: 'hijack',
    aiSeed: 'What is an amygdala hijack?',
    pearl: 'Cortisol is gasoline for memory of fear — one intense fright can be encoded for life in a single trial.',
    onset: 'Seconds — the heartbeat you feel before you know why',
    prevalence: 'Chronic stress affects ~1 in 3 adults globally',
  },
];

export const SCENARIO_MAP: Record<string, NeuroScenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);
