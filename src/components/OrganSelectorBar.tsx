import {
  Heart,
  Brain,
  Wind,
  FlaskConical,
  Filter,
  Utensils,
  Bone,
  Flame,
  User,
  Activity,
} from 'lucide-react';
import type { OrganViewKey } from '../three/AnatomyAtlasScene';

export interface OrganNavOption {
  key: OrganViewKey;
  label: string;
  sub: string;
  icon: typeof Activity;
  badge?: string;
}

export const ORGAN_OPTIONS: OrganNavOption[] = [
  {
    key: 'heart',
    label: 'Heart & Cardia',
    sub: '4 Chambers & Vessels',
    icon: Heart,
    badge: 'Dual Beat',
  },
  {
    key: 'brain',
    label: 'Brain & Cortex',
    sub: 'Cerebrum & Lobes',
    icon: Brain,
    badge: '100T Synapses',
  },
  {
    key: 'lungs',
    label: 'Lungs & Airway',
    sub: '5 Lobes & Bronchi',
    icon: Wind,
    badge: 'Respiration',
  },
  {
    key: 'liver',
    label: 'Liver & Biliary',
    sub: '8 Couinaud Segments',
    icon: FlaskConical,
  },
  {
    key: 'kidneys',
    label: 'Kidneys & Urinary',
    sub: 'Nephrons & Ureters',
    icon: Filter,
  },
  {
    key: 'stomach',
    label: 'Stomach & GI',
    sub: 'Gastric & Duodenum',
    icon: Utensils,
  },
  {
    key: 'skeleton',
    label: 'Skeleton',
    sub: '206 Articulated Bones',
    icon: Bone,
  },
  {
    key: 'muscular',
    label: 'Muscular System',
    sub: '650+ Striated Muscles',
    icon: Activity,
  },
  {
    key: 'vascular',
    label: 'Vascular Network',
    sub: 'Arteries & Veins',
    icon: Flame,
  },
  {
    key: 'fullbody',
    label: 'Full Human Body',
    sub: '6 Layer Multi-System',
    icon: User,
    badge: 'Composite',
  },
];

interface OrganSelectorBarProps {
  currentView: OrganViewKey;
  onSelectView: (view: OrganViewKey) => void;
}

export default function OrganSelectorBar({
  currentView,
  onSelectView,
}: OrganSelectorBarProps) {
  return (
    <nav className="relative z-20 flex w-full shrink-0 items-center justify-between border-b border-edge/60 bg-abyss/90 px-3 py-2 backdrop-blur-md">
      <div className="slim-scroll flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <span className="mr-2 hidden shrink-0 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-teal lg:inline-block">
          ANATOMY SELECTOR:
        </span>

        {ORGAN_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentView === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => onSelectView(opt.key)}
              className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                isActive
                  ? 'border-teal bg-teal/20 text-oat shadow-[0_0_15px_rgba(20,184,166,0.3)] ring-1 ring-teal/50'
                  : 'border-edge bg-void/60 text-mute hover:border-teal/40 hover:bg-void hover:text-oat'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                  isActive
                    ? 'bg-teal text-abyss'
                    : 'bg-teal/10 text-teal group-hover:bg-teal/20'
                }`}
              >
                <Icon size={13} />
              </div>

              <div className="text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-[11px] font-bold tracking-wide">
                    {opt.label}
                  </span>
                  {opt.badge && (
                    <span
                      className={`rounded px-1 py-0.2 font-mono text-[6px] font-semibold uppercase tracking-wider ${
                        isActive
                          ? 'bg-teal text-abyss'
                          : 'border border-teal/30 bg-teal/10 text-teal'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-mute group-hover:text-oat/80">
                  {opt.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
