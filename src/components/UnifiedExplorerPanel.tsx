import { useState } from 'react';
import {
  Brain,
  Sparkles,
  Layers,
  ChevronRight,
  Stethoscope,
  Activity,
  HeartPulse,
  Eye,
  Sliders,
  ChevronLeft,
} from 'lucide-react';
import { BODY_PARTS, BODY_PART_MAP, type BodyPartId, type ViewMode } from '../data/bodySystems';
import { REGIONS, REGION_MAP, type RegionId } from '../data/regions';
import type { SystemLayerVisibility } from '../data/anatomyLayers';

interface UnifiedExplorerPanelProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedRegion: RegionId | null;
  onSelectRegion: (id: RegionId | null) => void;
  selectedBodyPart: BodyPartId | null;
  onSelectBodyPart: (id: BodyPartId | null) => void;
  layers: SystemLayerVisibility;
  onToggleLayer: (layer: keyof SystemLayerVisibility) => void;
  regionActivity: Record<RegionId, number>;
  bodyPartActivity: Record<BodyPartId, number>;
  onAskNeuroAI: (query: string) => void;
}

export default function UnifiedExplorerPanel({
  viewMode,
  onViewModeChange,
  selectedRegion,
  onSelectRegion,
  selectedBodyPart,
  onSelectBodyPart,
  layers,
  onToggleLayer,
  regionActivity,
  bodyPartActivity,
  onAskNeuroAI,
}: UnifiedExplorerPanelProps) {
  const [activeSystemFilter, setActiveSystemFilter] = useState<string>('ALL');

  // If a region is selected in Brain mode
  if (viewMode === 'brain' && selectedRegion) {
    const reg = REGION_MAP[selectedRegion];
    const live = regionActivity[reg.id] ?? reg.baseActivity;
    return (
      <div className="slim-scroll flex h-full flex-col overflow-y-auto">
        <div className="border-b hairline px-4 pb-3 pt-3">
          <button
            onClick={() => onSelectRegion(null)}
            className="mb-2 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-synapse"
          >
            <ChevronLeft size={11} /> All Brain Regions
          </button>
          <div className="flex items-center justify-between">
            <span className="h-tick">Cortical Territory</span>
            <span className="rounded bg-synapse/15 px-1.5 py-0.5 font-mono text-[7px] text-synapse">
              {reg.hemisphere}
            </span>
          </div>
          <div className="mt-2 flex items-start gap-2.5">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
              style={{ borderColor: `${reg.color}66`, background: `${reg.color}15` }}
            >
              <Brain size={18} style={{ color: reg.color }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-[15px] font-bold text-ink">{reg.name}</h2>
              <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-mute">{reg.tagline}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 p-4 text-[10px]">
          <div>
            <div className="flex items-center justify-between font-mono text-[7.5px] uppercase tracking-[0.16em] text-dim">
              <span>Synaptic Activity</span>
              <span className="font-bold text-ink">{live.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-void">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${live}%`, background: reg.color }}
              />
            </div>
          </div>

          <div>
            <span className="h-tick text-[7px]">Description</span>
            <p className="mt-1 leading-relaxed text-ink/90">{reg.description}</p>
          </div>

          <div>
            <span className="h-tick text-[7px]">Key Cognitive Functions</span>
            <ul className="mt-1 space-y-1">
              {reg.functions.map((fn, i) => (
                <li key={i} className="flex items-center gap-1.5 text-mute">
                  <span className="h-1 w-1 rounded-full bg-synapse" />
                  <span>{fn}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-edgec bg-void/50 p-2.5">
            <span className="flex items-center gap-1 font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              <Stethoscope size={11} /> Clinical Sign
            </span>
            <p className="mt-1 text-[9px] leading-relaxed text-mute">{reg.clinical}</p>
          </div>

          <button
            onClick={() => onAskNeuroAI(`Explain the neurological role and clinical significance of ${reg.name}`)}
            className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-synapse/40 bg-synapse/10 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-synapse hover:bg-synapse/20"
          >
            <Sparkles size={11} /> Ask NeuroAI About This Region
          </button>
        </div>
      </div>
    );
  }

  // If a full-body organ/nerve/part is selected
  if (selectedBodyPart) {
    const part = BODY_PART_MAP[selectedBodyPart];
    const live = bodyPartActivity[part.id] ?? part.firingPropensity;
    return (
      <div className="slim-scroll flex h-full flex-col overflow-y-auto">
        <div className="border-b hairline px-4 pb-3 pt-3">
          <button
            onClick={() => onSelectBodyPart(null)}
            className="mb-2 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-synapse"
          >
            <ChevronLeft size={11} /> All Body Systems
          </button>
          <div className="flex items-center justify-between">
            <span className="h-tick">{part.system}</span>
            <span className="rounded bg-synapse/15 px-1.5 py-0.5 font-mono text-[7px] text-synapse">ACTIVE</span>
          </div>
          <div className="mt-2 flex items-start gap-2.5">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
              style={{ borderColor: `${part.color}66`, background: `${part.color}15` }}
            >
              <HeartPulse size={18} style={{ color: part.color }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-[15px] font-bold text-ink">{part.name}</h2>
              <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-mute">{part.tagline}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 p-4 text-[10px]">
          <div>
            <div className="flex items-center justify-between font-mono text-[7.5px] uppercase tracking-[0.16em] text-dim">
              <span>Neural Firing Propensity</span>
              <span className="font-bold text-ink">{live.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-void">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${live}%`, background: part.color }}
              />
            </div>
          </div>

          <div>
            <span className="h-tick text-[7px]">Anatomical Location</span>
            <p className="mt-1 text-mute">{part.anatomicalLocation}</p>
          </div>

          <div>
            <span className="h-tick text-[7px]">Innervation & Fiber Type</span>
            <p className="mt-1 text-[9px] text-ink/90">{part.innervation}</p>
            <p className="mt-0.5 font-mono text-[7.5px] text-dim">{part.nerveFiberType}</p>
          </div>

          <div>
            <span className="h-tick text-[7px]">Deep Physiology</span>
            <p className="mt-1 leading-relaxed text-ink/90">{part.deepPhysiology}</p>
          </div>

          <div>
            <span className="h-tick text-[7px]">Primary Functions</span>
            <ul className="mt-1 space-y-1">
              {part.keyFunctions.map((fn, i) => (
                <li key={i} className="flex items-center gap-1.5 text-mute">
                  <span className="h-1 w-1 rounded-full bg-synapse" />
                  <span>{fn}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-edgec bg-void/50 p-2.5">
            <span className="flex items-center gap-1 font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              <Stethoscope size={11} /> Clinical Pearls
            </span>
            <p className="mt-1 text-[9px] leading-relaxed text-mute">{part.clinicalPearls}</p>
          </div>

          <button
            onClick={() => onAskNeuroAI(`Explain the complete physiology, innervation and pathology of ${part.name}`)}
            className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-synapse/40 bg-synapse/10 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-synapse hover:bg-synapse/20"
          >
            <Sparkles size={11} /> Ask NeuroAI About This System
          </button>
        </div>
      </div>
    );
  }

  // Master Atlas Overview (Selectable Systems / Layers / Parts)
  const systems = ['ALL', 'Central Nervous', 'Peripheral Nervous', 'Autonomic & Visceral', 'Integumentary & Sensory'];
  const filteredParts =
    activeSystemFilter === 'ALL'
      ? BODY_PARTS
      : BODY_PARTS.filter((p) => p.system === activeSystemFilter);

  return (
    <div className="flex h-full flex-col">
      {/* View Switcher Header */}
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="h-tick">Interactive Anatomical Atlas</span>
          <span className="rounded border border-synapse/30 bg-synapse/10 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-synapse">
            3D SPATIAL ENGINE
          </span>
        </div>

        {/* View Mode Pills */}
        <div className="mt-2.5 grid grid-cols-3 gap-1 rounded bg-void/80 p-1">
          <button
            onClick={() => onViewModeChange('fullbody')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              viewMode === 'fullbody' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Full Body
          </button>
          <button
            onClick={() => onViewModeChange('nervous')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              viewMode === 'nervous' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Nervous
          </button>
          <button
            onClick={() => onViewModeChange('brain')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              viewMode === 'brain' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Brain Focus
          </button>
        </div>

        {/* Anatomy Layer Visibility Toggles */}
        <div className="mt-2.5 border-t border-edge pt-2">
          <div className="flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.18em] text-dim">
            <span>Anatomical Layers</span>
            <Sliders size={9} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <button
              onClick={() => onToggleLayer('centralNervous')}
              className={`rounded border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] transition-all ${
                layers.centralNervous ? 'border-amber-400/40 bg-amber-400/15 text-amber-300' : 'border-edge text-dim'
              }`}
            >
              CNS (Brain/Cord)
            </button>
            <button
              onClick={() => onToggleLayer('peripheralNerves')}
              className={`rounded border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] transition-all ${
                layers.peripheralNerves ? 'border-blue-400/40 bg-blue-400/15 text-blue-300' : 'border-edge text-dim'
              }`}
            >
              PNS (Nerves)
            </button>
            <button
              onClick={() => onToggleLayer('autonomicOrgans')}
              className={`rounded border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] transition-all ${
                layers.autonomicOrgans ? 'border-rose-400/40 bg-rose-400/15 text-rose-300' : 'border-edge text-dim'
              }`}
            >
              Organs & Plexus
            </button>
            <button
              onClick={() => onToggleLayer('skinIntegumentary')}
              className={`rounded border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] transition-all ${
                layers.skinIntegumentary ? 'border-amber-600/40 bg-amber-600/15 text-amber-200' : 'border-edge text-dim'
              }`}
            >
              Skin Shell
            </button>
            <button
              onClick={() => onToggleLayer('dermatomeBands')}
              className={`rounded border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] transition-all ${
                layers.dermatomeBands ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300' : 'border-edge text-dim'
              }`}
            >
              Dermatomes C2–S5
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs if Full Body */}
      {viewMode !== 'brain' && (
        <div className="flex gap-1 overflow-x-auto border-b hairline px-3 py-1.5">
          {systems.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSystemFilter(s)}
              className={`shrink-0 rounded px-2 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] ${
                activeSystemFilter === s ? 'bg-synapse/20 text-synapse font-bold' : 'text-dim hover:text-mute'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Item List Scroll Area */}
      <div className="slim-scroll flex-1 overflow-y-auto px-2 py-2">
        {viewMode === 'brain' ? (
          // 12 Brain Regions
          REGIONS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => onSelectRegion(r.id)}
              className="group flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-void/60"
            >
              <span className="font-mono text-[7.5px] tabular-nums text-dim">{String(i + 1).padStart(2, '0')}</span>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[10.5px] font-medium text-ink group-hover:text-synapse">
                  {r.name}
                </span>
                <span className="block truncate font-mono text-[6px] uppercase tracking-[0.14em] text-dim">
                  {r.tagline}
                </span>
              </span>
              <ChevronRight size={11} className="text-dim group-hover:text-synapse" />
            </button>
          ))
        ) : (
          // Body Parts & Systems
          filteredParts.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onSelectBodyPart(p.id)}
              className="group flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-void/60"
            >
              <span className="font-mono text-[7.5px] tabular-nums text-dim">{String(i + 1).padStart(2, '0')}</span>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[10.5px] font-medium text-ink group-hover:text-synapse">
                  {p.name}
                </span>
                <span className="block truncate font-mono text-[6px] uppercase tracking-[0.14em] text-dim">
                  {p.tagline}
                </span>
              </span>
              <div className="flex w-10 shrink-0 flex-col items-end">
                <span className="font-mono text-[6px] tabular-nums text-dim">
                  {(bodyPartActivity[p.id] ?? p.firingPropensity).toFixed(0)}%
                </span>
              </div>
              <ChevronRight size={11} className="text-dim group-hover:text-synapse" />
            </button>
          ))
        )}
      </div>

      <div className="border-t hairline px-4 py-2">
        <p className="font-mono text-[6.5px] uppercase tracking-[0.16em] text-dim">
          Click any 3D organ or nerve node to inspect deep physiological circuitry
        </p>
      </div>
    </div>
  );
}
