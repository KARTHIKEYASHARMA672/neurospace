import { useCallback, useEffect, useRef, useState } from 'react';
import AtlasTopBar from './components/AtlasTopBar';
import OrganSelectorBar from './components/OrganSelectorBar';
import OrganInspectorSheet from './components/OrganInspectorSheet';
import FullBodyLayersPanel from './components/FullBodyLayersPanel';
import {
  AnatomyAtlasScene,
  type OrganViewKey,
  type MedicalRenderMode,
  type AnatomicalPin,
} from './three/AnatomyAtlasScene';
import {
  Move3d,
  ZoomIn,
  MousePointerClick,
  Sparkles,
  Heart,
  Scissors,
  Activity,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<OrganViewKey>('heart');
  const [renderMode, setRenderMode] = useState<MedicalRenderMode>('photoreal');

  // Organ animation toggles
  const [isBeating, setIsBeating] = useState(true);
  const [isBreathing, setIsBreathing] = useState(true);
  const [isCutaway, setIsCutaway] = useState(false);
  const [selectedPin, setSelectedPin] = useState<AnatomicalPin | null>(null);

  // Full body multi-system controls
  const [systemVisibilities, setSystemVisibilities] = useState<Record<string, boolean>>({
    skeleton: true,
    muscular: true,
    nervous: true,
    cardiovascular: true,
    organs: true,
    skin: true,
  });
  const [systemOpacities, setSystemOpacities] = useState<Record<string, number>>({
    skeleton: 0.9,
    muscular: 0.2,
    nervous: 1.0,
    cardiovascular: 0.85,
    organs: 0.85,
    skin: 0.12,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AnatomyAtlasScene | null>(null);

  // Initialize 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new AnatomyAtlasScene(containerRef.current);
    sceneRef.current = scene;

    scene.onPinClick = (pin) => {
      setSelectedPin(pin);
    };

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Organ View Changes
  const handleSelectView = useCallback((view: OrganViewKey) => {
    setCurrentView(view);
    setSelectedPin(null);
    if (sceneRef.current) {
      sceneRef.current.switchToView(view);
    }
  }, []);

  // Medical Render Mode Changes (Photoreal, X-Ray, CT, MRI)
  const handleRenderModeChange = useCallback((mode: MedicalRenderMode) => {
    setRenderMode(mode);
    if (sceneRef.current) {
      sceneRef.current.setRenderMode(mode);
    }
  }, []);

  // Heart & Lungs Animation Toggles
  const handleToggleBeating = useCallback(() => {
    setIsBeating((prev) => {
      const next = !prev;
      if (sceneRef.current) sceneRef.current.setBeating(next);
      return next;
    });
  }, []);

  const handleToggleBreathing = useCallback(() => {
    setIsBreathing((prev) => {
      const next = !prev;
      if (sceneRef.current) sceneRef.current.setBreathing(next);
      return next;
    });
  }, []);

  const handleToggleCutaway = useCallback(() => {
    setIsCutaway((prev) => {
      const next = !prev;
      if (sceneRef.current) sceneRef.current.setCutaway(next);
      return next;
    });
  }, []);

  // Full Body Layer Toggles
  const handleToggleSystem = useCallback((sysId: string) => {
    setSystemVisibilities((prev) => {
      const next = !prev[sysId];
      if (sceneRef.current) sceneRef.current.setSystemVisibility(sysId, next);
      return { ...prev, [sysId]: next };
    });
  }, []);

  const handleChangeOpacity = useCallback((sysId: string, val: number) => {
    setSystemOpacities((prev) => {
      if (sceneRef.current) sceneRef.current.setSystemOpacity(sysId, val);
      return { ...prev, [sysId]: val };
    });
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedPin(null);
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-void font-sans text-oat antialiased">
      {/* 1. Master Clinical Top Bar */}
      <AtlasTopBar
        renderMode={renderMode}
        onRenderModeChange={handleRenderModeChange}
        onResetView={handleResetView}
      />

      {/* 2. Primary Organ & System Selector Dock */}
      <OrganSelectorBar currentView={currentView} onSelectView={handleSelectView} />

      {/* 3. Main Viewport & Dual Inspector */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Central 3D Canvas Area */}
        <div className="relative flex-1 bg-void/60">
          <div ref={containerRef} className="h-full w-full" />

          {/* Canvas Floating HUD Overlay (Top-Left Status) */}
          <div className="pointer-events-auto absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-edge/80 bg-abyss/85 px-3 py-1.5 shadow-lg backdrop-blur-md">
            <span className="h-2 w-2 animate-pulsedot rounded-full bg-teal" />
            <div>
              <span className="block font-display text-[11px] font-bold uppercase tracking-wider text-oat">
                {currentView === 'fullbody'
                  ? 'Full Body 6-Layer Composite'
                  : `${currentView.toUpperCase()} 3D TARGET LOCKED`}
              </span>
              <span className="block font-mono text-[7px] uppercase tracking-[0.16em] text-teal">
                Mode: {renderMode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Quick 3D Interaction Hints */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden items-center gap-3 font-mono text-[7.5px] uppercase tracking-[0.16em] text-mute lg:flex">
            <span className="flex items-center gap-1">
              <Move3d size={11} className="text-teal" /> Drag to Orbit 360°
            </span>
            <span className="flex items-center gap-1">
              <ZoomIn size={11} className="text-teal" /> Scroll to Zoom
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick size={11} className="text-teal" /> Click Glowing Pins for Clinical Insights
            </span>
          </div>

          {/* Quick Floating Cardiac Action Buttons on Canvas */}
          {currentView === 'heart' && (
            <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-edge/80 bg-abyss/90 p-1.5 shadow-xl backdrop-blur-md">
              <button
                onClick={handleToggleBeating}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-wider transition-all ${
                  isBeating
                    ? 'bg-crimson/20 text-rose-300 border border-crimson/40'
                    : 'bg-panel text-mute hover:text-oat'
                }`}
              >
                <Heart size={10} className={isBeating ? 'animate-heartbeat text-crimson' : ''} />
                <span>{isBeating ? 'Pulse (72 bpm)' : 'Pulse Off'}</span>
              </button>

              <button
                onClick={handleToggleCutaway}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[7.5px] font-semibold uppercase tracking-wider transition-all ${
                  isCutaway
                    ? 'bg-amber/20 text-amber border border-amber/40'
                    : 'bg-panel text-mute hover:text-oat'
                }`}
              >
                <Scissors size={10} />
                <span>{isCutaway ? 'Cutaway On' : 'Slice Interior'}</span>
              </button>

              <button
                onClick={handleResetView}
                className="flex items-center gap-1 rounded-md bg-panel px-2 py-1 font-mono text-[7.5px] text-mute hover:text-oat"
              >
                <RotateCcw size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Right Inspector Sheet: Organ Details OR Full-Body Layers */}
        {currentView === 'fullbody' ? (
          <FullBodyLayersPanel
            systemVisibilities={systemVisibilities}
            onToggleSystem={handleToggleSystem}
            systemOpacities={systemOpacities}
            onChangeOpacity={handleChangeOpacity}
          />
        ) : (
          <OrganInspectorSheet
            currentView={currentView}
            isBeating={isBeating}
            onToggleBeating={handleToggleBeating}
            isBreathing={isBreathing}
            onToggleBreathing={handleToggleBreathing}
            isCutaway={isCutaway}
            onToggleCutaway={handleToggleCutaway}
            selectedPin={selectedPin}
            onClearPin={() => setSelectedPin(null)}
          />
        )}
      </div>

      {/* 4. Ticker Footer */}
      <footer className="relative z-30 flex h-7 shrink-0 items-center justify-between border-t border-edge/60 bg-abyss px-4 font-mono text-[7.5px] text-mute">
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal">MEDICAL STANDARD:</span>
          <span>Z-ANATOMY & BODYPARTS3D CLINICAL ANATOMICAL STANDARD (CC BY-SA 4.0)</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span>206 ARTICULATED BONES</span>
          <span>·</span>
          <span>4 CHAMBERS</span>
          <span>·</span>
          <span>8 COUINAUD SEGMENTS</span>
          <span>·</span>
          <span className="text-emerald-400">100% METRIC ACCURACY</span>
        </div>
      </footer>
    </div>
  );
}
