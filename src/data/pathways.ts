import type { RegionId } from './regions';

export interface PathwayStep {
  from: RegionId;
  to: RegionId;
  label: string;
  blurb: string;
  /** traversal time of the pulse for this hop, ms */
  ms: number;
}

export interface NeuralPathway {
  id: string;
  name: string;
  tagline: string;
  color: string;
  description: string;
  insight: string;
  steps: PathwayStep[];
}

export const PATHWAYS: NeuralPathway[] = [
  {
    id: 'language-loop',
    name: 'The Language Arc',
    tagline: 'Read a word aloud, end-to-end',
    color: '#B5653A',
    description:
      'Follow a single word from the photon that strikes the retina to the breath that shapes it into sound — four cortical stations, one ~120 ms relay race.',
    insight: 'Damage any relay and the word breaks: blindness (V1), word salad (Wernicke), inability to speak (Broca), or silent thought with no voice (Motor).',
    steps: [
      { from: 'occipital', to: 'wernicke', label: 'Visual word form → meaning', blurb: 'V1 extracts the letter shapes; the angular gyrus & Wernicke map them onto semantics.', ms: 1500 },
      { from: 'wernicke', to: 'broca', label: 'Meaning → grammatical plan', blurb: 'The arcuate fasciculus ferries the concept forward; Broca assembles syntax and phoneme order.', ms: 1500 },
      { from: 'broca', to: 'motor', label: 'Plan → articulation', blurb: 'Facial, tongue and laryngeal muscle maps in the precentral gyrus receive the motor program.', ms: 1500 },
      { from: 'motor', to: 'brainstem', label: 'Cortex → cranial nerves', blurb: 'Corticobulbar tracts synapse in the brainstem — CN V, VII, IX, X, XII — firing your voice.', ms: 1200 },
    ],
  },
  {
    id: 'fear-circuit',
    name: 'The Fear Shortcut',
    tagline: 'Why you flinch before you think',
    color: '#8E3B2F',
    description:
      'The amygdala receives a raw threat feed two synapses from the thalamus — beating conscious cortex by ~12 ms. Fear is a prediction, not a deduction.',
    insight: 'The “low road” reacts in 12 ms; the “high road” appraises in ~500 ms. Anxiety disorders are what happens when the low road never stands down.',
    steps: [
      { from: 'occipital', to: 'amygdala', label: 'LOW ROAD — raw threat alarm', blurb: 'Thalamus forwards a smeared, pre-cortical sketch: “snake?” — amygdala floods the body with adrenaline.', ms: 1000 },
      { from: 'amygdala', to: 'brainstem', label: 'Fight / flight ignition', blurb: 'Periaqueductal gray and medulla take over: heart rate +40%, pupils dilate, digestion halts.', ms: 1100 },
      { from: 'occipital', to: 'prefrontal', label: 'HIGH ROAD — cortical appraisal', blurb: 'V1→V2→IT build the fine-grained verdict: garden hose, not cobra.', ms: 1300 },
      { from: 'prefrontal', to: 'amygdala', label: 'The veto', blurb: 'Ventromedial prefrontal cortex inhibits the amygdala — exhale. Extinction learning lives here.', ms: 1400 },
    ],
  },
  {
    id: 'memory-loop',
    name: 'Memory Consolidation',
    tagline: 'How a day becomes a decade',
    color: '#A8543C',
    description:
      'Every night, the hippocampus replays the day at 20× speed to the cortex, teaching neocortical networks to shelve episodes as durable semantic memory.',
    insight: 'This is why cramming before an exam never beats sleep after it — consolidation is an active, overnight file-transfer you cannot rush.',
    steps: [
      { from: 'hippocampus', to: 'prefrontal', label: 'Sharp-wave ripple replay', blurb: 'Ripple events (120–200 Hz) replay hippocampal trajectories — the day’s greatest hits, compressed.', ms: 1500 },
      { from: 'prefrontal', to: 'parietal', label: 'Semantic distribution', blurb: 'Frontal-parietal networks tag what matters — facts to knowledge, episodes to stories.', ms: 1300 },
      { from: 'parietal', to: 'temporal', label: 'Neocortical shelving', blurb: 'Schema-consistent traces bind into temporal cortex — the hippocampus’s job is now done.', ms: 1300 },
      { from: 'temporal', to: 'hippocampus', label: 'Index pointer written', blurb: 'A sparse hippocampal “pointer” remains — pattern completion can reassemble the whole episode.', ms: 1400 },
    ],
  },
  {
    id: 'motor-loop',
    name: 'The Cerebellar Governor',
    tagline: 'Error correction at 50 Hz',
    color: '#5F8280',
    description:
      'Every movement you make is a prediction. The cerebellum compares intended motion with actual proprioceptive reality 50×/second and corrects mid-flight.',
    insight: 'Cerebellar patients can intend a smooth reach but cannot execute it — intention without error-correction is oscillation, not movement.',
    steps: [
      { from: 'prefrontal', to: 'motor', label: 'Volition → motor plan', blurb: '“Reach for the cup.” The plan descends the corticospinal tract.', ms: 1200 },
      { from: 'motor', to: 'cerebellum', label: 'Efference copy dispatched', blurb: 'A duplicate of the motor command is routed to the cerebellum milliseconds before muscles fire.', ms: 1200 },
      { from: 'cerebellum', to: 'somatosensory', label: 'Reality report', blurb: 'Proprioceptive feedback streams in — where the hand actually is right now.', ms: 1200 },
      { from: 'cerebellum', to: 'motor', label: 'Correction pulse', blurb: 'Mismatch detected → corrective signal returns — mid-reach, 20 ms before error.', ms: 1200 },
    ],
  },
];

export const PATHWAY_MAP: Record<string, NeuralPathway> = Object.fromEntries(
  PATHWAYS.map((p) => [p.id, p]),
);
