import { Brain, Waypoints, Biohazard, Sparkles, Gauge } from 'lucide-react';
import type { ComponentType } from 'react';

export type Mode = 'explore' | 'signals' | 'scenarios' | 'neuroai' | 'telemetry';

const MODES: { id: Mode; label: string; sub: string; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; key: string }[] = [
  { id: 'explore', label: 'EXPLORE', sub: 'Regions', icon: Brain, key: '1' },
  { id: 'signals', label: 'SIGNALS', sub: 'Propagation', icon: Waypoints, key: '2' },
  { id: 'scenarios', label: 'SCENARIOS', sub: 'Pathologies', icon: Biohazard, key: '3' },
  { id: 'neuroai', label: 'NEUROAI', sub: 'Tutor', icon: Sparkles, key: '4' },
  { id: 'telemetry', label: 'TELEMETRY', sub: 'Live EEG', icon: Gauge, key: '5' },
];

export default function Sidebar({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <nav className="relative z-20 flex w-[64px] shrink-0 flex-col items-center justify-between border-r hairline bg-abyss/85 py-3 backdrop-blur-md lg:w-[88px]">
      <div className="flex w-full flex-col items-center gap-1.5 px-1.5">
        <span className="h-tick mb-1 hidden text-[6.5px] lg:block">MODULES</span>
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onMode(m.id)}
              title={`${m.label} — press ${m.key}`}
              className={`mode-btn group relative flex w-full flex-col items-center gap-1 rounded-md px-1 py-2.5 text-mute ${active ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.75} className={active ? 'text-synapse' : 'text-mute group-hover:text-synapse'} />
              <span className="font-mono text-[7px] font-semibold tracking-[0.18em]">{m.label}</span>
              <span className="hidden font-mono text-[5.5px] uppercase tracking-[0.14em] text-dim lg:block">
                {m.sub}
              </span>
              <span className="absolute right-1 top-1 hidden font-mono text-[6px] text-dim/70 xl:block">{m.key}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 px-2 text-center">
        <div className="hidden h-px w-8 bg-gradient-to-r from-transparent via-synapse/40 to-transparent lg:block" />
        <div className="hidden flex-col gap-1 lg:flex">
          <span className="font-mono text-[8.5px] font-bold tabular-nums text-synapse">100T</span>
          <span className="font-mono text-[6px] uppercase leading-tight tracking-[0.16em] text-mute">synapses</span>
        </div>
        <div className="hidden flex-col gap-1 lg:flex">
          <span className="font-mono text-[8.5px] font-bold tabular-nums text-neural">20W</span>
          <span className="font-mono text-[6px] uppercase leading-tight tracking-[0.16em] text-mute">power draw</span>
        </div>
        <div className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-synapse/80" />
      </div>
    </nav>
  );
}
