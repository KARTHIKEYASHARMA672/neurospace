import { useState } from 'react';
import {
  Layers,
  Sparkles,
  Sliders,
  ChevronRight,
  Stethoscope,
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
} from 'lucide-react';
import {
  ANATOMY_SYSTEMS,
  type AnatomySystemId,
  type RenderingViewMode,
} from '../data/anatomySystems';

interface HumanomeSystemsPanelProps {
  activeSystems: Record<AnatomySystemId, boolean>;
  onToggleSystem: (sys: AnatomySystemId) => void;
  systemOpacities: Record<AnatomySystemId, number>;
  onChangeOpacity: (sys: AnatomySystemId, val: number) => void;
  viewMode: RenderingViewMode;
  onChangeViewMode: (mode: RenderingViewMode) => void;
  selectedStructure: { name: string; system: string } | null;
  onSelectStructureByName?: (name: string, system: AnatomySystemId) => void;
  onAskNeuroAI: (q: string) => void;
}

export const MAJOR_HUMAN_ORGANS = [
  { name: 'Heart & Ventricles', category: 'Cardiovascular', system: 'cardiovascular', icon: HeartPulse, desc: '4-chambered muscular organ delivering systemic hemodynamics.' },
  { name: 'Brain & Cerebral Cortex', category: 'Central Nervous', system: 'nervous', icon: Brain, desc: '86 billion neurons orchestrating sensation, cognition & motor control.' },
  { name: 'Lungs (Bilateral Lobes)', category: 'Respiratory', system: 'organs', icon: Activity, desc: 'Superior, middle & inferior lobes with alveolar gas exchange.' },
  { name: 'Liver & Hepatic Segments', category: 'Digestive & Metabolic', system: 'organs', icon: Activity, desc: '8 functional Couinaud segments executing metabolic detoxification & bile synthesis.' },
  { name: 'Stomach & Gastric Rugae', category: 'Digestive', system: 'organs', icon: Activity, desc: 'Acidic enzymatic reservoir initiating protein proteolysis.' },
  { name: 'Kidneys (Renal Cortex & Medulla)', category: 'Urinary & Excretory', system: 'organs', icon: Activity, desc: '1 million nephrons per kidney filtering 180 liters of plasma daily.' },
  { name: 'Pancreas & Islets of Langerhans', category: 'Endocrine & Exocrine', system: 'organs', icon: Activity, desc: 'Dual organ producing digestive enzymes and systemic insulin/glucagon.' },
  { name: 'Small Intestine (Duodenum & Jejunum)', category: 'Digestive', system: 'organs', icon: Activity, desc: 'Primary site of nutrient absorption lined with enteric second brain.' },
  { name: 'Large Intestine & Colon', category: 'Digestive', system: 'organs', icon: Activity, desc: 'Water reabsorption, microbiome symbiosis & fecal compaction.' },
  { name: 'Urinary Bladder & Ureters', category: 'Urinary', system: 'organs', icon: Activity, desc: 'Detrusor compliance muscle storing urine prior to micturition.' },
  { name: 'Thyroid & Parathyroid Glands', category: 'Endocrine', system: 'organs', icon: Activity, desc: 'T3/T4 basal metabolic rate pacing & PTH calcium baroregulation.' },
  { name: 'Suprarenal (Adrenal) Glands', category: 'Endocrine', system: 'organs', icon: Activity, desc: 'Cortical cortisol/aldosterone & medullary adrenaline surge.' },
  { name: 'Trachea & Bronchial Tree', category: 'Respiratory', system: 'organs', icon: Activity, desc: 'Cartilaginous airway corridor and Hering-Breuer stretch loops.' },
  { name: 'Gallbladder & Bile Ducts', category: 'Digestive', system: 'organs', icon: Activity, desc: 'Concentration and cholecystokinin-triggered expulsion of bile.' },
  { name: 'Spleen (White & Red Pulp)', category: 'Lymphoid & Immune', system: 'organs', icon: Activity, desc: 'Erythrocyte quality control and systemic immunological surveillance.' },
];

