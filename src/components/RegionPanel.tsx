import { ChevronLeft, MapPin, Zap, Stethoscope, Sparkles, Brain, RotateCcw, ChevronRight, Fingerprint } from 'lucide-react';
import { REGIONS, REGION_MAP, type RegionId } from '../data/regions';
import Meter from './Meter';

interface RegionPanelProps {
  selected: RegionId | null;
  onSelect: (id: RegionId | null) => void;
  onAskNeuroAI: (regionName: string) => void;
  activity: Record<RegionId, number>;
}

export default function RegionPanel({ selected, onSelect, onAskNeuroAI, activity }: RegionPanelProps) {
  if (!selected) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b hairline px-4 pb-3 pt-3">
          <div className="h-tick flex items-center justify-between">
            <span>Atlas · 12 Regions</span>
            <span className="text-synapse">INDEX</span>
          </div>
          <h2 className="mt-1.5 font-display text-[17px] font-semibold leading-tight text-ink">
            Select a <span className="serif-accent text-synapse">neural territory</span>
          </h2>
          <p className="mt-1 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-mute">
            Click a glowing node on the specimen, or browse the atlas below
          </p>
        </div>
        <div className="slim-scroll flex-1 overflow-y-auto px-2 py-2">
          {REGIONS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="region-row group flex w-full items-center gap-2.5 rounded-sm px-2 py-[7px] text-left"
            >
              <span className="font-mono text-[8px] tabular-nums text-dim">{String(i + 1).padStart(2, '0')}</span>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[11px] font-medium text-ink/90 group-hover:text-ink">
                  {r.name}
                </span>
                <span className="block truncate font-mono text-[6.5px] uppercase tracking-[0.14em] text-mute">
                  {r.tagline}
                </span>
              </span>
              <div className="flex w-14 shrink-0 flex-col items-end gap-0.5">
                <div className="meter-track h-[3px] w-full">
                  <div
                    className="meter-fill h-full"
                    style={{ width: `${activity[r.id]}%`, background: r.color, transition: 'width 0.4s' }}
                  />
                </div>
                <span className="font-mono text-[6px] tabular-nums text-dim">{activity[r.id].toFixed(0)}</span>
              </div>
              <ChevronRight size={12} className="shrink-0 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-synapse" />
            </button>
          ))}
        </div>
        <div className="border-t hairline px-4 py-2.5">
          <p className="font-mono text-[7px] uppercase leading-relaxed tracking-[0.16em] text-dim">
            Live bars = regional firing propensity · modulated by active scenario
          </p>
        </div>
      </div>
    );
  }

  const region = REGION_MAP[selected];
  const index = REGIONS.findIndex((r) => r.id === selected) + 1;
  const live = activity[region.id];

  return (
    <div className="slim-scroll flex h-full flex-col overflow-y-auto">
      <div className="border-b hairline px-4 pb-3 pt-3">
        <button
          onClick={() => onSelect(null)}
          className="mb-2 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.22em] text-mute transition-colors hover:text-synapse"
        >
          <ChevronLeft size={11} /> All regions
        </button>
        <div className="flex items-center justify-between">
          <span className="h-tick">Region file {String(index).padStart(2, '0')}/12</span>
          <button
            onClick={() => onSelect(null)}
            title="Reset camera view"
            className="rounded border hairline p-1 text-mute transition-all hover:border-synapse/40 hover:text-synapse"
          >
            <RotateCcw size={11} />
          </button>
        </div>
        <div className="mt-2 flex items-start gap-2.5">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
            style={{ borderColor: `${region.color}55`, background: `${region.color}14`, boxShadow: `0 0 18px ${region.color}33` }}
          >
            <Brain size={19} style={{ color: region.color }} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[19px] font-semibold leading-[1.1] text-ink">{region.name}</h2>
            <p className="serif-accent mt-0.5 text-[11px]" style={{ color: region.color }}>
              {region.tagline}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="chip inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-mute">
            <MapPin size={8} /> {region.location}
          </span>
          <span className="chip inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-mute">
            <Fingerprint size={8} /> {region.hemisphere} hemisphere{region.hemisphere === 'Bilateral' ? 's' : ''}
          </span>
          {region.deep && (
            <span className="rounded-sm border border-neural/40 bg-neural/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-neural">
              Deep structure · X-ray
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-panel-soft rounded-md p-2.5">
            <div className="h-tick text-[6px]">Population</div>
            <div className="mt-0.5 font-display text-[12px] font-semibold text-ink">{region.neurons}</div>
          </div>
          <div className="glass-panel-soft rounded-md p-2.5">
            <div className="h-tick text-[6px]">Live propensity</div>
            <div className="mt-0.5 font-display text-[12px] font-semibold tabular-nums" style={{ color: region.color }}>
              {live.toFixed(0)}%
            </div>
          </div>
        </div>
        <Meter label="Regional firing propensity" value={live} color={region.color} sub={`${live.toFixed(1)}%`} />

        <p className="text-[10.5px] leading-relaxed text-ink/85">{region.description}</p>

        <div>
          <div className="h-tick mb-1.5 flex items-center gap-1.5">
            <Zap size={9} className="text-goldspark" /> Core functions
          </div>
          <ul className="space-y-1">
            {region.functions.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-[10px] leading-snug text-ink/80">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full" style={{ background: region.color }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-amber-400/15 bg-amber-400/5 p-2.5">
          <div className="h-tick flex items-center gap-1.5 text-[6.5px] text-amber-200/80">
            <Stethoscope size={9} /> Clinical signature
          </div>
          <p className="mt-1 text-[9.5px] leading-snug text-amber-100/70">{region.clinical}</p>
        </div>

        <div className="rounded-md border border-synapse/15 bg-synapse/5 p-2.5">
          <div className="h-tick flex items-center gap-1.5 text-[6.5px] text-synapse/80">
            <Sparkles size={9} /> Neuro trivia
          </div>
          <p className="serif-accent mt-1 text-[10.5px] leading-snug text-cyan-100/80">{region.fact}</p>
        </div>

        <button
          onClick={() => onAskNeuroAI(`Tell me about the ${region.name}`)}
          className="btn-synapse flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.22em]"
        >
          <Sparkles size={12} /> Ask NeuroAI about this region
        </button>
      </div>
    </div>
  );
}
