import { AlertTriangle, CheckCircle2, Flame, FlaskConical, Stethoscope, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { SCENARIOS, type NeuroScenario } from '../data/scenarios';

interface ScenarioPanelProps {
  activeId: string;
  onSelect: (id: string) => void;
  active: NeuroScenario;
  onAskNeuroAI: (q: string) => void;
}

export default function ScenarioPanel({ activeId, onSelect, active, onAskNeuroAI }: ScenarioPanelProps) {
  const critical = active.severity === 'CRITICAL';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="h-tick flex items-center justify-between">
          <span>Scenario Engine · 8 Models</span>
          <FlaskConical size={10} className="text-neural" />
        </div>
        <h2 className="mt-1.5 font-display text-[16px] font-semibold leading-tight text-ink">
          Simulate a <span className="serif-accent text-neural">living pathology</span>
        </h2>
        <p className="mt-1 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-mute">
          Watch EEG, neurochemistry &amp; regional firing shift in real time
        </p>
      </div>

      {critical && (
        <div className="flex animate-flicker items-center gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-1.5">
          <AlertTriangle size={12} className="shrink-0 text-red-400" />
          <p className="font-mono text-[7.5px] font-bold uppercase leading-tight tracking-[0.18em] text-red-300">
            Simulated pathology · educational model — not medical advice
          </p>
        </div>
      )}

      <div className="slim-scroll flex-1 overflow-y-auto px-3 py-2.5">
        {/* active scenario dossier */}
        <div
          key={active.id}
          className="scenario-card active rounded-md bg-panel/70 p-3"
          style={{ ['--sc' as string]: active.color }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="rounded-sm border px-1.5 py-0.5 font-mono text-[6.5px] font-bold uppercase tracking-[0.22em]"
              style={{ borderColor: `${active.color}66`, color: active.color, background: `${active.color}11` }}
            >
              {active.category} · {active.tag}
            </span>
            <span className="font-mono text-[6.5px] uppercase tracking-[0.16em] text-dim">{active.prevalence}</span>
          </div>

          <h3 className="mt-2 font-display text-[19px] font-semibold leading-[1.12] text-ink">{active.name}</h3>
          <p className="serif-accent mt-0.5 text-[10.5px]" style={{ color: active.color }}>
            {active.tagline}
          </p>
          <p className="mt-1.5 text-[9.5px] leading-relaxed text-ink/80">{active.description}</p>

          <div className="mt-2">
            <div className="h-tick flex items-center gap-1.5 text-[6px] text-mute">
              <Flame size={9} className="text-neural" /> Neural mechanism
            </div>
            <ul className="mt-1 space-y-1">
              {active.mechanism.map((m) => (
                <li key={m} className="flex items-start gap-1.5 text-[8.5px] leading-snug text-ink/75">
                  <ChevronRight size={9} className="mt-[2px] shrink-0" style={{ color: active.color }} />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {active.clinical.slice(0, 2).map((c) => (
              <div key={c} className="rounded-sm border border-white/5 bg-black/30 p-1.5">
                <div className="h-tick text-[5px] text-dim">Clinical sign</div>
                <p className="mt-0.5 text-[7.5px] leading-snug text-ink/70">{c}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-sm border border-goldspark/20 bg-goldspark/5 p-2">
            <div className="h-tick flex items-center gap-1 text-[5.5px] text-goldspark/90">
              <Stethoscope size={8} /> Clinical pearl
            </div>
            <p className="serif-accent mt-0.5 text-[9.5px] leading-snug text-amber-100/80">{active.pearl}</p>
          </div>

          <button
            onClick={() => onAskNeuroAI(active.aiSeed)}
            className="btn-neural mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.2em]"
          >
            <Sparkles size={11} /> Ask NeuroAI: “{active.aiSeed.slice(0, 42)}…”
          </button>
        </div>

        {/* selector grid */}
        <div className="h-tick mb-1.5 mt-3 flex items-center gap-1.5 px-1 text-[6px]">
          <Activity size={9} /> Switch simulation
        </div>
        <div className="grid grid-cols-2 gap-1.5 pb-2">
          {SCENARIOS.map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`scenario-card rounded-md p-2 text-left ${isActive ? 'active' : 'bg-panel/50'}`}
                style={{ ['--sc' as string]: s.color }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 7px ${s.color}` }} />
                  <span className="font-mono text-[6px] tabular-nums text-dim">{s.tag}</span>
                </div>
                <span className="mt-1 block font-display text-[9.5px] font-semibold leading-tight text-ink/90">
                  {s.name}
                </span>
                <span className="mt-0.5 block font-mono text-[5.5px] uppercase tracking-[0.14em] text-mute">
                  {s.category}
                </span>
                {isActive && (
                  <span className="mt-1 flex items-center gap-1 font-mono text-[5.5px] uppercase tracking-[0.2em] text-emerald-300">
                    <CheckCircle2 size={7} /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
