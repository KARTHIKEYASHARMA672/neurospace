import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RotateCcw,
  MousePointerClick,
  Move3d,
  ZoomIn,
  AlertTriangle,
  Beaker,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar, { type Mode } from './components/Sidebar';
import UnifiedExplorerPanel from './components/UnifiedExplorerPanel';
import UnifiedSignalsPanel, { type UnifiedSignalLog } from './components/UnifiedSignalsPanel';
import ScenarioPanel from './components/ScenarioPanel';
import NeuroAIPanel, { type ChatMessage } from './components/NeuroAIPanel';
import TelemetryPanel from './components/TelemetryPanel';
import EEGChart from './components/EEGChart';
import { UnifiedAnatomyScene, type HoverInfo } from './three/UnifiedAnatomyScene';
import { REGION_MAP, type RegionId } from './data/regions';
import { BODY_PARTS, BODY_PART_MAP, type BodyPartId, type ViewMode } from './data/bodySystems';
import { DEFAULT_LAYERS, type SystemLayerVisibility } from './data/anatomyLayers';
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
  'Full-Body Nervous System: >150,000 km of interconnected neural wiring',
  'Signals conduct at up to 120 metres/second (432 km/h) through myelinated A-alpha axons',
  'The Enteric Nervous System ("Second Brain") contains 500 million neurons and synthesizes ~90% of bodily serotonin',
  'Sciatic nerve caliber is ~2 cm — the largest single peripheral nerve cable in human biology',
  'The brain burns ~20% of resting oxygen while occupying only 2% of total body mass',
  'Cutaneous mechanoreceptors detect skin vibrations down to 1 nanometer amplitude at 250 Hz',
  'Cardiac vagal brake regulates Heart Rate Variability (HRV) second by second',
  'Spinal withdrawal reflex activates in 15 ms, pulling the limb back before conscious pain registers',
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState<Mode>('explore');
  const [viewMode, setViewMode] = useState<ViewMode>('fullbody');
  const [layers, setLayers] = useState<SystemLayerVisibility>(DEFAULT_LAYERS);

  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPartId | null>('spinal-cord');

  const [scenarioId, setScenarioId] = useState('baseline');
  const sim = useNeuroSim(scenarioId);
  const { scenario, state, getWave } = sim;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<UnifiedAnatomyScene | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  // Initial body part activities
  const initialBodyPartActivity: Record<BodyPartId, number> = useMemo(() => {
    return Object.fromEntries(
      BODY_PARTS.map((p) => [p.id, p.firingPropensity]),
    ) as Record<BodyPartId, number>;
  }, []);

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
      text: 'Greetings, researcher. I am NeuroAI — your on-device neuroscience & human anatomical intelligence tutor inside NEUROSPACE.\n\nAsk me anything about the human body: brain regions, the peripheral nervous system, spinal reflex arcs, autonomic organs, skin mechanoreceptors, or neurodegenerative pathologies. You can also trigger 3D neural signal propagations across the specimen.',
      ts: ts(),
      source: 'local',
    },
  ]);
  const [pending, setPending] = useState(false);
  const [hasCloudKey, setHasCloudKey] = useState(() => !!localStorage.getItem('neurospace.openai.key'));

  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;
  const simRef = useRef(sim);
  simRef.current = sim;

  /* ---------------- boot ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1800);
    return () => clearTimeout(t);
  }, []);

  /* ---------------- 3D Scene Lifecycle ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new UnifiedAnatomyScene(containerRef.current);
    sceneRef.current = scene;

    scene.onRegionClick = (id) => {
      setSelectedRegion(id);
      setSelectedBodyPart(null);
    };
    scene.onBodyPartClick = (id) => {
      setSelectedBodyPart(id);
      setSelectedRegion(null);
    };
    scene.onHover = (info) => setHoverInfo(info.id ? info : null);
    scene.setRegionActivity(simRef.current.state.activity);
    scene.setAnimationMode(scenarioRef.current.animation);
    scene.setViewMode('fullbody');
    scene.selectBodyPart('spinal-cord');

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync Scenario & Simulation to 3D Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setRegionActivity(state.activity);
    sceneRef.current.setAnimationMode(scenario.animation);
  }, [state, scenario]);

  // Sync View Mode
  const handleViewModeChange = useCallback((newView: ViewMode) => {
    setViewMode(newView);
    if (sceneRef.current) {
      sceneRef.current.setViewMode(newView);
      if (newView === 'brain') {
        setSelectedRegion('prefrontal');
        setSelectedBodyPart(null);
        sceneRef.current.selectRegion('prefrontal');
      } else {
        setSelectedRegion(null);
        setSelectedBodyPart('spinal-cord');
        sceneRef.current.selectBodyPart('spinal-cord');
      }
    }
  }, []);

  // Sync Layer Toggles
  const handleToggleLayer = useCallback((layerKey: keyof SystemLayerVisibility) => {
    setLayers((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      if (sceneRef.current) sceneRef.current.setLayerVisibility(next);
      return next;
    });
  }, []);

  // Selection handlers
  const handleSelectRegion = useCallback((id: RegionId | null) => {
    setSelectedRegion(id);
    setSelectedBodyPart(null);
    if (sceneRef.current) sceneRef.current.selectRegion(id);
  }, []);

  const handleSelectBodyPart = useCallback((id: BodyPartId | null) => {
    setSelectedBodyPart(id);
    setSelectedRegion(null);
    if (sceneRef.current) sceneRef.current.selectBodyPart(id);
  }, []);

  /* ---------------- Signal Cascade Execution ---------------- */
  const handleFireBodyCascade = useCallback(async (cascade: FullBodyNeuralCascade) => {
    if (!sceneRef.current || firing) return;
    setFiring(true);
    setCurrentStep(-1);

    for (let i = 0; i < cascade.hops.length; i++) {
      const hop = cascade.hops[i];
      setCurrentStep(i);
      const fromPart = BODY_PART_MAP[hop.fromId];
      const toPart = BODY_PART_MAP[hop.toId];

      if (fromPart && toPart) {
        logId.current += 1;
        setSignalLog((prev) => [
          {
            id: logId.current,
            time: monoTs(),
            from: fromPart.name,
            to: toPart.name,
            label: hop.label,
            velocity: hop.velocityMs,
          },
          ...prev.slice(0, 19),
        ]);

        await sceneRef.current.fireSignalPulse(
          fromPart.position3D,
          toPart.position3D,
          cascade.color,
          hop.durationMs,
        );
      }
    }

    setFiring(false);
    setCurrentStep(-1);
  }, [firing]);

  const handleFireBrainPathway = useCallback(async (pathway: NeuralPathway) => {
    if (!sceneRef.current || firing) return;
    setFiring(true);
    setCurrentStep(-1);

    for (let i = 0; i < pathway.steps.length; i++) {
      const st = pathway.steps[i];
      setCurrentStep(i);
      const fromReg = REGION_MAP[st.from];
      const toReg = REGION_MAP[st.to];

      if (fromReg && toReg) {
        logId.current += 1;
        setSignalLog((prev) => [
          {
            id: logId.current,
            time: monoTs(),
            from: fromReg.name,
            to: toReg.name,
            label: st.label,
            velocity: `${st.ms} ms`,
          },
          ...prev.slice(0, 19),
        ]);

        await sceneRef.current.fireSignalPulse(
          fromReg.position,
          toReg.position,
          pathway.color,
          st.ms,
        );
      }
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
        : `Neural analysis for "${queryText}": This biological subsystem functions within human homeostatic limits. Synaptic transmission, axonal action potentials and reflex pathways maintain coordinated sensorimotor execution across the central and peripheral axes.`;

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
      <TopBar viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      {/* Main Workspace Grid */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Module Sidebar */}
        <Sidebar mode={mode} onMode={setMode} />

        {/* 3D WebGL Canvas Viewport */}
        <div className="relative flex-1 overflow-hidden bg-[#100f0c]">
          <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

          {/* 3D Floating HUD Tooltips on Hover */}
          {hoverInfo && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded border border-synapse/40 bg-abyss/90 px-2 py-1 shadow-lg backdrop-blur-sm"
              style={{ left: hoverInfo.x, top: hoverInfo.y - 14 }}
            >
              <span className="font-mono text-[8px] font-bold text-synapse">{hoverInfo.name}</span>
              <span className="block font-mono text-[6px] uppercase tracking-[0.14em] text-mute">
                Click to inspect deep anatomy
              </span>
            </div>
          )}

          {/* Quick 3D Controls Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden items-center gap-3 font-mono text-[7px] uppercase tracking-[0.18em] text-mute md:flex">
            <span className="flex items-center gap-1">
              <Move3d size={10} className="text-synapse" /> Left Click + Drag to Orbit
            </span>
            <span className="flex items-center gap-1">
              <ZoomIn size={10} className="text-synapse" /> Scroll to Zoom
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick size={10} className="text-synapse" /> Click Node to Focus
            </span>
          </div>

          {/* Active Physiological Scenario Indicator */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded border border-edgec bg-abyss/85 px-3 py-1.5 backdrop-blur-md">
            <Activity size={12} className="text-synapse animate-pulse" />
            <div>
              <span className="block font-display text-[10px] font-bold text-ink">{scenario.name}</span>
              <span className="block font-mono text-[6.5px] uppercase tracking-[0.14em] text-mute">
                {scenario.tagline}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Context Panel (Explorer / Signals / Scenarios / NeuroAI / Telemetry) */}
        <aside className="relative z-20 flex w-full flex-col border-l hairline bg-abyss/90 backdrop-blur-md sm:w-[380px] lg:w-[420px]">
          {mode === 'explore' && (
            <UnifiedExplorerPanel
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              selectedBodyPart={selectedBodyPart}
              onSelectBodyPart={handleSelectBodyPart}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              regionActivity={state.activity}
              bodyPartActivity={initialBodyPartActivity}
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
          <span className="font-bold text-synapse">FACT:</span>
          <span className="truncate">{TICKER_FACTS[Math.floor(Date.now() / 8000) % TICKER_FACTS.length]}</span>
        </div>
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <span>86B NEURONS</span>
          <span>·</span>
          <span>150,000 KM NERVES</span>
          <span>·</span>
          <span className="text-emerald-400">NOMINAL PHYSIOLOGY</span>
        </div>
      </footer>
    </div>
  );
}
