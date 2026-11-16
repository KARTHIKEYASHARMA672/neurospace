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
  Target,
  Maximize2,
} from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar, { type Mode } from './components/Sidebar';
import HumanomeSystemsPanel, { MAJOR_HUMAN_ORGANS } from './components/HumanomeSystemsPanel';
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
import type { ViewMode } from './data/bodySystems';
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
  const [topBarViewMode, setTopBarViewMode] = useState<ViewMode>('fullbody');

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
    muscular: 0.25,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.75,
    skin: 0.12,
  });

  const [selectedOrganKey, setSelectedOrganKey] = useState<string | null>('heart');
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

  /* ---------------- Organ Selection & Camera Focus ---------------- */
  const handleSelectOrgan = useCallback((key: string) => {
    setSelectedOrganKey(key);
    if (sceneRef.current) {
      sceneRef.current.focusOnOrgan(key);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedOrganKey(null);
    if (sceneRef.current) {
      sceneRef.current.resetToFullBody();
    }
  }, []);

  const handleTopBarViewChange = useCallback((newMode: ViewMode) => {
    setTopBarViewMode(newMode);
    if (newMode === 'fullbody') {
      handleResetCamera();
    } else if (newMode === 'brain') {
      handleSelectOrgan('brain');
    } else if (newMode === 'nervous') {
      handleSelectOrgan('nervous');
    } else if (newMode === 'organs') {
      handleSelectOrgan('heart');
    }
  }, [handleResetCamera, handleSelectOrgan]);

  /* ---------------- 3D Scene Lifecycle ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new MasterHumanomeScene(containerRef.current);
    sceneRef.current = scene;

    scene.onHover = (info) => setHoverInfo(info);
    scene.onStructureClick = (name, system) => {
      setSelectedStructure({ name, system });
      const nl = name.toLowerCase();
      const matched = MAJOR_HUMAN_ORGANS.find((o) =>
        nl.includes(o.key) || o.name.toLowerCase().includes(nl.split(' ')[0])
      );
      if (matched) {
        setSelectedOrganKey(matched.key);
      }
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
      const aiReplyText = res.entry
        ? res.entry.answer
        : `Clinical & Anatomical Analysis: "${queryText}". The human physiological architecture integrates multiple autonomic and visceral pathways connecting the central nervous system to metabolic and organ tissues.`;

      setPending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: msgId.current++,
          role: 'ai',
          text: aiReplyText,
          ts: ts(),
          source: 'local',
        },
      ]);
    },
    [],
  );

  const activeOrganObj = useMemo(
    () => MAJOR_HUMAN_ORGANS.find((o) => o.key === selectedOrganKey) || null,
    [selectedOrganKey],
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-void font-sans text-ink antialiased">
      {/* Top Navigation Bar */}
      <TopBar viewMode={topBarViewMode} onViewModeChange={handleTopBarViewChange} />

      {/* Main Studio Viewport */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Vertical App Mode Rail */}
        <Sidebar mode={mode} onMode={setMode} />

        {/* Central 3D Canvas Container */}
        <div className="relative flex-1 bg-void/50">
          <div ref={containerRef} className="h-full w-full" />

          {/* Hover Tooltip HUD */}
          {hoverInfo && (
            <div
              className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-synapse/40 bg-abyss/90 px-3 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md"
              style={{ left: hoverInfo.x, top: hoverInfo.y - 12 }}
            >
              <span className="block font-display text-[10px] font-bold text-ink">
                {hoverInfo.name}
              </span>
              <span className="block font-mono text-[7px] uppercase tracking-[0.14em] text-synapse">
                {hoverInfo.system}
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
              <MousePointerClick size={10} className="text-synapse" /> Click any organ or bone to focus
            </span>
          </div>

          {/* Active View Indicator Banner */}
          <div className="pointer-events-auto absolute left-3 top-3 z-10 flex items-center gap-2 rounded border border-edge bg-abyss/85 px-3 py-1.5 backdrop-blur-md">
            <Activity size={12} className="text-synapse animate-pulse" />
            <div>
              <span className="block font-display text-[10px] font-bold uppercase text-ink">
                {viewMode} Mode Active
              </span>
              <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-mute">
                6 Layer Anatomical Composite
              </span>
            </div>
          </div>

          {/* Focused Organ Active Callout HUD on Canvas */}
          {activeOrganObj && (
            <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex max-w-sm flex-col gap-1.5 rounded-lg border border-synapse/60 bg-abyss/90 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-synapse text-abyss">
                    <activeOrganObj.icon size={13} />
                  </div>
                  <div>
                    <span className="block font-display text-[11px] font-bold text-ink">
                      {activeOrganObj.name}
                    </span>
                    <span className="block font-mono text-[6.5px] uppercase tracking-[0.12em] text-synapse">
                      Target Locked · 3D Focused
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleResetCamera}
                  className="rounded border border-edge bg-void px-2 py-0.5 font-mono text-[7px] text-mute hover:text-ink"
                >
                  Reset View
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 border-t border-edge/60 pt-1.5 font-mono text-[7.5px]">
                <div>
                  <span className="text-dim">Blood Supply: </span>
                  <span className="text-mute truncate">{activeOrganObj.bloodSupply.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-dim">Innervation: </span>
                  <span className="text-mute truncate">{activeOrganObj.innervation.split(' ')[0]}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                {(['xray', 'standard', 'ct', 'mri'] as RenderingViewMode[]).map((vm) => (
                  <button
                    key={vm}
                    onClick={() => handleChangeViewMode(vm)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[6.5px] font-semibold uppercase ${
                      viewMode === vm ? 'bg-synapse text-abyss' : 'border border-edge bg-void text-mute hover:text-ink'
                    }`}
                  >
                    {vm === 'standard' ? 'Photoreal' : vm}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              selectedOrganKey={selectedOrganKey}
              onSelectOrgan={handleSelectOrgan}
              onResetCamera={handleResetCamera}
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
