import { useEffect, useRef } from 'react';
import { Zap, ChevronRight, Loader2, Terminal, CheckCircle2, ScanEye, Shield, BrainCircuit, Dumbbell } from 'lucide-react';
import type { NeuralPathway } from '../data/pathways';
import { PATHWAYS } from '../data/pathways';
import { REGION_MAP } from '../data/regions';

export interface SignalLogLine {
  id: number;
  time: string;
  text: string;
  kind: 'path' | 'hit' | 'done' | 'info';
}

interface SignalsPanelProps {
  activePathway: string;
  onSelectPathway: (id: string) => void;
  onFire: () => void;
  firing: boolean;
  currentStep: number;
  completedSteps: number;
  log: SignalLogLine[];
}

const PATHWAY_ICONS = [ScanEye, Shield, BrainCircuit, Dumbbell];

export default function SignalsPanel({
  activePathway,
  onSelectPathway,
  onFire,
  firing,
  currentStep,
  completedSteps,
  log,
}: SignalsPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="h-tick flex items-center justify-between">
          <span>Signal Propagation Theater</span>
          <span className="text-synapse">4 CIRCUITS</span>
        </div>
        <h2 className="mt-1.5 font-display text-[16px] font-semibold leading-tight text-ink">
          Fire a <span className="serif-accent text-synapse">neural cascade</span>
        </h2>
        <p className="mt-1 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-mute">
          Watch action potentials race between regions in real time
        </p>
      </div>

      <div className="slim-scroll flex-1 overflow-y-auto px-3 py-2.5">
        {/* pathway cards */}
        <div className="grid grid-cols-1 gap-2">
          {PATHWAYS.map((p, i) => {
            const active = p.id === activePathway;
            const Icon = PATHWAY_ICONS[i % PATHWAY_ICONS.length];
            return (
              <button
                key={p.id}
                onClick={() => onSelectPathway(p.id)}
                className={`scenario-card rounded-md bg-panel/60 p-2.5 text-left ${active ? 'active' : ''}`}
                style={{ ['--sc' as string]: p.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border"
                      style={{ borderColor: `${p.color}55`, background: `${p.color}14` }}
                    >
                      <Icon size={14} style={{ color: p.color }} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[11px] font-semibold text-ink">{p.name}</span>
                      <span className="block truncate font-mono text-[6.5px] uppercase tracking-[0.14em] text-mute">
                        {p.tagline}
                      </span>
                    </span>
                  </div>
                  <ChevronRight size={13} className={`shrink-0 text-dim transition-all ${active ? 'rotate-90 text-synapse' : ''}`} />
                </div>

                {active && (
                  <div className="mt-2 border-t border-white/5 pt-2">
                    <p className="text-[9px] leading-snug text-ink/75">{p.description}</p>
                    <ol className="mt-2 space-y-1">
                      {p.steps.map((s, si) => {
                        const done = completedSteps > si;
                        const current = firing && currentStep === si;
                        return (
                          <li key={si} className="flex items-start gap-1.5">
                            <span
                              className={`mt-[1px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border font-mono text-[6.5px] ${
                                done
                                  ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                                  : current
                                    ? 'border-synapse/60 bg-synapse/15 text-synapse'
                                    : 'border-white/10 text-dim'
                              }`}
                            >
                              {done ? '✓' : si + 1}
                            </span>
                            <span className="min-w-0">
                              <span className={`block font-mono text-[7px] uppercase leading-tight tracking-[0.08em] ${current ? 'text-synapse' : 'text-mute'}`}>
                                {REGION_MAP[s.from].name.split(' ')[0]} → {REGION_MAP[s.to].name.split(' ')[0]} · {s.label}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    <p className="serif-accent mt-2 border-l-2 pl-2 text-[9px] leading-snug text-ink/60" style={{ borderColor: `${p.color}66` }}>
                      {p.insight}
                    </p>
                    <button
                      onClick={onFire}
                      disabled={firing}
                      className="btn-neural mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.24em] disabled:cursor-wait disabled:opacity-60"
                    >
                      {firing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {firing ? 'Signal propagating…' : 'Fire signal'}
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* terminal log */}
        <div className="mt-2.5 overflow-hidden rounded-md border border-synapse/15 bg-[#050B18]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-2.5 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[0.24em] text-mute">
              <Terminal size={9} className="text-synapse" /> Propagation log
            </span>
            <span className="flex gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
              <i className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            </span>
          </div>
          <div ref={logRef} className="slim-scroll h-36 space-y-[3px] overflow-y-auto px-2.5 py-2 font-mono text-[8px] leading-relaxed">
            {log.length === 0 ? (
              <p className="text-dim">// awaiting ignition — select a circuit and fire the signal…</p>
            ) : (
              log.map((l) => (
                <p key={l.id} className="flex gap-1.5">
                  <span className="shrink-0 tabular-nums text-dim">[{l.time}]</span>
                  <span
                    className={
                      l.kind === 'hit'
                        ? 'text-emerald-300'
                        : l.kind === 'done'
                          ? 'text-goldspark'
                          : l.kind === 'path'
                            ? 'text-cyan-300'
                            : 'text-mute'
                    }
                  >
                    {l.text}
                  </span>
                </p>
              ))
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1.5">
          <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
          <p className="font-mono text-[7px] uppercase leading-relaxed tracking-[0.14em] text-emerald-200/70">
            Conduction velocity modeled: 0.5–120 m/s · myelinated corticospinal fibers ≈ 80–100 m/s
          </p>
        </div>
      </div>
    </div>
  );
}
