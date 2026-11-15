import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  SendHorizonal,
  BrainCircuit,
  User,
  Settings2,
  KeyRound,
  Check,
  X,
  Loader2,
  Cpu,
  Cloud,
} from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../data/knowledge';

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  confidence?: number;
  source?: 'local' | 'openai';
  ts: string;
}

interface NeuroAIPanelProps {
  messages: ChatMessage[];
  pending: boolean;
  onSubmit: (text: string) => void;
  hasCloudKey: boolean;
}

export default function NeuroAIPanel({ messages, pending, onSubmit, hasCloudKey }: NeuroAIPanelProps) {
  const [draft, setDraft] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  useEffect(() => {
    setKeyDraft(localStorage.getItem('neurospace.openai.key') ?? '');
  }, [settingsOpen]);

  const saveKey = () => {
    const trimmed = keyDraft.trim();
    if (trimmed) localStorage.setItem('neurospace.openai.key', trimmed);
    else localStorage.removeItem('neurospace.openai.key');
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 1400);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || pending) return;
    onSubmit(text);
    setDraft('');
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="relative flex h-full flex-col">
      {/* header */}
      <div className="border-b hairline px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="h-tick flex items-center gap-1.5">
            <Sparkles size={9} className="text-goldspark" /> NeuroAI · On-Device Tutor
          </div>
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            title="Cloud API settings"
            className="rounded border hairline p-1 text-mute transition-all hover:border-synapse/40 hover:text-synapse"
          >
            <Settings2 size={11} />
          </button>
        </div>
        <h2 className="mt-1.5 font-display text-[16px] font-semibold leading-tight text-ink">
          Interrogate the <span className="serif-accent text-goldspark">living brain</span>
        </h2>
        <div className="mt-1.5 flex items-center gap-1.5">
          {hasCloudKey ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-neural/30 bg-neural/10 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.2em] text-neural">
              <Cloud size={8} /> GPT-4o-mini linked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-sm border border-synapse/30 bg-synapse/10 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.2em] text-synapse">
              <Cpu size={8} /> Local knowledge engine
            </span>
          )}
          <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-emerald-400" />
          <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-emerald-300/80">Engine online</span>
        </div>
      </div>

      {/* settings popover */}
      {settingsOpen && (
        <div className="absolute left-3 right-3 top-[74px] z-20 rounded-md border border-synapse/25 bg-[#0B1330]/95 p-3 shadow-panel backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-synapse">
              <KeyRound size={10} /> Optional cloud brain
            </span>
            <button onClick={() => setSettingsOpen(false)} className="text-mute hover:text-ink">
              <X size={12} />
            </button>
          </div>
          <p className="mt-1.5 text-[9px] leading-snug text-ink/70">
            Paste an OpenAI API key to route questions through <span className="text-neural">gpt-4o-mini</span>. Without a key,
            the on-device neuroscience engine answers instantly — nothing leaves this machine.
          </p>
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="sk-…"
            spellCheck={false}
            className="mt-2 w-full rounded-sm border hairline bg-black/40 px-2 py-1.5 font-mono text-[9px] text-ink placeholder:text-dim focus:border-synapse/40"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[6px] uppercase tracking-[0.16em] text-dim">Stored in localStorage only</span>
            <button
              onClick={saveKey}
              className="btn-synapse flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em]"
            >
              {keySaved ? <Check size={9} /> : <KeyRound size={9} />} {keySaved ? 'Saved' : 'Save key'}
            </button>
          </div>
        </div>
      )}

      {/* messages */}
      <div ref={scrollRef} className="slim-scroll flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex items-start justify-end gap-2">
              <div className="chat-bubble-user max-w-[82%] rounded-md rounded-tr-sm px-2.5 py-1.5">
                <p className="text-[9.5px] leading-snug text-fuchsia-100/90">{m.text}</p>
                <span className="mt-1 block text-right font-mono text-[5.5px] tabular-nums text-fuchsia-300/50">{m.ts}</span>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neural/30 bg-neural/10">
                <User size={11} className="text-neural" />
              </span>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-synapse/30 bg-synapse/10 shadow-glowcyan">
                <BrainCircuit size={11} className="text-synapse" />
              </span>
              <div className="chat-bubble-ai min-w-0 max-w-[85%] rounded-md rounded-tl-sm px-2.5 py-1.5">
                <p className="whitespace-pre-wrap text-[9.5px] leading-relaxed text-cyan-50/90">{m.text}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[5.5px] uppercase tracking-[0.18em] text-dim">
                    {m.source === 'openai' ? 'gpt-4o-mini' : 'local engine'} · {m.ts}
                  </span>
                  {typeof m.confidence === 'number' && (
                    <span className="flex items-center gap-1 font-mono text-[5.5px] tabular-nums text-synapse/80">
                      <span className="inline-block h-1 w-8 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full bg-synapse/80" style={{ width: `${m.confidence}%` }} />
                      </span>
                      {m.confidence}% match
                    </span>
                  )}
                </div>
              </div>
            </div>
          ),
        )}
        {pending && (
          <div className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-synapse/30 bg-synapse/10">
              <Loader2 size={11} className="animate-spin text-synapse" />
            </span>
            <div className="chat-bubble-ai rounded-md rounded-tl-sm px-3 py-2">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <i key={i} className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-synapse/80" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="pt-1">
            <div className="h-tick mb-1.5 text-[6px] text-dim">Suggested inquiries</div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => onSubmit(q)} className="chip rounded-sm px-2 py-1 text-left font-sans text-[8px] leading-snug text-ink/75">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t hairline px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-md border hairline bg-black/40 px-2.5 py-1.5 transition-all focus-within:border-synapse/40 focus-within:shadow-glowcyan">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Ask about any region, disorder, molecule…"
            className="w-full bg-transparent text-[10px] text-ink placeholder:text-dim"
            aria-label="Ask NeuroAI a question"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || pending}
            className="shrink-0 rounded-sm border border-synapse/40 bg-synapse/15 p-1.5 text-synapse transition-all hover:bg-synapse/25 disabled:opacity-30"
            aria-label="Send question"
          >
            <SendHorizonal size={13} />
          </button>
        </div>
        <p className="mt-1.5 text-center font-mono text-[5.5px] uppercase leading-relaxed tracking-[0.18em] text-dim">
          Educational simulation · not medical advice · verify clinically
        </p>
      </div>
    </div>
  );
}
