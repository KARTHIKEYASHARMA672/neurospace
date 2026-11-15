import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { REGIONS, type RegionId } from '../data/regions';
import { SCENARIOS, type NeuroScenario } from '../data/scenarios';

export interface NeuroState {
  bands: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
  neuro: {
    dopamine: number;
    serotonin: number;
    cortisol: number;
    gaba: number;
    acetylcholine: number;
    norepinephrine: number;
  };
  metrics: { signalEfficiency: number; focusIndex: number; neuralSync: number; plasticity: number };
  activity: Record<RegionId, number>;
  synapseCount: number;
  signalVelocity: number;
  tick: number;
}

const WAVE_BUFFER = 260;

function baseActivityMap(): Record<RegionId, number> {
  const m = {} as Record<RegionId, number>;
  for (const r of REGIONS) m[r.id] = r.baseActivity;
  return m;
}

export function useNeuroSim(scenarioId: string) {
  const scenario: NeuroScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const [state, setState] = useState<NeuroState>(() => {
    const activity = baseActivityMap();
    Object.assign(activity, scenario.regionActivity);
    return {
      bands: { ...scenario.eeg },
      neuro: { ...scenario.neurotransmitters },
      metrics: { ...scenario.metrics },
      activity,
      synapseCount: 4_218_640_315,
      signalVelocity: 94,
      tick: 0,
    };
  });

  const bandsRef = useRef(state.bands);
  const modeRef = useRef(scenario.animation);
  const phaseRef = useRef({ d: Math.random() * 100, t: Math.random() * 100, a: Math.random() * 100, b: Math.random() * 100, g: Math.random() * 100 });
  const timeRef = useRef(Math.random() * 1000);
  const waveRef = useRef<number[]>(new Array(WAVE_BUFFER).fill(0));
  const targetRef = useRef({ scenario });
  targetRef.current = { scenario };
  modeRef.current = scenario.animation;

  useEffect(() => {
    const interval = setInterval(() => {
      const target = targetRef.current.scenario;
      const ease = 0.09;
      const jitter = (amp: number) => (Math.random() - 0.5) * amp;

      setState((prev) => {
        const bands = {
          delta: prev.bands.delta + (target.eeg.delta - prev.bands.delta) * ease + jitter(1.6),
          theta: prev.bands.theta + (target.eeg.theta - prev.bands.theta) * ease + jitter(1.6),
          alpha: prev.bands.alpha + (target.eeg.alpha - prev.bands.alpha) * ease + jitter(1.6),
          beta: prev.bands.beta + (target.eeg.beta - prev.bands.beta) * ease + jitter(1.6),
          gamma: prev.bands.gamma + (target.eeg.gamma - prev.bands.gamma) * ease + jitter(1.6),
        };
        bandsRef.current = bands;

        const neuro = {
          dopamine: clamp(prev.neuro.dopamine + (target.neurotransmitters.dopamine - prev.neuro.dopamine) * ease + jitter(0.8)),
          serotonin: clamp(prev.neuro.serotonin + (target.neurotransmitters.serotonin - prev.neuro.serotonin) * ease + jitter(0.8)),
          cortisol: clamp(prev.neuro.cortisol + (target.neurotransmitters.cortisol - prev.neuro.cortisol) * ease + jitter(0.8)),
          gaba: clamp(prev.neuro.gaba + (target.neurotransmitters.gaba - prev.neuro.gaba) * ease + jitter(0.8)),
          acetylcholine: clamp(prev.neuro.acetylcholine + (target.neurotransmitters.acetylcholine - prev.neuro.acetylcholine) * ease + jitter(0.8)),
          norepinephrine: clamp(prev.neuro.norepinephrine + (target.neurotransmitters.norepinephrine - prev.neuro.norepinephrine) * ease + jitter(0.8)),
        };
        const metrics = {
          signalEfficiency: clamp(prev.metrics.signalEfficiency + (target.metrics.signalEfficiency - prev.metrics.signalEfficiency) * ease + jitter(1.2)),
          focusIndex: clamp(prev.metrics.focusIndex + (target.metrics.focusIndex - prev.metrics.focusIndex) * ease + jitter(1.2)),
          neuralSync: clamp(prev.metrics.neuralSync + (target.metrics.neuralSync - prev.metrics.neuralSync) * ease + jitter(1.2)),
          plasticity: clamp(prev.metrics.plasticity + (target.metrics.plasticity - prev.metrics.plasticity) * ease + jitter(1.2)),
        };
        const mergedTarget = baseActivityMap();
        Object.assign(mergedTarget, target.regionActivity);
        const activity = { ...prev.activity };
        for (const r of REGIONS) {
          activity[r.id] = clamp(activity[r.id] + (mergedTarget[r.id] - activity[r.id]) * ease + jitter(1.5));
        }

        return {
          bands,
          neuro,
          metrics,
          activity,
          synapseCount: prev.synapseCount + Math.floor(180_000 + Math.random() * 420_000 + bands.gamma * 4_000),
          signalVelocity: clamp(prev.signalVelocity + jitter(3.5), 72, 128),
          tick: prev.tick + 1,
        };
      });

      // advance the waveform sampler
      timeRef.current += 0.055;
      const t = timeRef.current;
      const p = phaseRef.current;
      const b = bandsRef.current;
      const mode = modeRef.current;
      let envelope = 1;
      if (mode === 'seizure') envelope = 1 + Math.pow(Math.max(0, Math.sin(t * 1.35)), 10) * 3.4;
      if (mode === 'slowwave') envelope = 1 + Math.sin(t * 0.7) * 0.35;
      if (mode === 'tremor') envelope = 1 + Math.sin(t * Math.PI * 2 * 5.1) * 0.3;
      if (mode === 'hijack') envelope = 1 + Math.sin(t * 5.6) * 0.22;
      if (mode === 'calm') envelope = 0.82 + Math.sin(t * 0.55) * 0.08;

      const y =
        (Math.sin(t * Math.PI * 2 * 1.55 + p.d) * (b.delta / 100) * 1.65 +
          Math.sin(t * Math.PI * 2 * 6.1 + p.t) * (b.theta / 100) * 0.85 +
          Math.sin(t * Math.PI * 2 * 10.3 + p.a) * (b.alpha / 100) * 0.62 +
          Math.sin(t * Math.PI * 2 * 19.4 + p.b) * (b.beta / 100) * 0.34 +
          Math.sin(t * Math.PI * 2 * 43 + p.g) * (b.gamma / 100) * 0.18) *
          envelope +
        (Math.random() - 0.5) * 0.22;

      const buf = waveRef.current;
      buf.push(y);
      if (buf.length > WAVE_BUFFER) buf.shift();
    }, 42);
    return () => clearInterval(interval);
  }, []);

  const getWave = useCallback(() => waveRef.current, []);
  const getBands = useCallback(() => bandsRef.current, []);

  return { scenario, state, getWave, getBands };
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}
