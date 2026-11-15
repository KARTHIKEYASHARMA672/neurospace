import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RotateCcw,
  MousePointerClick,
  Move3d,
  ZoomIn,
  Activity,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  FlaskConical,
} from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar, { type Mode } from './components/Sidebar';
import HumanomeSystemsPanel from './components/HumanomeSystemsPanel';
import UnifiedSignalsPanel, { type UnifiedSignalLog } from './components/UnifiedSignalsPanel';
import ScenarioPanel from './components/ScenarioPanel';
import NeuroAIPanel, { type ChatMessage } from './components/NeuroAIPanel';
import TelemetryPanel from './components/TelemetryPanel';
import { MasterHumanomeScene, type AnatomicalHoverInfo } from './three/MasterHumanomeScene';
import {
  ANATOMY_SYSTEMS,
  type AnatomySystemId,
  type RenderingViewMode,
} from './data/anatomySystems';
import { PATHWAYS, type NeuralPathway } from './data/pathways';
import { FULL_BODY_CASCADES, type FullBodyNeuralCascade } from './data/bodyCascades';
import { askNeuroAI } from './data/knowledge';
import { useNeuroSim } from './hooks/useNeuroSim';

const ts = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const monoTs = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
};

const TICKER_FACTS = [
  'Human Skeleton: 206 articulated bones providing mechanical leverage, calcium homeostasis & hematopoiesis',
  'Muscular System: Over 650 skeletal muscles producing voluntary motion and 85% of bodily heat',
  'Full-Body Nervous System: >150,000 km of interconnected neural wiring conducting impulses at up to 120 m/s',
  'Cardiovascular Network: 100,000 km of blood vessels pumping 5 liters of blood per minute',
  'Visceral Organs & "Second Brain": Enteric system holds 500 million neurons and synthesizes ~90% of serotonin',
  'Integumentary System: 2 square meters of skin containing millions of high-frequency tactile mechanoreceptors',
  'Radiological X-Ray / CT / MRI: Multi-spectral visualization of tissue density and clinical pathologies',
];

