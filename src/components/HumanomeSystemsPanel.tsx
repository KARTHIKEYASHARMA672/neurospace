import { useState } from 'react';
import {
  Layers,
  Sparkles,
  Sliders,
  ChevronRight,
  Info,
  Check,
  Eye,
  EyeOff,
  Flame,
  Activity,
  HeartPulse,
  Brain,
  Search,
  Filter,
  Maximize2,
  RotateCcw,
  Target,
  ArrowRight,
  Dna,
  ShieldAlert,
} from 'lucide-react';
import {
  ANATOMY_SYSTEMS,
  type AnatomySystemId,
  type RenderingViewMode,
} from '../data/anatomySystems';

export interface OrganDetailInfo {
  key: string;
  name: string;
  category: string;
  system: AnatomySystemId;
  icon: typeof Activity;
  desc: string;
  bloodSupply: string;
  innervation: string;
  histology: string;
  pathologies: string;
  stats: { label: string; value: string }[];
}

export const MAJOR_HUMAN_ORGANS: OrganDetailInfo[] = [
  {
    key: 'heart',
    name: 'Heart & Ventricles',
    category: 'Cardiovascular System',
    system: 'cardiovascular',
    icon: HeartPulse,
    desc: '4-chambered central muscular pump delivering oxygenated blood to the body and deoxygenated blood to the lungs.',
    bloodSupply: 'Left & Right Coronary Arteries (LAD, Circumflex, RCA originating from aortic sinuses)',
    innervation: 'Vagus Nerve (CN X, parasympathetic deceleration) & T1–T5 Sympathetic Cardiac Nerves (inotropic surge)',
    histology: 'Striated branching cardiomyocytes with intercalated discs, gap junctions, and Purkinje conduction fibers',
    pathologies: 'Myocardial Infarction, Atherosclerotic Coronary Disease, Heart Failure, Atrial Fibrillation, Valvular Stenosis',
    stats: [
      { label: 'Mass', value: '280–340 g' },
      { label: 'Cardiac Output', value: '5.0 L / min' },
      { label: 'Resting Rate', value: '60–100 bpm' },
      { label: 'Stroke Volume', value: '70 mL / beat' },
    ],
  },
  {
    key: 'brain',
    name: 'Brain & Cerebral Cortex',
    category: 'Central Nervous System',
    system: 'nervous',
    icon: Brain,
    desc: 'Master computational neuro-organ holding 86 billion neurons, 12 cortical lobes, and deep limbic nuclei.',
    bloodSupply: 'Circle of Willis: Internal Carotid Arteries (anterior circulation) & Basilar Artery (posterior circulation)',
    innervation: '12 Cranial Nerves (I–XII) and descending Corticospinal / Autonomic Hypothalamic axes',
    histology: 'Laminated neocortex (Layers I–VI), pyramidal projection neurons, glial astrocytes, oligodendrocytes',
    pathologies: 'Ischemic & Hemorrhagic Stroke, Temporal Lobe Epilepsy, Alzheimer’s Tauopathy, Glioblastoma, Parkinson’s',
    stats: [
      { label: 'Neuron Count', value: '86 Billion' },
      { label: 'Synapses', value: '100 Trillion' },
      { label: 'Energy Consumption', value: '20% of bodily O2' },
      { label: 'Conduction Velocity', value: 'Up to 120 m/s' },
    ],
  },
  {
    key: 'lungs',
    name: 'Lungs & Tracheobronchial Tree',
    category: 'Respiratory System',
    system: 'organs',
    icon: Activity,
    desc: 'Bilateral respiratory exchange organs with 3 right lobes, 2 left lobes, and 300 million alveolar sacs.',
    bloodSupply: 'Pulmonary Arteries (deoxygenated functional exchange) & Bronchial Arteries (systemic tissue nutrition)',
    innervation: 'Pulmonary Plexus: Vagus nerve (CN X bronchoconstriction) & Thoracic Sympathetic (T2–T5 bronchodilation)',
    histology: 'Type I alveolar pneumocytes (95% ultra-thin gas barrier) & Type II pneumocytes (surfactant secretion)',
    pathologies: 'Pneumonia, Chronic Obstructive Pulmonary Disease (COPD), Asthma, Pulmonary Embolism, ARDS',
    stats: [
      { label: 'Surface Area', value: '70–100 m²' },
      { label: 'Alveoli Count', value: '300–500 Million' },
      { label: 'Tidal Volume', value: '500 mL / breath' },
      { label: 'Minute Ventilation', value: '6.0 L / min' },
    ],
  },
  {
    key: 'liver',
    name: 'Liver & Hepatic Segments',
    category: 'Digestive & Metabolic System',
    system: 'organs',
    icon: Activity,
    desc: 'Largest internal metabolic organ with 8 autonomous Couinaud segments, bile synthesis, and detoxification.',
    bloodSupply: 'Dual inflow: Hepatic Portal Vein (75% nutrient venous) & Hepatic Artery Proper (25% arterial oxygenated)',
    innervation: 'Hepatic Plexus (Celiac ganglion sympathetics & Anterior Vagal trunk parasympathetics)',
    histology: 'Hexagonal classic lobules, fenestrated sinusoids, Kupffer resident macrophages, and Ito perisinusoidal cells',
    pathologies: 'Cirrhosis, Non-Alcoholic Steatohepatitis (NASH), Hepatocellular Carcinoma, Portal Hypertension, Jaundice',
    stats: [
      { label: 'Mass', value: '1.4–1.6 kg' },
      { label: 'Couinaud Segments', value: '8 Independent Units' },
      { label: 'Bile Production', value: '800–1000 mL / day' },
      { label: 'Blood Flow', value: '1.5 L / min (25% CO)' },
    ],
  },
  {
    key: 'stomach',
    name: 'Stomach & Gastric Reservoir',
    category: 'Digestive System',
    system: 'organs',
    icon: Activity,
    desc: 'J-shaped muscular organ initiating mechanical churning, hydrochloric acid secretion, and pepsin digestion.',
    bloodSupply: 'Celiac Trunk: Left/Right Gastric, Left/Right Gastro-omental, and Short Gastric Arteries',
    innervation: 'Anterior & Posterior Vagal Trunks (CN X secretomotor) & Greater Splanchnic Nerves (T5–T9 sympathetic pain)',
    histology: 'Gastric mucosa with rugae folds, Parietal cells (secreting HCl & Intrinsic Factor), Chief cells (pepsinogen)',
    pathologies: 'Peptic Ulcer Disease, Helicobacter pylori Chronic Gastritis, Gastric Adenocarcinoma, Zollinger-Ellison',
    stats: [
      { label: 'Fasting pH', value: '1.5–2.0 (pH)' },
      { label: 'Resting Volume', value: '50 mL' },
      { label: 'Distended Capacity', value: '1.5–2.0 Liters' },
      { label: 'Gastric Acid Flux', value: '2.0 Liters / day' },
    ],
  },
  {
    key: 'kidneys',
    name: 'Kidneys & Urinary Excretory Axis',
    category: 'Urinary & Renal System',
    system: 'organs',
    icon: Activity,
    desc: 'Retroperitoneal paired filtration organs executing plasma ultrafiltration, acid-base balance, and erythropoietin secretion.',
    bloodSupply: 'Renal Arteries arising directly from Abdominal Aorta, receiving 20–25% of total cardiac output',
    innervation: 'Renal Plexus (T10–L1 sympathetics regulating afferent arteriolar resistance and renin discharge)',
    histology: '1 million nephrons per kidney: Glomerular fenestrated capillaries, Podocyte slit diaphragms, Henle loops',
    pathologies: 'Chronic Kidney Disease (CKD), Diabetic Nephropathy, Glomerulonephritis, Acute Tubular Necrosis, Renal Stones',
    stats: [
      { label: 'Nephrons / Kidney', value: '1,000,000' },
      { label: 'GFR (Glomerular Flux)', value: '125 mL / min' },
      { label: 'Plasma Filtered', value: '180 Liters / day' },
      { label: 'Urine Excreted', value: '1.5 Liters / day' },
    ],
  },
  {
    key: 'pancreas',
    name: 'Pancreas & Duodenal C-Loop',
    category: 'Endocrine & Exocrine System',
    system: 'organs',
    icon: Activity,
    desc: 'Crucial dual metabolic organ nestling in duodenal curve, secreting digestive juices and blood glucose hormones.',
    bloodSupply: 'Splenic Artery branches, Superior & Inferior Pancreaticoduodenal Arteries (Celiac & SMA anastomoses)',
    innervation: 'Celiac & Superior Mesenteric Plexuses, Vagus nerve (CN X stimulating enzyme secretion)',
    histology: 'Exocrine acinar serous units (98% of mass) and Endocrine Islets of Langerhans (Beta, Alpha, Delta cells)',
    pathologies: 'Type 1 & Type 2 Diabetes Mellitus, Acute Pancreatitis, Pancreatic Ductal Adenocarcinoma, Cystic Fibrosis',
    stats: [
      { label: 'Islets Count', value: '1–2 Million' },
      { label: 'Beta Cell Proportion', value: '65–70%' },
      { label: 'Exocrine Juice', value: '1.2–1.5 L / day' },
      { label: 'Length', value: '15 cm' },
    ],
  },
  {
    key: 'intestines',
    name: 'Intestines & Enteric "Second Brain"',
    category: 'Digestive & Enteric System',
    system: 'organs',
    icon: Activity,
    desc: '6 meters of small intestine and 1.5 meters of colon lined with 500 million neurons and 90% of bodily serotonin.',
    bloodSupply: 'Superior Mesenteric Artery (SMA, jejunum to transverse colon) & Inferior Mesenteric Artery (IMA, descending colon)',
    innervation: 'Enteric Nervous System (Myenteric Auerbach & Submucosal Meissner plexuses), Vagal Afferents (80%)',
    histology: 'Intestinal villi, microvillar brush border, Crypts of Lieberkühn, Goblet cells, and Peyer’s patches (GALT)',
    pathologies: 'Crohn’s Disease, Ulcerative Colitis, Colorectal Adenocarcinoma, Irritable Bowel Syndrome (IBS), Celiac',
    stats: [
      { label: 'Small Intestine Length', value: '6.0 Meters' },
      { label: 'Enteric Neurons', value: '500 Million' },
      { label: 'Bodily Serotonin', value: '>90% Synthesized' },
      { label: 'Absorptive Area', value: '30 m² (Studio apt)' },
    ],
  },
  {
    key: 'bladder',
    name: 'Urinary Bladder & Ureters',
    category: 'Urinary System',
    system: 'organs',
    icon: Activity,
    desc: 'Collapsible distensible muscular reservoir in the pelvic cavity storing urine from the bilateral ureters.',
    bloodSupply: 'Superior & Inferior Vesical Arteries (derived from internal iliac anterior trunk)',
    innervation: 'Pelvic Splanchnic Nerves (S2–S4 parasympathetic voiding) & Hypogastric Nerves (T11–L2 sympathetic storage)',
    histology: 'Specialized transitional epithelium (urothelium) with umbrella cells and thick 3-layered detrusor muscle',
    pathologies: 'Bacterial Cystitis (UTI), Urothelial Carcinoma, Neurogenic Bladder, Overactive Bladder Syndrome (OAB)',
    stats: [
      { label: 'Normal Urge Volume', value: '250–350 mL' },
      { label: 'Max Physiological Limit', value: '600–800 mL' },
      { label: 'Wall Thickness', value: '3–5 mm (empty)' },
      { label: 'Ureteral Length', value: '25–30 cm' },
    ],
  },
  {
    key: 'thyroid',
    name: 'Thyroid & Parathyroid Glands',
    category: 'Endocrine System',
    system: 'organs',
    icon: Activity,
    desc: 'Butterfly-shaped cervical endocrine regulator controlling basal metabolic rate, protein synthesis, and calcium balance.',
    bloodSupply: 'Superior Thyroid Artery (External Carotid) & Inferior Thyroid Artery (Thyrocervical Trunk)',
    innervation: 'Cervical Sympathetic Trunk and branches from Recurrent & Superior Laryngeal Nerves (CN X)',
    histology: 'Follicular units filled with thyroglobulin colloid (T3/T4 synthesis) and Calcitonin-secreting Parafollicular C cells',
    pathologies: 'Hashimoto’s Autoimmune Thyroiditis, Graves’ Hyperthyroidism, Papillary Thyroid Carcinoma, Endemic Goiter',
    stats: [
      { label: 'Mass', value: '15–25 g' },
      { label: 'Blood Flow / Gram', value: '4–6 mL/min/g (Highest)' },
      { label: 'Parathyroid Glands', value: '4 Paired Glands' },
      { label: 'Hormones', value: 'Thyroxine (T4), T3, Calcitonin' },
    ],
  },
  {
    key: 'adrenals',
    name: 'Suprarenal Adrenal Glands',
    category: 'Endocrine System',
    system: 'organs',
    icon: Activity,
    desc: 'Pyramidal caps atop each kidney discharging life-essential steroid hormones and fight-or-flight adrenaline surges.',
    bloodSupply: 'Superior, Middle, and Inferior Suprarenal Arteries forming a subcapsular plexus',
    innervation: 'Direct preganglionic sympathetic fibers from thoracic splanchnic nerves directly to chromaffin medullary cells',
    histology: 'Tri-laminar cortex (Glomerulosa, Fasciculata, Reticularis) and Medulla containing pheochromocytes',
    pathologies: 'Primary Adrenal Insufficiency (Addison’s), Cushing’s Hypercortisolemia, Pheochromocytoma, Conn’s Syndrome',
    stats: [
      { label: 'Mass', value: '4–5 g each' },
      { label: 'Cortex : Medulla', value: '90% : 10%' },
      { label: 'Adrenaline Surge', value: 'Instant (<500 ms)' },
      { label: 'Core Hormones', value: 'Cortisol, Aldosterone, Epi' },
    ],
  },
  {
    key: 'spleen',
    name: 'Spleen (Red & White Pulp)',
    category: 'Lymphoid & Immune System',
    system: 'organs',
    icon: Activity,
    desc: 'Fist-sized lymphoid organ in left hypochondrium filtering aged red blood cells and orchestrating humoral immunity.',
    bloodSupply: 'Splenic Artery (largest tortuous branch of Celiac Trunk) & Splenic Vein draining to Portal Vein',
    innervation: 'Celiac Plexus sympathetic postganglionic fibers traveling along splenic arterial adventitia',
    histology: 'White pulp (Periarteriolar lymphoid sheaths PALS with T-cells) and Red pulp (splenic Billroth cords and sinuses)',
    pathologies: 'Splenomegaly from Portal Hypertension, Traumatic Splenic Rupture, Autosplenectomy in Sickle Cell, Hypersplenism',
    stats: [
      { label: 'Mass', value: '150–200 g' },
      { label: 'Blood Stored', value: '200–300 mL reserve' },
      { label: 'RBC Lifespan Check', value: '120-Day Senescence' },
      { label: 'Position', value: 'Left Ribs 9–11' },
    ],
  },
  {
    key: 'skeleton',
    name: 'Skeletal System (206 Bones)',
    category: 'Musculoskeletal System',
    system: 'skeleton',
    icon: Activity,
    desc: 'Complete articulated human framework: Cranial vault, 24 vertebrae, 12 rib pairs, shoulder/pelvic girdles, and limbs.',
    bloodSupply: 'Nutrient diaphyseal arteries, metaphyseal-epiphyseal networks, and vascularized periosteal capillary beds',
    innervation: 'Abundant sensory periosteal nociceptive nerves (extreme sensitivity to fracture and mechanical stress)',
    histology: 'Cortical bone (concentric Haversian osteons, lacunae) and Trabecular cancellous bone containing red bone marrow',
    pathologies: 'Osteoporosis, Traumatic Fractures, Osteosarcoma, Osteomyelitis, Osteoarthritis, Paget’s Disease',
    stats: [
      { label: 'Total Bones', value: '206 Articulated' },
      { label: 'Axial vs Appendicular', value: '80 vs 126 Bones' },
      { label: 'Calcium Reservoir', value: '99% of bodily Ca2+' },
      { label: 'Red Marrow Output', value: '200B RBCs / day' },
    ],
  },
  {
    key: 'muscular',
    name: 'Muscular System (650+ Muscles)',
    category: 'Musculoskeletal System',
    system: 'muscular',
    icon: Activity,
    desc: 'Over 650 skeletal muscles executing voluntary posture, locational movement, respiration, and 85% of metabolic heat.',
    bloodSupply: 'Dense intramuscular capillary networks with high arteriolar recruitment during active contractile work',
    innervation: 'Alpha motor neurons from spinal anterior horn terminating at cholinergic neuromuscular motor endplates',
    histology: 'Multinucleated cylindrical muscle fibers, repeating sarcomere units (actin-myosin cross-bridges), Titin proteins',
    pathologies: 'Duchenne Muscular Dystrophy, Myasthenia Gravis, Rhabdomyolysis, Sarcopenia, Polymyositis',
    stats: [
      { label: 'Muscle Count', value: '>650 Named Muscles' },
      { label: 'Mass Fraction', value: '40% of Adult Body Mass' },
      { label: 'Heat Generation', value: 'Up to 85% of Bodily Heat' },
      { label: 'Maximum Force', value: 'Masseter: ~90 kg / cm²' },
    ],
  },
];