export default function HumanomeSystemsPanel({
  activeSystems,
  onToggleSystem,
  systemOpacities,
  onChangeOpacity,
  viewMode,
  onChangeViewMode,
  selectedStructure,
  onSelectStructureByName,
  onAskNeuroAI,
}: HumanomeSystemsPanelProps) {
  const [activeTab, setActiveTab] = useState<'systems' | 'organs'>('organs');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedSystem, setInspectedSystem] = useState<AnatomySystemId>('organs');

  const inspectedCfg = ANATOMY_SYSTEMS[inspectedSystem];

  const filteredOrgans = MAJOR_HUMAN_ORGANS.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="slim-scroll flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="h-tick">Human Anatomy Studio</span>
          <span className="rounded border border-synapse/30 bg-synapse/10 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-synapse">
            Z-ANATOMY MEDICAL 3D
          </span>
        </div>

        {/* Tab switch between Organs Explorer & Systems Master Layer */}
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

        {/* Radiological / Optical Render Modes (X-Ray, CT, MRI, Realistic) */}
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

      {/* Main Tab Content */}
      <div className="space-y-3 p-4 text-[10px]">
        {activeTab === 'organs' ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-dim" />
              <input
                type="text"
                placeholder="Search any organ (Liver, Heart, Kidney, Brain...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-edge bg-void/90 py-1.5 pl-8 pr-3 font-mono text-[8px] text-ink placeholder:text-dim focus:border-synapse focus:outline-none"
              />
            </div>

            {/* Organs Grid */}
            <div className="space-y-1.5">
              <span className="h-tick text-[7px]">Every Human Organ & Visceral Machinery</span>
              {filteredOrgans.map((organ) => {
                const Icon = organ.icon;
                const isSelected = selectedStructure?.name.toLowerCase().includes(organ.name.split(' ')[0].toLowerCase());

                return (
                  <div
                    key={organ.name}
                    className={`rounded-md border p-2 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-400/20 text-ink shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'border-edge bg-void/40 text-mute hover:border-synapse/40 hover:bg-void/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-synapse/15 text-synapse">
                          <Icon size={12} />
                        </div>
                        <div>
                          <span className="block font-display text-[11px] font-bold text-ink">
                            {organ.name}
                          </span>
                          <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-synapse">
                            {organ.category}
                          </span>
                          <p className="mt-0.5 text-[8.5px] leading-relaxed text-mute">{organ.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onSelectStructureByName) {
                            onSelectStructureByName(organ.name, organ.system as AnatomySystemId);
                          }
                          onAskNeuroAI(
                            `Provide a comprehensive medical and anatomical breakdown of the human ${organ.name}: its physiological role, arterial vascular supply, autonomic innervation, microscopic histology, and major clinical diseases.`,
                          );
                        }}
                        title="Inspect with NeuroAI"
                        className="rounded border border-synapse/30 bg-synapse/10 p-1 text-synapse transition-colors hover:bg-synapse/25"
                      >
                        <Sparkles size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Systems Tab with Opacity Sliders */
          <div>
            <span className="h-tick text-[7px]">Toggleable Anatomical System Layers</span>
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
                          <span className="block font-mono text-[6.5px] italic text-dim">
                            {cfg.latinName}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => onToggleSystem(sysId)}
                        title={isActive ? 'Hide System Layer' : 'Show System Layer'}
                        className={`rounded p-1 transition-all ${
                          isActive
                            ? 'border border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                            : 'border border-edge bg-panel text-dim hover:text-mute'
                        }`}
                      >
                        {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>

                    {/* Opacity Slider */}
                    {isActive && (
                      <div className="mt-2 flex items-center gap-2 border-t border-edge/40 pt-1.5 font-mono text-[7px] text-dim">
                        <span className="w-12 shrink-0">Opacity:</span>
                        <input
                          type="range"
                          min="0.05"
                          max="1.0"
                          step="0.05"
                          value={systemOpacities[sysId] ?? cfg.xrayOpacity}
                          onChange={(e) => onChangeOpacity(sysId, parseFloat(e.target.value))}
                          className="h-1 flex-1 accent-synapse cursor-pointer bg-void rounded"
                        />
                        <span className="w-6 text-right tabular-nums text-ink">
                          {Math.round((systemOpacities[sysId] ?? cfg.xrayOpacity) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Structure Callout if Clicked */}
        {selectedStructure && (
          <div className="rounded-md border border-cyan-400/40 bg-cyan-400/10 p-2.5 shadow-sm">
            <span className="font-mono text-[6.5px] font-bold uppercase tracking-[0.16em] text-cyan-300">
              Selected Anatomical Structure:
            </span>
            <span className="mt-0.5 block font-display text-[12px] font-bold text-ink">
              {selectedStructure.name}
            </span>
            <span className="font-mono text-[7px] text-mute">
              Part of {selectedStructure.system}
            </span>
            <button
              onClick={() =>
                onAskNeuroAI(
                  `Explain the function, innervation, arterial supply and clinical pathology of the anatomical structure: ${selectedStructure.name}`,
                )
              }
              className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-cyan-500/20 py-1 font-mono text-[7.5px] font-bold uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-500/30"
            >
              <Sparkles size={10} /> Clinical Breakdown with NeuroAI
            </button>
          </div>
        )}

        {/* Inspected System Detailed Clinical Dossier */}
        <div className="rounded-md border border-edgec bg-void/60 p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[13px] font-bold text-ink">{inspectedCfg.name}</span>
            <span className="rounded bg-synapse/15 px-1.5 py-0.5 font-mono text-[6.5px] font-bold text-synapse">
              {inspectedCfg.structuresCount}
            </span>
          </div>
          <span className="font-mono text-[7px] italic text-mute">{inspectedCfg.latinName}</span>

          <p className="mt-2 leading-relaxed text-[9px] text-ink/90">{inspectedCfg.description}</p>

          <div className="mt-2.5 rounded border border-edge bg-void/80 p-2">
            <span className="flex items-center gap-1 font-mono text-[6.5px] font-bold uppercase tracking-[0.16em] text-amber-300">
              <Stethoscope size={10} /> Clinical Pathology & Medicine:
            </span>
            <p className="mt-1 text-[8.5px] leading-relaxed text-mute">
              {inspectedCfg.clinicalSignificance}
            </p>
          </div>

          <button
            onClick={() =>
              onAskNeuroAI(
                `Provide a deep medical & neurological breakdown of the human ${inspectedCfg.name} (${inspectedCfg.latinName}), its microscopic physiology, common disorders, and anatomical relationships.`,
              )
            }
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm border border-synapse/40 bg-synapse/10 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-synapse hover:bg-synapse/20"
          >
            <Sparkles size={11} /> Deep Anatomical Breakdown with NeuroAI
          </button>
        </div>
      </div>
    </div>
  );
}