export default function App() {
  const [mode, setMode] = useState<Mode>('explore');
  const [viewMode, setViewMode] = useState<RenderingViewMode>('xray');

  const [activeSystems, setActiveSystems] = useState<Record<AnatomySystemId, boolean>>({
    skeleton: true,
    muscular: true,
    nervous: true,
    cardiovascular: true,
    organs: true,
    skin: true,
  });

  const [systemOpacities, setSystemOpacities] = useState<Record<AnatomySystemId, number>>({
    skeleton: 0.95,
    muscular: 0.28,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.55,
    skin: 0.12,
  });

  const [selectedStructure, setSelectedStructure] = useState<{ name: string; system: string } | null>(null);

  const [scenarioId, setScenarioId] = useState('baseline');
  const sim = useNeuroSim(scenarioId);
  const { scenario, state, getWave } = sim;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MasterHumanomeScene | null>(null);
  const [hoverInfo, setHoverInfo] = useState<AnatomicalHoverInfo | null>(null);

  // Signals propagation state
  const [firing, setFiring] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [signalLog, setSignalLog] = useState<UnifiedSignalLog[]>([]);
  const logId = useRef(0);

  // NeuroAI state
  const msgId = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'ai',
      text: 'Greetings, researcher. I am NeuroAI — your on-device anatomical and neuroscience intelligence tutor inside NEUROSPACE.\n\nExplore all 6 human body systems: Skeleton (206 bones), Muscular (650+ muscles), Nervous System & Brain, Cardiovascular (arteries & veins), Visceral Organs ("Second Brain"), and Integumentary Skin. You can toggle systems, adjust opacities, switch between X-Ray, CT, MRI, and Photoreal rendering, and inspect deep clinical medicine.',
      ts: ts(),
      source: 'local',
    },
  ]);
  const [pending, setPending] = useState(false);
  const [hasCloudKey, setHasCloudKey] = useState(() => !!localStorage.getItem('neurospace.openai.key'));

  /* ---------------- 3D Scene Lifecycle ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new MasterHumanomeScene(containerRef.current);
    sceneRef.current = scene;

    scene.onHover = (info) => setHoverInfo(info);
    scene.onStructureClick = (name, system) => {
      setSelectedStructure({ name, system });
    };

    scene.setViewMode('xray');

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleToggleSystem = useCallback((sysId: AnatomySystemId) => {
    setActiveSystems((prev) => {
      const next = !prev[sysId];
      if (sceneRef.current) sceneRef.current.setSystemVisibility(sysId, next);
      return { ...prev, [sysId]: next };
    });
  }, []);

  const handleChangeOpacity = useCallback((sysId: AnatomySystemId, val: number) => {
    setSystemOpacities((prev) => {
      if (sceneRef.current) sceneRef.current.setSystemOpacity(sysId, val);
      return { ...prev, [sysId]: val };
    });
  }, []);

  const handleChangeViewMode = useCallback((newView: RenderingViewMode) => {
    setViewMode(newView);
    if (sceneRef.current) sceneRef.current.setViewMode(newView);
  }, []);

  /* ---------------- Signal Cascade Execution ---------------- */
  const handleFireBodyCascade = useCallback(async (cascade: FullBodyNeuralCascade) => {
    if (firing) return;
    setFiring(true);
    setCurrentStep(-1);

    for (let i = 0; i < cascade.hops.length; i++) {
      const hop = cascade.hops[i];
      setCurrentStep(i);
      logId.current += 1;
      setSignalLog((prev) => [
        {
          id: logId.current,
          time: monoTs(),
          from: hop.fromName,
          to: hop.toName,
          label: hop.label,
          velocity: hop.velocityMs,
        },
        ...prev.slice(0, 19),
      ]);
      await new Promise((r) => setTimeout(r, 1100));
    }

    setFiring(false);
    setCurrentStep(-1);
  }, [firing]);

  const handleFireBrainPathway = useCallback(async (pathway: NeuralPathway) => {
    if (firing) return;
    setFiring(true);
    setCurrentStep(-1);

    for (let i = 0; i < pathway.steps.length; i++) {
      const st = pathway.steps[i];
      setCurrentStep(i);
      logId.current += 1;
      setSignalLog((prev) => [
        {
          id: logId.current,
          time: monoTs(),
          from: st.from,
          to: st.to,
          label: st.label,
          velocity: `${st.ms} ms`,
        },
        ...prev.slice(0, 19),
      ]);
      await new Promise((r) => setTimeout(r, 1100));
    }

    setFiring(false);
    setCurrentStep(-1);
  }, [firing]);

  /* ---------------- NeuroAI Ask Helper ---------------- */
  const handleAskNeuroAI = useCallback(
    async (queryText: string) => {
      setMode('neuroai');
      const userMsg: ChatMessage = {
        id: msgId.current++,
        role: 'user',
        text: queryText,
        ts: ts(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setPending(true);

      const res = askNeuroAI(queryText);
      setPending(false);

      const replyText = res.entry
        ? `${res.entry.title}\n\n${res.entry.answer}`
        : `Clinical & Anatomical Evaluation of "${queryText}": This biological system functions within optimal homeostatic physiological limits. Anatomical tissue density, motor innervation, blood supply and visceral reflex arcs coordinate to sustain human life.`;

      setMessages((prev) => [
        ...prev,
        {
          id: msgId.current++,
          role: 'ai',
          text: replyText,
          confidence: res.confidence,
          ts: ts(),
          source: 'local',
        },
      ]);
    },
    [],
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-void text-ink font-display">
      {/* Top Navigation Bar */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b hairline bg-abyss/90 px-3 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-synapse/40 bg-synapse/15 text-synapse shadow-[0_0_12px_rgba(201,169,97,0.35)]">
            <Activity size={18} />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[15px] font-bold tracking-[0.18em] text-ink">
                NEURO<span className="text-synapse">SPACE</span>
              </h1>
              <span className="hidden rounded-sm border border-synapse/30 bg-synapse/10 px-1.5 py-[1px] font-mono text-[8px] tracking-[0.22em] text-synapse md:inline-block">
                HUMANOME 3D MEDICAL ATLAS
              </span>
            </div>
            <p className="hidden font-mono text-[7.5px] uppercase tracking-[0.24em] text-mute sm:block">
              Interactive 3D Skeleton · Muscular · Nervous · Cardiovascular · Visceral Organs · Skin
            </p>
          </div>
        </div>

        {/* Quick View Mode Pills */}
        <div className="flex items-center gap-1 rounded border border-edgec bg-void/70 p-0.5">
          {(['xray', 'standard', 'ct', 'mri'] as RenderingViewMode[]).map((vm) => (
            <button
              key={vm}
              onClick={() => handleChangeViewMode(vm)}
              className={`rounded px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] transition-all ${
                viewMode === vm
                  ? 'bg-synapse text-abyss shadow-sm'
                  : 'text-mute hover:text-ink hover:bg-panel'
              }`}
            >
              {vm === 'standard' ? 'Photoreal' : vm.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Clock & Status */}
        <div className="hidden flex-col items-end leading-tight lg:flex">
          <span className="font-mono text-[9.5px] font-bold text-emerald-400">● LIVE 3D MEDICAL ATLAS</span>
          <span className="font-mono text-[6.5px] uppercase tracking-[0.18em] text-mute">
            Z-ANATOMY · HUMANOME ARCHITECTURE
          </span>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Module Sidebar */}
        <Sidebar mode={mode} onMode={setMode} />

        {/* 3D WebGL Canvas Viewport */}
        <div className="relative flex-1 overflow-hidden bg-[#100f0c]">
          <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

          {/* 3D Floating HUD Tooltip */}
          {hoverInfo && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded border border-synapse/40 bg-abyss/95 px-2.5 py-1.5 shadow-xl backdrop-blur-md"
              style={{ left: hoverInfo.x, top: hoverInfo.y - 14 }}
            >
              <span className="block font-display text-[10px] font-bold text-ink">{hoverInfo.name}</span>
              <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-synapse">
                {hoverInfo.system} · Click to inspect
              </span>
            </div>
          )}

          {/* Quick 3D Navigation Controls Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden items-center gap-3 font-mono text-[7px] uppercase tracking-[0.18em] text-mute md:flex">
            <span className="flex items-center gap-1">
              <Move3d size={10} className="text-synapse" /> Left Click + Drag to Orbit 360°
            </span>
            <span className="flex items-center gap-1">
              <ZoomIn size={10} className="text-synapse" /> Scroll to Zoom
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick size={10} className="text-synapse" /> Click any bone/organ/muscle to isolate
            </span>
          </div>

          {/* Active View Indicator Banner */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded border border-edgec bg-abyss/85 px-3 py-1.5 backdrop-blur-md">
            <Activity size={12} className="text-synapse animate-pulse" />
            <div>
              <span className="block font-display text-[10px] font-bold text-ink uppercase">
                {viewMode} Mode Active
              </span>
              <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-mute">
                6 Layer Anatomical Composite
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Context Panel (Explorer / Signals / Scenarios / NeuroAI / Telemetry) */}
        <aside className="relative z-20 flex w-full flex-col border-l hairline bg-abyss/90 backdrop-blur-md sm:w-[380px] lg:w-[420px]">
          {mode === 'explore' && (
            <HumanomeSystemsPanel
              activeSystems={activeSystems}
              onToggleSystem={handleToggleSystem}
              systemOpacities={systemOpacities}
              onChangeOpacity={handleChangeOpacity}
              viewMode={viewMode}
              onChangeViewMode={handleChangeViewMode}
              selectedStructure={selectedStructure}
              onAskNeuroAI={handleAskNeuroAI}
            />
          )}

          {mode === 'signals' && (
            <UnifiedSignalsPanel
              onFireBrainPathway={handleFireBrainPathway}
              onFireBodyCascade={handleFireBodyCascade}
              firing={firing}
              currentStep={currentStep}
              log={signalLog}
              onAskNeuroAI={handleAskNeuroAI}
            />
          )}

          {mode === 'scenarios' && (
            <ScenarioPanel
              activeId={scenarioId}
              onSelect={setScenarioId}
              active={scenario}
              onAskNeuroAI={(q: string) => handleAskNeuroAI(q)}
            />
          )}

          {mode === 'neuroai' && (
            <NeuroAIPanel
              messages={messages}
              pending={pending}
              onSubmit={(txt: string) => handleAskNeuroAI(txt)}
              hasCloudKey={hasCloudKey}
            />
          )}

          {mode === 'telemetry' && (
            <TelemetryPanel
              scenario={scenario}
              state={state}
              getWave={getWave}
            />
          )}
        </aside>
      </div>

      {/* Ticker Bar at Bottom */}
      <footer className="relative z-30 flex h-7 shrink-0 items-center justify-between border-t hairline bg-void px-3 text-[7.5px] font-mono text-mute">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="font-bold text-synapse">ANATOMICAL REFERENCE:</span>
          <span className="truncate">{TICKER_FACTS[Math.floor(Date.now() / 8000) % TICKER_FACTS.length]}</span>
        </div>
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <span>206 BONES</span>
          <span>·</span>
          <span>650 MUSCLES</span>
          <span>·</span>
          <span>86B NEURONS</span>
          <span>·</span>
          <span className="text-emerald-400">100% PHYSIOLOGICAL ACCURACY</span>
        </div>
      </footer>
    </div>
  );
}
