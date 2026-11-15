interface MeterProps {
  label: string;
  value: number; // 0–100
  color?: string;
  sub?: string;
  compact?: boolean;
}

export default function Meter({ label, value, color = '#22D3EE', sub, compact }: MeterProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={compact ? '' : 'space-y-1'}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-mute">{label}</span>
        <span className="font-mono text-[10px] tabular-nums text-ink/90">
          {sub ?? `${v.toFixed(0)}`}
        </span>
      </div>
      <div className="meter-track h-[5px] w-full">
        <div
          className="meter-fill h-full"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${color}33, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
