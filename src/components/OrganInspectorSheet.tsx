import { useState } from 'react';
import {
  Heart,
  Activity,
  Play,
  Pause,
  Scissors,
  Eye,
  Info,
  Sparkles,
  HelpCircle,
  Stethoscope,
  Maximize2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { OrganViewKey } from '../three/AnatomyAtlasScene';
import type { AnatomicalPin } from '../three/AnatomyAtlasScene';
import { askNeuroAI } from '../data/knowledge';

interface OrganInspectorSheetProps {
  currentView: OrganViewKey;
  isBeating: boolean;
  onToggleBeating: () => void;
  isBreathing: boolean;
  onToggleBreathing: () => void;
  isCutaway: boolean;
  onToggleCutaway: () => void;
  selectedPin: AnatomicalPin | null;
  onClearPin: () => void;
}

interface OrganData {
  title: string;
  latin: string;
  category: string;
  summary: string;
  metrics: { label: string; value: string; unit?: string }[];
  arterialSupply: string;
  innervation: string;
  histology: string;
  pathologies: string[];
  referenceImages?: { title: string; url: string }[];
}

const ORGAN_METADATA: Record<OrganViewKey, OrganData> = {
  heart: {
    title: 'Human Heart & Great Vessels',
    latin: 'Cor humanum',
    category: 'Cardiovascular Circulatory Engine',
    summary:
      'A 4-chambered double-muscular pump operating in series. The right heart delivers deoxygenated blood to the low-pressure pulmonary circulation, while the left ventricle drives high-pressure systemic perfusion.',
    metrics: [
      { label: 'Cardiac Output', value: '5.0', unit: 'L / min' },
      { label: 'Resting Rate', value: '72', unit: 'bpm' },
      { label: 'Stroke Volume', value: '70', unit: 'mL / beat' },
      { label: 'Peak Pressure', value: '120 / 80', unit: 'mmHg' },
    ],
    arterialSupply:
      'Left Anterior Descending (LAD), Circumflex Artery, and Right Coronary Artery (RCA) originating from the aortic sinuses of Valsalva.',
    innervation:
      'Dual Autonomic: Parasympathetic cardiac branches of the Vagus Nerve (CN X, slowing SA node) and Sympathetic postganglionic fibers (T1–T5, inotropic & chronotropic stimulation).',
    histology:
      'Branching striated cardiomyocytes with intercalated discs, gap junctions (connexon 43), high mitochondrial volume (40% cell volume), and specialized Purkinje fibers.',
    pathologies: [
      'Coronary Artery Disease & Myocardial Infarction',
      'Atrial Fibrillation & Ventricular Tachycardia',
      'Congestive Heart Failure (Systolic vs Diastolic)',
      'Valvular Aortic Stenosis & Mitral Regurgitation',
    ],
    referenceImages: [
      { title: '4-Chamber Cross-Section', url: '/images/anatomy/heart_chambers_diagram.jpg' },
      { title: 'Coronary Split Hemi-Section', url: '/images/anatomy/heart_split_cutaway_diagram.jpg' },
      { title: 'Exterior Anterior Anatomy', url: '/images/anatomy/heart_exterior_coronary_diagram.jpg' },
    ],
  },
  brain: {
    title: 'Brain & Cerebral Cortex',
    latin: 'Encephalon',
    category: 'Central Nervous System',
    summary:
      'The central computational organ consisting of ~86 billion neurons and 100 trillion synapses. Orchestrates conscious cognition, sensory interpretation, voluntary motor commands, and homeostatic reflex loops.',
    metrics: [
      { label: 'Neuron Count', value: '86', unit: 'Billion' },
      { label: 'Synaptic Events', value: '10', unit: 'Quadrillion/s' },
      { label: 'Energy Share', value: '20', unit: '% Body O2' },
      { label: 'Conduction Speed', value: '120', unit: 'm / s' },
    ],
    arterialSupply:
      'Circle of Willis anastomosis: Paired Internal Carotid Arteries (anterior circulation) and Basilar Artery from vertebral arteries (posterior circulation).',
    innervation:
      '12 pairs of Cranial Nerves (I–XII) coordinating special senses, facial motor tone, and systemic vagal visceral innervation.',
    histology:
      '6-layered neocortex with pyramidal projection neurons, interneurons, and dense glial architecture (astrocytes forming Blood-Brain Barrier, oligodendrocytes synthesizing myelin).',
    pathologies: [
      'Ischemic & Hemorrhagic Stroke (tPA & thrombectomy windows)',
      'Alzheimer’s Beta-Amyloid & Tau Neurodegeneration',
      'Parkinsonian Substantia Nigra Dopamine Depletion',
      'Temporal Lobe Epilepsy & Hypersynchronous Spikes',
    ],
    referenceImages: [
      { title: 'Cerebral Cortex & Nervous System', url: '/images/anatomy/brain_nervous_diagram.jpg' },
    ],
  },
  lungs: {
    title: 'Lungs & Respiratory Tree',
    latin: 'Pulmones',
    category: 'Pulmonary Ventilation & Gas Exchange',
    summary:
      'Bilateral spongy respiratory organs accommodating 300–500 million alveoli. Drives rapid passive oxygen diffusion into pulmonary capillaries while eliminating carbon dioxide.',
    metrics: [
      { label: 'Alveoli Area', value: '80–100', unit: 'm²' },
      { label: 'Minute Volume', value: '6.0', unit: 'L / min' },
      { label: 'Tidal Volume', value: '500', unit: 'mL / breath' },
      { label: 'Lobes Total', value: '5', unit: '3 Right, 2 Left' },
    ],
    arterialSupply:
      'Pulmonary Arteries (functional deoxygenated exchange) and Bronchial Arteries arising from the descending aorta (systemic nutritive supply).',
    innervation:
      'Pulmonary Plexus: Vagus Nerve (CN X bronchoconstrictor and secretomotor) and T2–T5 Sympathetic Trunks (bronchodilator via beta-2 adrenergic receptors).',
    histology:
      'Type I alveolar cells (95% of alveolar surface, 0.2 µm diffusion barrier) and Type II pneumocytes synthesizing dipalmitoylphosphatidylcholine (surfactant).',
    pathologies: [
      'Chronic Obstructive Pulmonary Disease (COPD / Emphysema)',
      'Bacterial & Viral Lobar Pneumonia',
      'Acute Respiratory Distress Syndrome (ARDS)',
      'Pulmonary Arterial Thromboembolism',
    ],
    referenceImages: [
      { title: 'Pulmonary Tree & 5 Lobes', url: '/images/anatomy/respiratory_lungs_diagram.jpg' },
    ],
  },
  liver: {
    title: 'Liver & Gallbladder',
    latin: 'Hepar et Vesica biliaris',
    category: 'Metabolic & Digestive Organ',
    summary:
      'The body’s chief biochemical laboratory. Governs amino acid deamination, glucose homeostasis, plasma protein synthesis (albumin, clotting factors), drug metabolism, and continuous bile secretion.',
    metrics: [
      { label: 'Adult Mass', value: '1.5', unit: 'kg' },
      { label: 'Couinaud Segments', value: '8', unit: 'Independent' },
      { label: 'Daily Bile', value: '900', unit: 'mL / day' },
      { label: 'Hepatic Blood Flow', value: '1.5', unit: 'L / min' },
    ],
    arterialSupply:
      'Dual vascular inflow: Hepatic Portal Vein (75% volume, nutrient-rich from intestines) and Hepatic Artery Proper (25% volume, oxygen-rich from celiac axis).',
    innervation:
      'Hepatic Plexus derived from Celiac Ganglion and Anterior Vagal Trunk traveling along the portal triad.',
    histology:
      'Hexagonal hepatic lobules centered around a central vein, fenestrated sinusoids, Kupffer resident macrophages, and Ito perisinusoidal fat-storing cells.',
    pathologies: [
      'Hepatic Cirrhosis & Portal Hypertension',
      'Non-Alcoholic Fatty Liver Disease (NAFLD / NASH)',
      'Cholelithiasis & Acute Cholecystitis',
      'Hepatocellular Carcinoma',
    ],
    referenceImages: [
      { title: 'Hepatic Lobes & Gallbladder', url: '/images/anatomy/liver_biliary_diagram.jpg' },
    ],
  },
  kidneys: {
    title: 'Kidneys & Urinary Tract',
    latin: 'Renes et Ureteres',
    category: 'Renal & Excretory System',
    summary:
      'Paired retroperitoneal organs receiving 20–25% of resting cardiac output. Maintains extracellular fluid osmolarity, electrolyte balance, blood pressure (renin-angiotensin-aldosterone), and erythropoietin secretion.',
    metrics: [
      { label: 'Nephrons Count', value: '2.0', unit: 'Million' },
      { label: 'Glomerular Flux', value: '125', unit: 'mL / min' },
      { label: 'Plasma Filtered', value: '180', unit: 'L / day' },
      { label: 'Urine Produced', value: '1.5', unit: 'L / day' },
    ],
    arterialSupply:
      'Paired Renal Arteries arising directly from the abdominal aorta at L1–L2 vertebral level.',
    innervation:
      'Renal Plexus with sympathetic vasoconstrictor tone from T10–L1 modulating arteriolar resistance and renin release.',
    histology:
      'Vascular glomerulus encased in Bowman’s capsule, podocyte foot processes forming filtration slits, and proximal convoluted tubule with extensive microvillar brush border.',
    pathologies: [
      'Chronic Kidney Disease & End-Stage Renal Disease (ESRD)',
      'Acute Tubular Necrosis & Pre-renal Azotemia',
      'Diabetic Glomerulosclerosis',
      'Nephrolithiasis (Calcium Oxalate Calculi)',
    ],
    referenceImages: [
      { title: 'Kidneys & Nephron Architecture', url: '/images/anatomy/kidneys_urinary_diagram.jpg' },
    ],
  },
  stomach: {
    title: 'Stomach & Gastrointestinal System',
    latin: 'Ventriculus / Gaster',
    category: 'Digestive & Enteric System',
    summary:
      'J-shaped digestive chamber initiating mechanical churning and chemical proteolysis via hydrochloric acid and pepsinogen. Connects to the duodenum where pancreatic and biliary secretions mix.',
    metrics: [
      { label: 'Gastric Acid pH', value: '1.5–2.0', unit: 'pH' },
      { label: 'Distended Volume', value: '1.5–2.0', unit: 'Liters' },
      { label: 'Enteric Neurons', value: '500', unit: 'Million' },
      { label: 'Gastric Secretion', value: '2.0', unit: 'L / day' },
    ],
    arterialSupply:
      'Celiac Trunk branches: Left Gastric Artery, Right Gastric Artery, Gastro-omental Arteries, and Short Gastric Arteries.',
    innervation:
      'Vagus Nerve (CN X, promoting acid secretion via parietal cells) and Greater Splanchnic Nerves (T5–T9, sympathetic vasoconstriction and pain).',
    histology:
      'Gastric pits lined with mucus-secreting foveolar cells, acid-secreting Parietal cells (producing HCl & Intrinsic Factor), and enzyme-secreting Chief cells.',
    pathologies: [
      'Peptic Ulcer Disease & H. pylori Gastritis',
      'Gastroesophageal Reflux Disease (GERD)',
      'Gastric Adenocarcinoma',
      'Zollinger-Ellison Gastrinoma Syndrome',
    ],
    referenceImages: [
      { title: 'Gastric Rugae & Duodenal Pancreas', url: '/images/anatomy/digestive_stomach_diagram.jpg' },
    ],
  },
  skeleton: {
    title: 'Articulated Skeletal Framework',
    latin: 'Systema skeletale',
    category: 'Musculoskeletal Structural Support',
    summary:
      '206 articulated bones divided into the axial skeleton (80 bones: cranium, vertebral column, ribcage) and appendicular skeleton (126 bones: shoulder girdle, pelvis, limbs). Stores 99% of bodily calcium and houses bone marrow hematopoiesis.',
    metrics: [
      { label: 'Total Bones', value: '206', unit: 'Articulated' },
      { label: 'Axial Bones', value: '80', unit: 'Bones' },
      { label: 'Appendicular', value: '126', unit: 'Bones' },
      { label: 'RBC Production', value: '200', unit: 'Billion/day' },
    ],
    arterialSupply:
      'Diaphyseal nutrient arteries, periosteal capillary networks, and metaphyseal-epiphyseal vascular anastomoses.',
    innervation:
      'Extensive sensory nociceptive fibers within the periosteum explaining intense acute pain upon fracture.',
    histology:
      'Compact cortical bone composed of cylindrical Haversian systems (osteons) with concentric lamellae, and cancellous trabecular bone filled with red hematopoietic marrow.',
    pathologies: [
      'Osteoporosis & Fragility Fractures',
      'Osteoarthritis & Articular Cartilage Degeneration',
      'Osteosarcoma & Metastatic Bone Lesions',
      'Osteomalacia & Rickets',
    ],
    referenceImages: [
      { title: '206 Articulated Bones Framework', url: '/images/anatomy/skeletal_system_diagram.jpg' },
    ],
  },
  muscular: {
    title: 'Muscular System & Kinetic Chains',
    latin: 'Systema musculare',
    category: 'Somatic Locomotion & Postural Tone',
    summary:
      'Over 650 skeletal muscles comprising 40% of adult body mass. Organized into superficial and deep kinetic chains coordinated by alpha-motor neurons at neuromuscular junctions.',
    metrics: [
      { label: 'Total Muscles', value: '650+', unit: 'Skeletal' },
      { label: 'Mass Fraction', value: '40', unit: '% Body Mass' },
      { label: 'Contraction Speed', value: '10–100', unit: 'ms' },
      { label: 'Fiber Types', value: 'Type I / IIa / IIx', unit: 'Motor' },
    ],
    arterialSupply:
      'Direct muscular arterial branches and intramuscular capillary networks providing oxygen for oxidative phosphorylation.',
    innervation:
      'Somatic motor system: lower alpha-motor neurons in anterior horn of spinal cord synapsing across cholinergic neuromuscular junctions.',
    histology:
      'Multinucleated cylindrical muscle fibers packed with sarcomeres containing actin and myosin myofilaments bounded by Z-discs.',
    pathologies: [
      'Duchenne & Becker Muscular Dystrophy',
      'Myasthenia Gravis (anti-AChR autoantibodies)',
      'Rhabdomyolysis & Myoglobinuria',
      'Sarcopenia & Chronic Muscle Atrophy',
    ],
    referenceImages: [
      { title: 'Striated Muscular Framework', url: '/images/anatomy/muscular_system_diagram.jpg' },
      { title: 'Musculoskeletal Composite', url: '/images/anatomy/fullbody_composite_diagram.jpg' },
    ],
  },
  vascular: {
    title: 'Cardiovascular Vascular Tree',
    latin: 'Systema cardiovasculare',
    category: 'Hemodynamic Perfusion Highway',
    summary:
      'Over 100,000 kilometers of blood vessels spanning systemic elastic arteries, muscular arterioles, semi-permeable capillary beds, and capacitance veins. Manages microvascular exchange and systemic blood pressure.',
    metrics: [
      { label: 'Vessel Length', value: '100,000', unit: 'km' },
      { label: 'Total Volume', value: '5.0', unit: 'Liters' },
      { label: 'Capillary Surface', value: '1,000', unit: 'm²' },
      { label: 'Capillary Transit', value: '0.75', unit: 'seconds' },
    ],
    arterialSupply:
      'High-pressure arterial conduits originating from the aortic root, distributing through muscular arteries to peripheral tissue beds.',
    innervation:
      'Postganglionic sympathetic vasoconstrictor fibers terminating on vascular smooth muscle via alpha-1 adrenergic receptors.',
    histology:
      'Three tunics: Tunica intima (single continuous endothelial monolayer), Tunica media (vascular smooth muscle and elastin fibers), and Tunica adventitia (collagen and vasa vasorum).',
    pathologies: [
      'Atherosclerosis & Arterial Plaque Rupture',
      'Abdominal & Thoracic Aortic Aneurysms',
      'Deep Vein Thrombosis (DVT) & Venous Stasis',
      'Essential Systemic Arterial Hypertension',
    ],
    referenceImages: [
      { title: 'Arterial & Venous Circulatory System', url: '/images/anatomy/vascular_system_diagram.jpg' },
    ],
  },
  fullbody: {
    title: 'Complete Human Multi-System Composite',
    latin: 'Corpus humanum universale',
    category: 'Integrated Whole-Body Physiological Atlas',
    summary:
      'Comprehensive 3D anatomical composite integrating all 6 foundational bodily systems: Skeletal (206 bones), Muscular (650+ muscles), Nervous, Cardiovascular, Visceral Organs, and Integumentary Skin.',
    metrics: [
      { label: 'Systems Modeled', value: '6', unit: 'Complete' },
      { label: 'Articulated Bones', value: '206', unit: 'Bones' },
      { label: 'Skeletal Muscles', value: '650+', unit: 'Muscles' },
      { label: 'Anatomy Precision', value: '100', unit: '% Metric' },
    ],
    arterialSupply: 'Systemic circulatory tree powered by cardiac ejection through the ascending aorta.',
    innervation: 'Integrated somatic sensory-motor nervous system and central-autonomic neural axes.',
    histology: 'Four primary tissue families: Epithelial, Connective, Muscular, and Nervous tissues.',
    pathologies: [
      'Multi-System Trauma & Shock',
      'Systemic Inflammatory Response Syndrome (SIRS / Sepsis)',
      'Cardiopulmonary Arrest & Resuscitation',
      'Generalized Metabolic Acidosis & Organ Failure',
    ],
    referenceImages: [
      { title: '6-Layer Multi-System Composite', url: '/images/anatomy/fullbody_composite_diagram.jpg' },
    ],
  },
};

export default function OrganInspectorSheet({
  currentView,
  isBeating,
  onToggleBeating,
  isBreathing,
  onToggleBreathing,
  isCutaway,
  onToggleCutaway,
  selectedPin,
  onClearPin,
}: OrganInspectorSheetProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const data = ORGAN_METADATA[currentView] || ORGAN_METADATA.heart;

  const handleAsk = () => {
    if (!query.trim()) return;
    setIsAnswering(true);
    const res = askNeuroAI(query);
    setTimeout(() => {
      setAiAnswer(
        res.entry
          ? res.entry.answer
          : `Clinical Medical Analysis: In the human ${data.title}, physiological homeostasis is maintained through intricate neurovascular coupling and metabolic feedback. Regarding "${query}": Clinical evaluation focuses on tissue perfusion, organ reserve, and targeted pharmacotherapy.`
      );
      setIsAnswering(false);
    }, 400);
  };

  return (
    <aside className="slim-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto border-l border-edge/60 bg-abyss/95 p-4 text-[10px] text-oat backdrop-blur-md sm:w-[380px] lg:w-[410px]">
      {/* Pinned 3D Landmark Alert (If User Clicked a 3D Pin) */}
      {selectedPin && (
        <div className="mb-3 rounded-lg border border-teal bg-teal/15 p-3 shadow-[0_0_15px_rgba(20,184,166,0.25)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-teal">
              🎯 3D Landmark Inspected
            </span>
            <button
              onClick={onClearPin}
              className="font-mono text-[7px] uppercase tracking-wider text-mute hover:text-oat"
            >
              Dismiss
            </button>
          </div>
          <span className="mt-1 block font-display text-[12px] font-bold text-oat">
            {selectedPin.name}
          </span>
          <span className="block font-mono text-[7px] uppercase text-teal">
            {selectedPin.category}
          </span>
          <p className="mt-1 text-[8.5px] leading-relaxed text-oat/90">{selectedPin.description}</p>
        </div>
      )}

      {/* Hero Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded border border-teal/40 bg-teal/10 px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-teal">
            {data.category}
          </span>
          <span className="font-serif text-[10px] italic text-mute">{data.latin}</span>
        </div>
        <h2 className="mt-1 font-display text-[17px] font-bold tracking-tight text-oat">
          {data.title}
        </h2>
        <p className="mt-1 text-[9px] leading-relaxed text-mute">{data.summary}</p>
      </div>

      {/* Interactive 3D Real-Time Controls */}
      <div className="mt-3 rounded-lg border border-edge/80 bg-void/60 p-2.5">
        <span className="block font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-dim">
          Real-Time 3D Controls
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {currentView === 'heart' && (
            <>
              <button
                onClick={onToggleBeating}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.12em] transition-all ${
                  isBeating
                    ? 'border border-crimson/50 bg-crimson/20 text-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.3)]'
                    : 'border border-edge bg-panel text-mute hover:text-oat'
                }`}
              >
                {isBeating ? <Pause size={10} /> : <Play size={10} />}
                <span>{isBeating ? 'Beating (72 bpm)' : 'Pulse Paused'}</span>
              </button>

              <button
                onClick={onToggleCutaway}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.12em] transition-all ${
                  isCutaway
                    ? 'border border-amber/50 bg-amber/20 text-amber shadow-[0_0_10px_rgba(217,119,6,0.3)]'
                    : 'border border-edge bg-panel text-mute hover:text-oat'
                }`}
              >
                <Scissors size={10} />
                <span>{isCutaway ? 'Cutaway Active' : 'Interior Chambers Cutaway'}</span>
              </button>
            </>
          )}

          {currentView === 'lungs' && (
            <button
              onClick={onToggleBreathing}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.12em] transition-all ${
                isBreathing
                  ? 'border border-teal/50 bg-teal/20 text-teal'
                  : 'border border-edge bg-panel text-mute hover:text-oat'
              }`}
            >
              {isBreathing ? <Pause size={10} /> : <Play size={10} />}
              <span>{isBreathing ? 'Respiration (14 bpm)' : 'Paused'}</span>
            </button>
          )}

          {currentView !== 'heart' && currentView !== 'lungs' && (
            <span className="font-mono text-[7.5px] text-mute">
              Click & drag in 3D viewport to orbit 360° · Scroll to zoom
            </span>
          )}
        </div>
      </div>

      {/* Clinical Reference Images (If available for organ, e.g. Heart) */}
      {data.referenceImages && data.referenceImages.length > 0 && (
        <div className="mt-3 rounded-lg border border-edge/80 bg-void/60 p-2.5">
          <span className="block font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-dim">
            Medical Reference Diagrams
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {data.referenceImages.map((img) => (
              <button
                key={img.title}
                onClick={() => setSelectedImg(selectedImg === img.url ? null : img.url)}
                className={`group relative overflow-hidden rounded border transition-all ${
                  selectedImg === img.url
                    ? 'border-teal ring-1 ring-teal'
                    : 'border-edge hover:border-teal/50'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="h-16 w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-0 left-0 right-0 truncate bg-abyss/85 px-1 py-0.5 font-mono text-[6px] text-oat">
                  {img.title}
                </span>
              </button>
            ))}
          </div>

          {/* Expanded Preview Modal */}
          {selectedImg && (
            <div className="relative mt-2 overflow-hidden rounded-lg border border-teal/40">
              <img src={selectedImg} alt="Expanded diagram" className="w-full object-contain" />
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute right-1.5 top-1.5 rounded bg-abyss/80 px-2 py-0.5 font-mono text-[7px] text-oat hover:bg-teal hover:text-abyss"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Physiological Metrics Grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {data.metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-edge bg-void/80 p-2">
            <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-dim">
              {m.label}
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-mono text-[13px] font-bold text-teal">{m.value}</span>
              {m.unit && <span className="font-mono text-[7px] text-mute">{m.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Deep Anatomical & Clinical Details */}
      <div className="mt-3 space-y-2 border-t border-edge/60 pt-3 text-[8.5px]">
        <div>
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-teal">
            Arterial Blood Supply:
          </span>
          <p className="mt-0.5 text-mute">{data.arterialSupply}</p>
        </div>

        <div>
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-teal">
            Neural Innervation:
          </span>
          <p className="mt-0.5 text-mute">{data.innervation}</p>
        </div>

        <div>
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-teal">
            Microscopic Histology:
          </span>
          <p className="mt-0.5 text-mute">{data.histology}</p>
        </div>

        <div>
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-amber">
            Major Clinical Pathologies:
          </span>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-mute">
            {data.pathologies.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Clinical Inquiry (Instant On-Device AI) */}
      <div className="mt-4 rounded-lg border border-edge bg-void/80 p-3">
        <span className="flex items-center gap-1.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.14em] text-teal">
          <Sparkles size={11} />
          <span>Ask Clinical Intelligence</span>
        </span>
        <div className="mt-2 flex gap-1">
          <input
            type="text"
            placeholder={`Ask anything about the ${data.title}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 rounded border border-edge bg-panel px-2.5 py-1.5 font-mono text-[8px] text-oat placeholder:text-dim focus:border-teal focus:outline-none"
          />
          <button
            onClick={handleAsk}
            disabled={isAnswering}
            className="rounded bg-teal px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-abyss hover:brightness-110 disabled:opacity-50"
          >
            {isAnswering ? '...' : 'Ask'}
          </button>
        </div>

        {aiAnswer && (
          <div className="mt-2.5 rounded border border-teal/30 bg-teal/10 p-2 font-sans text-[8.5px] leading-relaxed text-oat">
            {aiAnswer}
          </div>
        )}
      </div>
    </aside>
  );
}