interface HumanomeSystemsPanelProps {
  activeSystems: Record<AnatomySystemId, boolean>;
  onToggleSystem: (sys: AnatomySystemId) => void;
  systemOpacities: Record<AnatomySystemId, number>;
  onChangeOpacity: (sys: AnatomySystemId, val: number) => void;
  viewMode: RenderingViewMode;
  onChangeViewMode: (mode: RenderingViewMode) => void;
  selectedOrganKey: string | null;
  onSelectOrgan: (key: string) => void;
  onResetCamera: () => void;
  onAskNeuroAI: (q: string) => void;
}

export default function HumanomeSystemsPanel({
  activeSystems,
  onToggleSystem,
  systemOpacities,
  onChangeOpacity,
  viewMode,
  onChangeViewMode,
  selectedOrganKey,
  onSelectOrgan,
  onResetCamera,
  onAskNeuroAI,
}: HumanomeSystemsPanelProps) {
  const [activeTab, setActiveTab] = useState<'organs' | 'systems'>('organs');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedSystem, setInspectedSystem] = useState<AnatomySystemId>('organs');

  const selectedOrgan = MAJOR_HUMAN_ORGANS.find((o) => o.key === selectedOrganKey) || null;

  const filteredOrgans = MAJOR_HUMAN_ORGANS.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="slim-scroll flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="h-tick">Human Anatomy Studio</span>
          <span className="rounded border border-synapse/30 bg-synapse/10 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-synapse">
            Z-ANATOMY CLINICAL 3D
          </span>
        </div>

        {/* Tab switch */}
        <div className="mt-2.5 grid grid-cols-2 gap-1 rounded bg-void/80 p-1">
          <button
            onClick={() => setActiveTab('organs')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              activeTab === 'organs' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Human Organs Index
          </button>
          <button
            onClick={() => setActiveTab('systems')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              activeTab === 'systems' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            6 Anatomical Systems
          </button>
        </div>

        {/* Radiological Render Mode Selector */}
        <div className="mt-2 border-t border-edge pt-2">
          <div className="flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.18em] text-dim">
            <span>Visual Render Pass</span>
            <span className="text-synapse uppercase">{viewMode} Mode</span>
          </div>
          <div className="mt-1 grid grid-cols-4 gap-1 rounded bg-void/80 p-0.5">
            {(['xray', 'standard', 'ct', 'mri'] as RenderingViewMode[]).map((vm) => (
              <button
                key={vm}
                onClick={() => onChangeViewMode(vm)}
                className={`rounded py-0.5 text-center font-mono text-[6.5px] font-semibold uppercase tracking-[0.12em] transition-all ${
                  viewMode === vm ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
                }`}
              >
                {vm === 'standard' ? 'Photoreal' : vm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3 p-4 text-[10px]">
        {/* Selected Organ Spotlight Card */}
        {selectedOrgan && (
          <div className="rounded-lg border-2 border-synapse/70 bg-synapse/10 p-3 shadow-[0_0_20px_rgba(201,169,97,0.2)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-synapse text-abyss">
                  <selectedOrgan.icon size={15} />
                </div>
                <div>
                  <span className="block font-display text-[13px] font-bold text-ink">
                    {selectedOrgan.name}
                  </span>
                  <span className="block font-mono text-[7px] uppercase tracking-[0.14em] text-synapse">
                    {selectedOrgan.category}
                  </span>
                </div>
              </div>
              <button
                onClick={onResetCamera}
                title="Reset to Full Body View"
                className="flex items-center gap-1 rounded border border-edge bg-void/80 px-2 py-1 font-mono text-[7px] text-mute hover:text-ink"
              >
                <RotateCcw size={10} />
                <span>Full Body</span>
              </button>
            </div>

            <p className="mt-2 text-[9px] leading-relaxed text-ink/90">{selectedOrgan.desc}</p>

            {/* Live Physiological Statistics */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-synapse/20 pt-2">
              {selectedOrgan.stats.map((st) => (
                <div key={st.label} className="rounded bg-void/60 p-1.5">
                  <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-dim">
                    {st.label}
                  </span>
                  <span className="block font-mono text-[9px] font-bold text-synapse">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Deep Anatomical & Clinical Details */}
            <div className="mt-2.5 space-y-1.5 border-t border-synapse/20 pt-2 text-[8.5px]">
              <div>
                <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-synapse">
                  Arterial Supply:
                </span>{' '}
                <span className="text-mute">{selectedOrgan.bloodSupply}</span>
              </div>
              <div>
                <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-synapse">
                  Neural Innervation:
                </span>{' '}
                <span className="text-mute">{selectedOrgan.innervation}</span>
              </div>
              <div>
                <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-synapse">
                  Microscopic Histology:
                </span>{' '}
                <span className="text-mute">{selectedOrgan.histology}</span>
              </div>
              <div>
                <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-amber-400">
                  Major Pathologies:
                </span>{' '}
                <span className="text-mute">{selectedOrgan.pathologies}</span>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSelectOrgan(selectedOrgan.key)}
                className="flex items-center justify-center gap-1.5 rounded bg-synapse py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-abyss shadow-sm hover:brightness-110"
              >
                <Target size={11} />
                <span>Focus 3D View</span>
              </button>
              <button
                onClick={() =>
                  onAskNeuroAI(
                    `Provide a comprehensive medical and anatomical breakdown of the human ${selectedOrgan.name}: its physiological role, arterial vascular supply, autonomic innervation, microscopic histology, and major clinical diseases.`
                  )
                }
                className="flex items-center justify-center gap-1.5 rounded border border-synapse/40 bg-synapse/15 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-synapse hover:bg-synapse/25"
              >
                <Sparkles size={11} />
                <span>Consult NeuroAI</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Organs Index */}
        {activeTab === 'organs' ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-dim" />
              <input
                type="text"
                placeholder="Search any organ (Heart, Brain, Liver, Lungs, Kidney...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-edge bg-void/90 py-1.5 pl-8 pr-3 font-mono text-[8px] text-ink placeholder:text-dim focus:border-synapse focus:outline-none"
              />
            </div>

            {/* Organs List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="h-tick text-[7px]">Every Human Organ & Anatomical Part</span>
                <span className="font-mono text-[7px] text-dim">{filteredOrgans.length} Organs</span>
              </div>

              {filteredOrgans.map((organ) => {
                const Icon = organ.icon;
                const isSelected = selectedOrganKey === organ.key;

                return (
                  <div
                    key={organ.key}
                    onClick={() => onSelectOrgan(organ.key)}
                    className={`cursor-pointer rounded-md border p-2 transition-all ${
                      isSelected
                        ? 'border-synapse bg-synapse/20 text-ink shadow-[0_0_12px_rgba(201,169,97,0.2)]'
                        : 'border-edge bg-void/40 text-mute hover:border-synapse/50 hover:bg-void/70 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                            isSelected ? 'bg-synapse text-abyss' : 'bg-synapse/15 text-synapse'
                          }`}
                        >
                          <Icon size={12} />
                        </div>
                        <div>
                          <span className="block font-display text-[11px] font-bold text-ink">
                            {organ.name}
                          </span>
                          <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-synapse">
                            {organ.category}
                          </span>
                          <p className="mt-0.5 line-clamp-2 text-[8.5px] leading-relaxed text-mute">
                            {organ.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrgan(organ.key);
                          }}
                          title="Focus 3D View"
                          className="rounded border border-edge bg-void/90 p-1 text-dim transition-colors hover:border-synapse hover:text-synapse"
                        >
                          <Target size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskNeuroAI(
                              `Provide an in-depth clinical analysis of the human ${organ.name}, its vascular supply, and pathological failure modes.`
                            );
                          }}
                          title="Consult NeuroAI"
                          className="rounded border border-synapse/30 bg-synapse/10 p-1 text-synapse transition-colors hover:bg-synapse/25"
                        >
                          <Sparkles size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Tab 2: 6 Anatomical Systems with Visibility Toggles & Opacity Sliders */
          <div>
            <span className="h-tick text-[7px]">6 Primary Anatomical System Layers</span>
            <div className="mt-2 space-y-1.5">
              {(Object.keys(ANATOMY_SYSTEMS) as AnatomySystemId[]).map((sysId) => {
                const cfg = ANATOMY_SYSTEMS[sysId];
                const isActive = activeSystems[sysId];
                const isSelected = inspectedSystem === sysId;

                return (
                  <div
                    key={sysId}
                    className={`rounded-md border p-2 transition-all ${
                      isSelected
                        ? 'border-synapse/60 bg-synapse/15 text-ink shadow-[0_0_12px_rgba(201,169,97,0.15)]'
                        : 'border-edge bg-void/40 text-mute hover:border-synapse/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setInspectedSystem(sysId)}
                        className="flex items-center gap-2 text-left"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: '#' + cfg.defaultColor.toString(16).padStart(6, '0'),
                            boxShadow: isActive ? `0 0 8px #${cfg.defaultColor.toString(16).padStart(6, '0')}` : 'none',
                          }}
                        />
                        <div>
                          <span className="block font-display text-[11px] font-bold text-ink">
                            {cfg.name}
                          </span>
                          <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-synapse">
                            {cfg.structuresCount} structures
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleSystem(sysId)}
                          className={`rounded p-1 transition-colors ${
                            isActive
                              ? 'bg-synapse/20 text-synapse hover:bg-synapse/30'
                              : 'bg-void/80 text-dim hover:text-ink'
                          }`}
                          title={isActive ? 'Hide System Layer' : 'Show System Layer'}
                        >
                          {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Continuous Opacity Slider */}
                    <div className="mt-2 border-t border-edge/60 pt-2">
                      <div className="flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.12em] text-dim">
                        <span>Layer Opacity</span>
                        <span className="text-synapse font-semibold">
                          {Math.round((systemOpacities[sysId] ?? 0.8) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={systemOpacities[sysId] ?? 0.8}
                        onChange={(e) => onChangeOpacity(sysId, parseFloat(e.target.value))}
                        className="mt-1 h-1 w-full cursor-pointer appearance-none rounded bg-void accent-synapse"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
