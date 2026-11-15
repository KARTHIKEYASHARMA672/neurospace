import { useState } from 'react';
import { Play, RotateCcw, Zap, Sparkles, CheckCircle2, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { PATHWAYS, type NeuralPathway } from '../data/pathways';
import { FULL_BODY_CASCADES, type FullBodyNeuralCascade } from '../data/bodyCascades';
import { REGION_MAP, type RegionId } from '../data/regions';
import { BODY_PART_MAP, type BodyPartId } from '../data/bodySystems';

export interface UnifiedSignalLog {
  id: number;
  time: string;
  from: string;
  to: string;
  label: string;
  velocity: string;
}

interface UnifiedSignalsPanelProps {
  onFireBrainPathway: (pathway: NeuralPathway) => void;
  onFireBodyCascade: (cascade: FullBodyNeuralCascade) => void;
  firing: boolean;
  currentStep: number;
  log: UnifiedSignalLog[];
  onAskNeuroAI: (query: string) => void;
}

export default function UnifiedSignalsPanel({
  onFireBrainPathway,
  onFireBodyCascade,
  firing,
  currentStep,
  log,
  onAskNeuroAI,
}: UnifiedSignalsPanelProps) {
  const [tab, setTab] = useState<'fullbody' | 'brain'>('fullbody');
  const [selectedBodyCascadeId, setSelectedBodyCascadeId] = useState(FULL_BODY_CASCADES[0].id);
  const [selectedBrainPathwayId, setSelectedBrainPathwayId] = useState(PATHWAYS[0].id);

  const activeBodyCascade = FULL_BODY_CASCADES.find((c) => c.id === selectedBodyCascadeId)!;
  const activeBrainPathway = PATHWAYS.find((p) => p.id === selectedBrainPathwayId)!;

  return (
    <div className="slim-scroll flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="h-tick">Signal Propagation Engine</span>
          <span className="rounded border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-emerald-300">
            ACTION POTENTIALS
          </span>
        </div>

        {/* Tab switch: Full Body Reflexes vs Brain Cortical Arc */}
        <div className="mt-2.5 grid grid-cols-2 gap-1 rounded bg-void/80 p-1">
          <button
            onClick={() => setTab('fullbody')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              tab === 'fullbody' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Body Reflexes & Circuits
          </button>
          <button
            onClick={() => setTab('brain')}
            className={`rounded py-1 text-center font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] transition-all ${
              tab === 'brain' ? 'bg-synapse text-abyss shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            Brain Cortical Loops
          </button>
        </div>
      </div>

      {/* Main Cascade Selector & Execution */}
      <div className="space-y-3.5 p-4 text-[10px]">
        {tab === 'fullbody' ? (
          <>
            <div>
              <span className="h-tick text-[7px]">Select Body Neural Circuit</span>
              <div className="mt-1.5 space-y-1">
                {FULL_BODY_CASCADES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedBodyCascadeId(c.id)}
                    className={`flex w-full items-center justify-between rounded-sm border p-2 text-left transition-all ${
                      selectedBodyCascadeId === c.id
                        ? 'border-synapse/50 bg-synapse/15 text-ink'
                        : 'border-edge bg-void/40 text-mute hover:border-synapse/25'
                    }`}
                  >
                    <div>
                      <span className="block font-display text-[10.5px] font-semibold">{c.name}</span>
                      <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-dim">{c.tagline}</span>
                    </div>
                    <span className="rounded bg-synapse/10 px-1.5 py-0.5 font-mono text-[6.5px] font-bold text-synapse">
                      {c.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Cascade Overview */}
            <div className="rounded-md border border-edgec bg-void/60 p-3">
              <span className="font-display text-[12px] font-bold text-ink">{activeBodyCascade.name}</span>
              <p className="mt-1 text-[9px] leading-relaxed text-mute">{activeBodyCascade.overview}</p>
              <div className="mt-2 rounded bg-synapse/5 p-2 border border-synapse/20">
                <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-amber-300">
                  Physiological Velocity & Conduction:
                </span>
                <p className="mt-0.5 text-[8.5px] text-ink/80">{activeBodyCascade.physiologicalImpact}</p>
              </div>

              {/* Hop Breakdown */}
              <div className="mt-3 space-y-1.5">
                <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-dim">Circuit Hop Sequence:</span>
                {activeBodyCascade.hops.map((hop, idx) => {
                  const isCurrent = firing && currentStep === idx;
                  const isDone = firing && currentStep > idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded border p-1.5 transition-all ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-400/20 text-ink shadow-[0_0_10px_rgba(201,169,97,0.3)]'
                          : isDone
                          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                          : 'border-edge bg-void/30 text-mute'
                      }`}
                    >
                      <span className="font-mono text-[8px] font-bold text-synapse">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[9.5px] text-ink">{hop.label}</span>
                          <span className="font-mono text-[6.5px] text-dim">{hop.velocityMs}</span>
                        </div>
                        <p className="text-[8px] text-mute">{hop.blurb}</p>
                        <span className="font-mono text-[6.5px] text-synapse/70">Track: {hop.nerveTrack}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fire Button */}
              <button
                disabled={firing}
                onClick={() => onFireBodyCascade(activeBodyCascade)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-sm py-2.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] transition-all ${
                  firing
                    ? 'bg-amber-400/30 text-amber-200 cursor-not-allowed'
                    : 'bg-synapse text-abyss hover:bg-synapse/90 shadow-md'
                }`}
              >
                <Play size={12} fill="currentColor" />
                {firing ? 'Propagating Action Potential...' : 'Fire Full-Body Neural Circuit'}
              </button>
            </div>
          </>
        ) : (
          /* Brain Cortical Loops */
          <>
            <div>
              <span className="h-tick text-[7px]">Select Cortical Pathway</span>
              <div className="mt-1.5 space-y-1">
                {PATHWAYS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedBrainPathwayId(p.id)}
                    className={`flex w-full items-center justify-between rounded-sm border p-2 text-left transition-all ${
                      selectedBrainPathwayId === p.id
                        ? 'border-synapse/50 bg-synapse/15 text-ink'
                        : 'border-edge bg-void/40 text-mute hover:border-synapse/25'
                    }`}
                  >
                    <div>
                      <span className="block font-display text-[10.5px] font-semibold">{p.name}</span>
                      <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-dim">{p.tagline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Brain Pathway Overview */}
            <div className="rounded-md border border-edgec bg-void/60 p-3">
              <span className="font-display text-[12px] font-bold text-ink">{activeBrainPathway.name}</span>
              <p className="mt-1 text-[9px] leading-relaxed text-mute">{activeBrainPathway.description}</p>
              <div className="mt-2 rounded bg-synapse/5 p-2 border border-synapse/20">
                <span className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-amber-300">
                  Neuroscience Insight:
                </span>
                <p className="mt-0.5 text-[8.5px] text-ink/80">{activeBrainPathway.insight}</p>
              </div>

              {/* Hop Breakdown */}
              <div className="mt-3 space-y-1.5">
                <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-dim">Cortical Stations:</span>
                {activeBrainPathway.steps.map((st, idx) => {
                  const isCurrent = firing && currentStep === idx;
                  const isDone = firing && currentStep > idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded border p-1.5 transition-all ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-400/20 text-ink shadow-[0_0_10px_rgba(201,169,97,0.3)]'
                          : isDone
                          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                          : 'border-edge bg-void/30 text-mute'
                      }`}
                    >
                      <span className="font-mono text-[8px] font-bold text-synapse">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[9.5px] text-ink">{st.label}</span>
                          <span className="font-mono text-[6.5px] text-dim">{st.ms} ms</span>
                        </div>
                        <p className="text-[8px] text-mute">{st.blurb}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fire Button */}
              <button
                disabled={firing}
                onClick={() => onFireBrainPathway(activeBrainPathway)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-sm py-2.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] transition-all ${
                  firing
                    ? 'bg-amber-400/30 text-amber-200 cursor-not-allowed'
                    : 'bg-synapse text-abyss hover:bg-synapse/90 shadow-md'
                }`}
              >
                <Play size={12} fill="currentColor" />
                {firing ? 'Firing Cortical Cascade...' : 'Fire Cortical Brain Signal'}
              </button>
            </div>
          </>
        )}

        {/* Live Propagation Telemetry Log */}
        <div>
          <span className="h-tick text-[7px]">Synaptic Impulse Event Log</span>
          <div className="mt-1 max-h-36 overflow-y-auto rounded border border-edge bg-void/90 p-2 font-mono text-[7px] text-mute space-y-1">
            {log.length === 0 ? (
              <span className="text-dim">No signals fired yet. Select a pathway and trigger propagation.</span>
            ) : (
              log.map((l) => (
                <div key={l.id} className="flex items-center gap-1.5 border-b border-edge/40 pb-0.5">
                  <span className="text-synapse">{l.time}</span>
                  <span className="text-ink">{l.from}</span>
                  <ArrowRight size={8} className="text-dim" />
                  <span className="text-ink">{l.to}</span>
                  <span className="text-dim">({l.velocity})</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() =>
            onAskNeuroAI(
              `Explain how action potentials conduct across human nerve fibers, saltatory conduction via nodes of Ranvier, and what happens during ${
                tab === 'fullbody' ? activeBodyCascade.name : activeBrainPathway.name
              }`,
            )
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-synapse/40 bg-synapse/10 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-synapse hover:bg-synapse/20"
        >
          <Sparkles size={11} /> Explain Action Potential Physics With NeuroAI
        </button>
      </div>
    </div>
  );
}
