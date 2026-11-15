import { Activity, Dot, Gauge, FlaskConical, Waves } from 'lucide-react';
import type { NeuroScenario } from '../data/scenarios';
import type { NeuroState } from '../hooks/useNeuroSim';
import { REGIONS } from '../data/regions';
import EEGChart from './EEGChart';
import Meter from './Meter';

interface TelemetryPanelProps {
  scenario: NeuroScenario;
  state: NeuroState;
  getWave: () => number[];
}

const BAND_DEFS = [
  { key: 'delta', label: 'Delta', hz: '0.5–4 Hz', color: '#7A6A9E' },
  { key: 'theta', label: 'Theta', hz: '4–8 Hz', color: '#8E5A78' },
  { key: 'alpha', label: 'Alpha', hz: '8–12 Hz', color: '#C9A961' },
  { key: 'beta', label: 'Beta', hz: '12–30 Hz', color: '#7D8B5A' },
  { key: 'gamma', label: 'Gamma', hz: '30–100 Hz', color: '#C98A2C' },
] as const;

const NT_DEFS = [
  { key: 'dopamine', label: 'Dopamine', tag: 'DA', color: '#C98A2C' },
  { key: 'serotonin', label: 'Serotonin', tag: '5-HT', color: '#7D8B5A' },
  { key: 'cortisol', label: 'Cortisol', tag: 'CORT', color: '#8E3B2F' },
  { key: 'gaba', label: 'GABA', tag: 'GABA', color: '#C9A961' },
  { key: 'acetylcholine', label: 'Acetylcholine', tag: 'ACh', color: '#93485C' },
  { key: 'norepinephrine', label: 'Norepinephrine', tag: 'NE', color: '#A8543C' },
] as const;

export default function TelemetryPanel({ scenario, state, getWave }: TelemetryPanelProps) {
  const { bands, neuro, metrics, activity, synapseCount, signalVelocity, tick } = state;
  const sortedRegions = [...REGIONS].sort((a, b) => activity[b.id] - activity[a.id]);

  return (
    <div className="slim-scroll flex h-full flex-col overflow-y-auto">
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="h-tick flex items-center gap-1.5">
            <Gauge size={9} className="text-synapse" /> Telemetry · Live Cortical Monitor
          </div>
          <span className="flex items-center gap-1 rounded-sm border border-red-400/30 bg-red-400/10 px-1.5 py-0.5 font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-red-300">
            <Dot size={10} className="animate-pulse" /> REC
          </span>
        </div>
        <h2 className="mt-1.5 font-display text-[16px] font-semibold leading-tight text-ink">
          The brain, <span className="serif-accent text-synapse">quantified live</span>
        </h2>
        <div className="mt-1 flex items-center gap-2 font-mono text-[6px] uppercase tracking-[0.18em] text-dim">
          <span>Tick {String(tick).padStart(6, '0')}</span>
          <span>·</span>
          <span style={{ color: scenario.color }}>{scenario.name}</span>
          <span>·</span>
          <span>{signalVelocity.toFixed(1)} m/s conduction</span>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        {/* EEG */}
        <section>
          <div className="h-tick mb-1 flex items-center justify-between text-[6px]">
            <span className="flex items-center gap-1"><Waves size={9} /> EEG · Fz–Cz derivation (simulated)</span>
            <span className="text-synapse">250 Hz sampling</span>
          </div>
          <div className="overflow-hidden rounded-md border hairline bg-[#050B18] p-1.5">
            <EEGChart getWave={getWave} accent={scenario.color} variant="full" />
          </div>
          <div className="mt-1.5 space-y-1">
            {BAND_DEFS.map((b) => (
              <div key={b.key} className="flex items-center gap-2">
                <span className="w-9 shrink-0 font-mono text-[7px] uppercase tracking-[0.14em]" style={{ color: b.color }}>
                  {b.label}
                </span>
                <div className="meter-track h-[4px] flex-1">
                  <div
                    className="meter-fill h-full"
                    style={{ width: `${bands[b.key]}%`, background: b.color, boxShadow: `0 0 6px ${b.color}88` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-[6px] tabular-nums text-mute">
                  {b.hz} · {bands[b.key].toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Neurochemistry */}
        <section>
          <div className="h-tick mb-1 flex items-center gap-1 text-[6px]">
            <FlaskConical size={9} /> Neurochemistry · synaptic tone
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border hairline bg-panel/50 p-2.5">
            {NT_DEFS.map((nt) => (
              <Meter key={nt.key} label={`${nt.tag}`} value={neuro[nt.key]} color={nt.color} sub={neuro[nt.key].toFixed(0)} compact />
            ))}
          </div>
        </section>

        {/* Global metrics */}
        <section>
          <div className="h-tick mb-1 flex items-center gap-1 text-[6px]">
            <Activity size={9} /> Global network metrics
          </div>
          <div className="space-y-1.5 rounded-md border hairline bg-panel/50 p-2.5">
            <Meter label="Signal efficiency" value={metrics.signalEfficiency} color="#C9A961" sub={`${metrics.signalEfficiency.toFixed(0)}%`} />
            <Meter label="Focus index" value={metrics.focusIndex} color="#7D8B5A" sub={`${metrics.focusIndex.toFixed(0)}%`} />
            <Meter label="Neural synchrony" value={metrics.neuralSync} color="#B5653A" sub={`${metrics.neuralSync.toFixed(0)}%`} />
            <Meter label="Plasticity reserve" value={metrics.plasticity} color="#C98A2C" sub={`${metrics.plasticity.toFixed(0)}%`} />
          </div>
        </section>

        {/* Regional heatmap */}
        <section>
          <div className="h-tick mb-1 text-[6px]">Regional firing · hottest first</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-md border hairline bg-panel/50 p-2.5">
            {sortedRegions.map((r) => (
              <div key={r.id} className="flex items-center gap-1.5">
                <span className="w-20 truncate font-mono text-[6px] uppercase tracking-[0.08em] text-mute">
                  {r.name.replace(' Cortex', '').replace(' Association', '').replace(' Lobe', '').replace('Primary ', '')}
                </span>
                <div className="meter-track h-[3px] flex-1">
                  <div className="meter-fill h-full" style={{ width: `${activity[r.id]}%`, background: r.color }} />
                </div>
                <span className="w-6 text-right font-mono text-[6px] tabular-nums text-dim">{activity[r.id].toFixed(0)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* firehose counters */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="glass-panel-soft rounded-md px-2.5 py-2">
            <div className="h-tick text-[5.5px]">Synapses fired</div>
            <div className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-synapse">
              {synapseCount.toLocaleString('en-US')}
            </div>
          </div>
          <div className="glass-panel-soft rounded-md px-2.5 py-2">
            <div className="h-tick text-[5.5px]">EPSPs · this session</div>
            <div className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-neural">
              {Math.floor(synapseCount / 13.7).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        <p className="pb-2 text-center font-mono text-[5.5px] uppercase leading-relaxed tracking-[0.18em] text-dim">
          Simulated telemetry for education · not diagnostic EEG
        </p>
      </div>
    </div>
  );
}
