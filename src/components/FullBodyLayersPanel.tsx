import { Eye, EyeOff, Layers, Sliders } from 'lucide-react';

interface FullBodyLayersPanelProps {
  systemVisibilities: Record<string, boolean>;
  onToggleSystem: (id: string) => void;
  systemOpacities: Record<string, number>;
  onChangeOpacity: (id: string, val: number) => void;
}

const SYSTEMS = [
  { id: 'skeleton', name: 'Skeletal System', sub: '206 Articulated Bones', color: '#e8e2d2' },
  { id: 'muscular', name: 'Muscular System', sub: 'Over 650 Skeletal Muscles', color: '#dc2626' },
  { id: 'nervous', name: 'Nervous System', sub: 'Brain, Cord & Peripheral Nerves', color: '#14b8a6' },
  { id: 'cardiovascular', name: 'Cardiovascular', sub: 'Arterial & Venous Vasculature', color: '#ef4444' },
  { id: 'organs', name: 'Visceral Organs', sub: 'Heart, Lungs, Liver, Kidneys, GI', color: '#b45309' },
  { id: 'skin', name: 'Cutaneous Skin', sub: '2 m² External Protective Boundary', color: '#f4d0b0' },
];

export default function FullBodyLayersPanel({
  systemVisibilities,
  onToggleSystem,
  systemOpacities,
  onChangeOpacity,
}: FullBodyLayersPanelProps) {
  return (
    <aside className="slim-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto border-l border-edge/60 bg-abyss/95 p-4 text-[10px] text-oat backdrop-blur-md sm:w-[360px]">
      <div className="flex items-center justify-between border-b border-edge/60 pb-3">
        <div>
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-teal">
            6 Anatomical Layers
          </span>
          <h2 className="font-display text-[15px] font-bold text-oat">Multi-Layer Inspector</h2>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
          <Layers size={14} />
        </div>
      </div>

      <p className="mt-2 text-[8.5px] leading-relaxed text-mute">
        Toggle visibility and adjust continuous layer transparency across all six Z-Anatomy clinical systems simultaneously.
      </p>

      <div className="mt-4 space-y-2">
        {SYSTEMS.map((sys) => {
          const isVisible = systemVisibilities[sys.id] ?? true;
          const opacity = systemOpacities[sys.id] ?? 0.8;

          return (
            <div
              key={sys.id}
              className={`rounded-lg border p-3 transition-all ${
                isVisible
                  ? 'border-edge bg-void/70'
                  : 'border-edge/40 bg-void/30 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: sys.color,
                      boxShadow: isVisible ? `0 0 8px ${sys.color}` : 'none',
                    }}
                  />
                  <div>
                    <span className="block font-display text-[11px] font-bold text-oat">
                      {sys.name}
                    </span>
                    <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-mute">
                      {sys.sub}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleSystem(sys.id)}
                  className={`rounded p-1 transition-colors ${
                    isVisible
                      ? 'bg-teal/20 text-teal hover:bg-teal/30'
                      : 'bg-panel text-dim hover:text-oat'
                  }`}
                  title={isVisible ? 'Hide System Layer' : 'Show System Layer'}
                >
                  {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>

              {/* Opacity Slider */}
              <div className="mt-2.5 border-t border-edge/40 pt-2">
                <div className="flex items-center justify-between font-mono text-[6.5px] uppercase tracking-wider text-dim">
                  <span>Layer Opacity</span>
                  <span className="font-semibold text-teal">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  disabled={!isVisible}
                  onChange={(e) => onChangeOpacity(sys.id, parseFloat(e.target.value))}
                  className="mt-1 h-1 w-full cursor-pointer appearance-none rounded bg-panel accent-teal disabled:opacity-40"
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
