import type { BodyPartId } from './bodySystems';

export interface FullBodyPathwayHop {
  fromId: BodyPartId;
  toId: BodyPartId;
  fromName: string;
  toName: string;
  label: string;
  blurb: string;
  velocityMs: string; // e.g. "110 m/s"
  nerveTrack: string;
  durationMs: number;
}

export interface FullBodyNeuralCascade {
  id: string;
  name: string;
  tagline: string;
  category: 'SENSORY' | 'MOTOR' | 'AUTONOMIC' | 'REFLEX';
  color: string;
  overview: string;
  physiologicalImpact: string;
  hops: FullBodyPathwayHop[];
}

export const FULL_BODY_CASCADES: FullBodyNeuralCascade[] = [
  {
    id: 'pain-withdrawal',
    name: 'Foot Stepping on Pin — Spinal Reflex & Cortical Pain',
    tagline: 'High-speed 15 ms reflex arc + 250 ms conscious scream',
    category: 'REFLEX',
    color: '#802838',
    overview:
      'Step on a sharp glass shard or nail. High-threshold nociceptive A-delta and C-fibers fire instantaneously, eliciting a polysynaptic spinal flexor withdrawal and crossed-extensor reflex before the brain even receives the first pain signal.',
    physiologicalImpact:
      'Your leg pulls up before you think: spinal motor neurons fire at 15 ms. The slow spinothalamic tract reaches the thalamus and primary somatosensory cortex at 200 ms, where conscious suffering and vocalization occur.',
    hops: [
      {
        fromId: 'touch-receptors',
        toId: 'tibial-nerve',
        fromName: 'Cutaneous Pain Receptors',
        toName: 'Tibial & Sciatic Nerve Trunk',
        label: 'A-delta / C-Fiber Nociceptive Spike',
        blurb: 'High-threshold mechanonociceptors depolarize with massive sodium influx, sending high-frequency bursts up the tibial nerve.',
        velocityMs: '30–70 m/s',
        nerveTrack: 'A-delta myelinated nociceptive fibers',
        durationMs: 1200,
      },
      {
        fromId: 'tibial-nerve',
        toId: 'spinal-cord',
        fromName: 'Sciatic Nerve Trunk',
        toName: 'Lumbar Spinal Cord (L4–S1)',
        label: 'Dorsal Horn Synapse & Polysynaptic Reflex',
        blurb: 'Enters substantia gelatinosa (Rexed lamina II), synapsing on excitatory interneurons that drive ipsilateral hamstring flexors and inhibit quadriceps.',
        velocityMs: '80 m/s',
        nerveTrack: 'Dorsal Root Ganglion → Anterior Horn Interneurons',
        durationMs: 1400,
      },
      {
        fromId: 'spinal-cord',
        toId: 'brain',
        fromName: 'Lumbar Cord',
        toName: 'Cerebrum (S1 Somatosensory Cortex)',
        label: 'Spinothalamic Ascent → Conscious Agony',
        blurb: 'Second-order axons decussate in the anterior white commissure and ascend the lateral spinothalamic tract to VPL thalamus and S1 cortex.',
        velocityMs: '20–40 m/s',
        nerveTrack: 'Lateral Spinothalamic Tract → Thalamocortical Projections',
        durationMs: 1600,
      },
      {
        fromId: 'brain',
        toId: 'vagus-nerve',
        fromName: 'Prefrontal / Limbic Cortex',
        toName: 'Autonomic Outflow (Vagus & Sympathetic)',
        label: 'Sympathetic Alarm & Vocal Outcry',
        blurb: 'Amygdala and insula trigger systemic catecholamine release: sudden heart rate spike, vocalization, and motor defense posture.',
        velocityMs: '100 m/s',
        nerveTrack: 'Corticobulbar & Hypothalamospinal tracts',
        durationMs: 1300,
      },
    ],
  },
  {
    id: 'voluntary-reach-grab',
    name: 'Voluntary Precision Reach & Touch Verification',
    tagline: 'From visual volition to 50 Hz mechanoreceptor grip closure',
    category: 'MOTOR',
    color: '#2457C5',
    overview:
      'Deciding to pick up a fragile crystal wine glass. Motor cortex constructs the voluntary reach command, fires down the lateral corticospinal tract, routes through brachial plexus to the median and radial nerves, and calibrates grip force in real time via cutaneous fingertip feedback.',
    physiologicalImpact:
      'Corticospinal tracts fire down the spinal cord to C5-T1. Radial nerve dorsiflexes the wrist while median nerve coordinates opposition of thumb and index fingers. Fingertip Merkel discs feed back micro-slippage at 50 Hz to avoid crushing the glass.',
    hops: [
      {
        fromId: 'brain',
        toId: 'spinal-cord',
        fromName: 'Motor Cortex (M1)',
        toName: 'Cervical Spinal Cord (C5–T1)',
        label: 'Corticospinal Volition Descent',
        blurb: 'Pyramidal cells fire down through internal capsule, decussate in the medullary pyramids (90%), and descend lateral corticospinal tracts.',
        velocityMs: '110 m/s',
        nerveTrack: 'Lateral Corticospinal Tract (Upper Motor Neurons)',
        durationMs: 1300,
      },
      {
        fromId: 'spinal-cord',
        toId: 'brachial-plexus',
        fromName: 'Cervical Cord',
        toName: 'Brachial Plexus Highway',
        label: 'Spinal Root & Plexus Distribution',
        blurb: 'C5-T1 anterior horn lower motor neurons fire, routing through ventral roots into the upper, middle, and lower trunks of the brachial plexus.',
        velocityMs: '95 m/s',
        nerveTrack: 'Anterior Primary Rami & Plexus Cords',
        durationMs: 1200,
      },
      {
        fromId: 'brachial-plexus',
        toId: 'median-nerve',
        fromName: 'Brachial Plexus',
        toName: 'Median & Radial Nerve Axes',
        label: 'Limb Extension & Digital Precision Grip',
        blurb: 'Radial nerve stabilizes the wrist in 25° dorsiflexion while median nerve drives thenar opposition and flexor digitorum profundus pinch.',
        velocityMs: '60 m/s',
        nerveTrack: 'Median & Radial Peripheral Nerve Trunks',
        durationMs: 1400,
      },
      {
        fromId: 'median-nerve',
        toId: 'touch-receptors',
        fromName: 'Fingertip Efferent Junction',
        toName: 'Cutaneous Mechanoreceptor Disc Matrix',
        label: 'Tactile Contact & Micro-Slip Regulation',
        blurb: 'Meissner and Merkel corpuscles detect micro-shear upon glass contact, transmitting instant afferent feedback to prevent slippage without crushing.',
        velocityMs: '70 m/s',
        nerveTrack: 'Cutaneous A-beta Sensory Afferents',
        durationMs: 1300,
      },
    ],
  },
  {
    id: 'sympathetic-fight-flight',
    name: 'Sudden Apex Threat — Full-Body Autonomic Surge',
    tagline: '0 to 180 bpm in 800 ms: Adrenal flood & visceral shutdown',
    category: 'AUTONOMIC',
    color: '#9C6B30',
    overview:
      'Encountering a sudden life-threatening emergency. Amygdala activates the hypothalamic-pituitary-adrenal (HPA) axis and sympathetic preganglionics, firing down the sympathetic chain, flooding the cardiac plexus, dilating airways, and releasing systemic adrenaline while halting digestion.',
    physiologicalImpact:
      'Heart rate jumps from 70 to 160+ bpm, bronchioles dilate for maximum VO2 intake, splanchnic circulation constricts by 80% to shunt blood into femoral/brachial skeletal muscles, and adrenal glands release grams of catecholamines.',
    hops: [
      {
        fromId: 'brain',
        toId: 'spinal-cord',
        fromName: 'Limbic Amygdala & Hypothalamus',
        toName: 'Thoracolumbar Intermediolateral Horn (T1–L2)',
        label: 'Central Autonomic Outflow Descent',
        blurb: 'Paraventricular nucleus and locus coeruleus drive sympathetic preganglionic neurons in the lateral horn across the entire spinal cord.',
        velocityMs: '90 m/s',
        nerveTrack: 'Hypothalamospinal Tract',
        durationMs: 1200,
      },
      {
        fromId: 'spinal-cord',
        toId: 'cardiac-plexus',
        fromName: 'Thoracic Spinal Cord (T1–T4)',
        toName: 'Cardiac Autonomic Plexus',
        label: 'Adrenergic SA Node Acceleration',
        blurb: 'Sympathetic postganglionics release norepinephrine onto beta-1 receptors: SA node fires at 160 bpm, ventricular contractility jumps 60%.',
        velocityMs: '85 m/s',
        nerveTrack: 'Superior, Middle & Inferior Cervical Cardiac Nerves',
        durationMs: 1300,
      },
      {
        fromId: 'spinal-cord',
        toId: 'renal-adrenal',
        fromName: 'Thoracic Splanchnic Roots',
        toName: 'Adrenal Medullary Chromaffin Cells',
        label: 'Systemic Adrenaline & Noradrenaline Flood',
        blurb: 'Greater splanchnic nerve directly fires cholinergic synapses on adrenal chromaffin cells, discharging 80% epinephrine into the vena cava.',
        velocityMs: '90 m/s',
        nerveTrack: 'Greater Splanchnic Nerve',
        durationMs: 1400,
      },
      {
        fromId: 'renal-adrenal',
        toId: 'enteric-gut',
        fromName: 'Adrenal / Celiac Hub',
        toName: 'Enteric Gut & Visceral Vasculature',
        label: 'Visceral Peristalsis Arrest & Muscular Shunt',
        blurb: 'Massive alpha-1 vasoconstriction shuts down mesenteric gut blood flow by 80%, redirecting oxygenated arterial blood to femoral and arm muscles.',
        velocityMs: '75 m/s',
        nerveTrack: 'Splanchnic Vasoconstrictor Postganglionic Plexus',
        durationMs: 1500,
      },
    ],
  },
  {
    id: 'gut-brain-serotonin',
    name: 'The Gut-Brain Vagal Highway',
    tagline: 'How 500 million enteric neurons sculpt mental state & mood',
    category: 'AUTONOMIC',
    color: '#8A3B60',
    overview:
      'The human gastrointestinal tract produces over 90% of the body’s serotonin. Enterochromaffin cells sense luminal microbiome metabolites, stimulating mucosal vagal afferent nerve endings that project straight into the brainstem nucleus tractus solitarii (NTS) to modulate mood, anxiety, and satiety.',
    physiologicalImpact:
      'Microbial short-chain fatty acids (SCFAs) trigger vagal afferent firing. Signals reach the medulla oblongata, cross to the locus coeruleus and limbic structures, fundamentally altering emotional resilience and cognitive clarity.',
    hops: [
      {
        fromId: 'enteric-gut',
        toId: 'vagus-nerve',
        fromName: 'Enteric Myenteric & Submucosal Plexuses',
        toName: 'Vagus Nerve Afferent Corridor (CN X)',
        label: 'Microbial Metabolite & Serotonin Transduction',
        blurb: 'Enterochromaffin cells discharge serotonin onto 5-HT3 receptors on nodose ganglion pseudounipolar vagal terminals.',
        velocityMs: '20–40 m/s',
        nerveTrack: 'Sensory Vagal Afferents (80% of vagal fibers)',
        durationMs: 1400,
      },
      {
        fromId: 'vagus-nerve',
        toId: 'cranial-nerves',
        fromName: 'Vagus Trunk',
        toName: 'Brainstem (Nucleus Tractus Solitarii - NTS)',
        label: 'Medullary Autonomic Sensory Gateway',
        blurb: 'Vagal fibers enter jugular foramen and synapse in the NTS, the central relay hub for all visceral sensory data.',
        velocityMs: '50 m/s',
        nerveTrack: 'Solitary Tract & Nucleus Tractus Solitarii',
        durationMs: 1300,
      },
      {
        fromId: 'cranial-nerves',
        toId: 'brain',
        fromName: 'Brainstem NTS Hub',
        toName: 'Limbic System, Insula & Prefrontal Cortex',
        label: 'Mood, Satiety & Neuroinflammation Tuning',
        blurb: 'Ascending parabrachial and thalamocortical tracts project to anterior insula and amygdala, modulating emotional valence and stress resilience.',
        velocityMs: '80 m/s',
        nerveTrack: 'Parabrachial-Limbic Ascending Pathway',
        durationMs: 1500,
      },
      {
        fromId: 'brain',
        toId: 'cardiac-plexus',
        fromName: 'Central Parasympathetic Outflow',
        toName: 'Cardiac Vagal Brake & Heart Rate Variability (HRV)',
        label: 'Vagal Tone Boost & Autonomic Coherence',
        blurb: 'Efferent preganglionic fibers from dorsal motor nucleus and nucleus ambiguus decelerate cardiac pacemaker, elevating Heart Rate Variability (HRV).',
        velocityMs: '60 m/s',
        nerveTrack: 'Cardiac Vagal Efferent Filaments',
        durationMs: 1300,
      },
    ],
  },
];
