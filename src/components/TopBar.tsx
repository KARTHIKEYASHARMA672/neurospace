import { GitBranch, Radio, Sparkles, Activity, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ViewMode } from '../data/bodySystems';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return now;
}

function NervousSystemMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden>
      {/* Brain Cranial Dome */}
      <path
        d="M32 8c-7 0-12.5 4.5-12.5 11 0 1.8.3 3.3 1 4.7-2.4 1.6-4 4.6-4 8.3 0 5.8 5 10 11 10 1.6 0 3.2-.4 4.5-1"
        stroke="#30356F"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M32 8c7 0 12.5 4.5 12.5 11 0 1.8-.3 3.3-1 4.7 2.4 1.6 4 4.6 4 8.3 0 5.8-5 10-11 10-1.6 0-3.2-.4-4.5-1"
        stroke="#C9A961"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Spinal Axis & Cord */}
      <path d="M32 10v48" stroke="#C98A2C" strokeWidth="2.4" strokeLinecap="round" />
      {/* Bilateral Nerve Plexus Radiations */}
      <path d="M32 24l-14 6" stroke="#22527B" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 24l14 6" stroke="#22527B" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 38l-12 12" stroke="#9C6B30" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 38l12 12" stroke="#9C6B30" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="24" r="3.2" fill="#C9A961" />
      <circle cx="32" cy="38" r="2.8" fill="#802838" />
    </svg>
  );
}

interface TopBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function TopBar({ viewMode, onViewModeChange }: TopBarProps) {
  const now = useClock();
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b hairline bg-abyss/90 px-3 backdrop-blur-md sm:px-4">
      {/* Brand & Identity */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="drop-shadow-[0_0_12px_rgba(201,169,97,0.45)]">
          <NervousSystemMark />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[15px] font-bold tracking-[0.18em] text-ink">
              NEURO<span className="text-synapse">SPACE</span>
            </h1>
            <span className="hidden rounded-sm border border-synapse/30 bg-synapse/10 px-1.5 py-[1px] font-mono text-[8px] tracking-[0.22em] text-synapse md:inline-block">
              HUMAN ANATOMY 3D v2.0
            </span>
          </div>
          <p className="hidden font-mono text-[7.5px] uppercase tracking-[0.26em] text-mute sm:block">
            3D Human Nervous System, Brain & Full-Body Neural Architecture Simulator
          </p>
        </div>
      </div>

      {/* Spatial View Mode Quick Switcher */}
      <div className="flex items-center gap-1 rounded border border-edgec bg-void/70 p-0.5">
        <button
          onClick={() => onViewModeChange('fullbody')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
            viewMode === 'fullbody'
              ? 'bg-synapse text-abyss shadow-sm'
              : 'text-mute hover:text-ink hover:bg-panel'
          }`}
        >
          <Layers size={10} /> Full Body 3D
        </button>
        <button
          onClick={() => onViewModeChange('nervous')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
            viewMode === 'nervous'
              ? 'bg-synapse text-abyss shadow-sm'
              : 'text-mute hover:text-ink hover:bg-panel'
          }`}
        >
          <Activity size={10} /> Nervous System
        </button>
        <button
          onClick={() => onViewModeChange('brain')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
            viewMode === 'brain'
              ? 'bg-synapse text-abyss shadow-sm'
              : 'text-mute hover:text-ink hover:bg-panel'
          }`}
        >
          <Sparkles size={10} /> Brain Focus
        </button>
      </div>

      {/* Telemetry Status & Clock */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 md:flex">
          <span className="h-[7px] w-[7px] animate-pulsedot rounded-full bg-emerald-400" />
          <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Synaptic Simulation Active
          </span>
        </div>
        <div className="hidden flex-col items-end leading-tight lg:flex">
          <span className="font-mono text-[10px] font-semibold tabular-nums text-ink/90">{time} IST</span>
          <span className="font-mono text-[6.5px] tracking-[0.18em] text-mute">100T SYNAPSES · 120 M/S</span>
        </div>
      </div>
    </header>
  );
}
