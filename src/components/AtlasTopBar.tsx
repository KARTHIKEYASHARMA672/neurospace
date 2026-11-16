import { Heart, Activity, RotateCcw, Sparkles, Layers, ShieldCheck, SunMedium } from 'lucide-react';
import type { MedicalRenderMode } from '../three/AnatomyAtlasScene';

interface AtlasTopBarProps {
  renderMode: MedicalRenderMode;
  onRenderModeChange: (mode: MedicalRenderMode) => void;
  onResetView: () => void;
}

export default function AtlasTopBar({
  renderMode,
  onRenderModeChange,
  onResetView,
}: AtlasTopBarProps) {
  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-edge/60 bg-abyss/95 px-4 backdrop-blur-md">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal/40 bg-teal/15 text-teal shadow-[0_0_15px_rgba(20,184,166,0.3)]">
          <Activity size={18} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[15px] font-bold tracking-[0.16em] text-oat">
              HUMANOME <span className="text-teal">3D</span>
            </h1>
            <span className="rounded border border-teal/30 bg-teal/10 px-1.5 py-[1px] font-mono text-[7.5px] font-semibold tracking-[0.18em] text-teal">
              CLINICAL ANATOMY ATLAS
            </span>
          </div>
          <p className="hidden font-mono text-[7.5px] uppercase tracking-[0.22em] text-mute sm:block">
            Full-Fidelity 3D Human Body, Visceral Organs & Physiological Systems
          </p>
        </div>
      </div>

      {/* Center Medical Render Passes */}
      <div className="flex items-center gap-1 rounded-lg border border-edge/80 bg-void/80 p-1">
        <span className="hidden px-2 font-mono text-[7px] uppercase tracking-[0.18em] text-dim md:inline-block">
          Render:
        </span>
        {[
          { id: 'photoreal', label: 'Photoreal', sub: 'Tissue' },
          { id: 'xray', label: 'X-Ray', sub: 'Hologram' },
          { id: 'ct', label: 'CT Scan', sub: 'Bone Density' },
          { id: 'mri', label: 'MRI', sub: 'Tissue Contrast' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => onRenderModeChange(m.id as MedicalRenderMode)}
            className={`rounded-md px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
              renderMode === m.id
                ? 'bg-teal text-abyss shadow-[0_0_12px_rgba(20,184,166,0.4)]'
                : 'text-mute hover:bg-panel hover:text-oat'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetView}
          className="flex items-center gap-1.5 rounded-lg border border-edge bg-panel px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-oat transition-colors hover:border-teal/50 hover:text-teal"
          title="Reset Camera & Center View"
        >
          <RotateCcw size={11} />
          <span>Center View</span>
        </button>

        <div className="hidden items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 lg:flex">
          <span className="h-2 w-2 animate-pulsedot rounded-full bg-emerald-400" />
          <span className="font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            WebGL2 60 FPS
          </span>
        </div>
      </div>
    </header>
  );
}
