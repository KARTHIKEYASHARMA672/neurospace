import { useEffect, useRef } from 'react';

interface EEGChartProps {
  getWave: () => number[];
  accent?: string;
  variant?: 'mini' | 'full';
}

export default function EEGChart({ getWave, accent = '#22D3EE', variant = 'full' }: EEGChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const height = variant === 'mini' ? 54 : 128;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = cssW;
      const H = cssH;
      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = 'rgba(148, 197, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (H / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // center dashed line
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(148, 197, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const data = getWave();
      if (data.length < 8) return;
      const n = data.length;
      const xStep = W / (n - 1);
      const mid = H / 2;
      const amp = H * 0.36;

      // filled area
      ctx.beginPath();
      ctx.moveTo(0, mid);
      for (let i = 0; i < n; i++) {
        ctx.lineTo(i * xStep, mid - data[i] * amp);
      }
      ctx.lineTo(W, mid);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, H);
      fill.addColorStop(0, accent + '44');
      fill.addColorStop(0.5, accent + '0e');
      fill.addColorStop(1, accent + '00');
      ctx.fillStyle = fill;
      ctx.fill();

      // glow stroke
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = i * xStep;
        const y = mid - data[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.shadowColor = accent;
      ctx.shadowBlur = 9;
      ctx.strokeStyle = accent;
      ctx.lineWidth = variant === 'mini' ? 1.6 : 2.1;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // leading edge dot
      const lastX = (n - 1) * xStep;
      const lastY = mid - data[n - 1] * amp;
      ctx.beginPath();
      ctx.arc(lastX - 1, lastY, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [getWave, accent, variant]);

  return (
    <canvas
      ref={canvasRef}
      className="eeg"
      style={{ height: `${height}px`, width: '100%' }}
      aria-label="Live simulated EEG waveform"
    />
  );
}
