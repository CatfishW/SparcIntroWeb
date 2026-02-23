import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Cpu, Sparkles } from 'lucide-react';
import { Typewriter, type TypewriterHandle } from './Typewriter';

interface InteractiveAgentProps {
  onResult: (branch: 'attack' | 'fever' | 'antibody', answer: string) => void;
}

const AGENT_QUESTION = "A dangerous germ just entered the bloodstream! As the body's defense commander, what strategy would you use to protect the patient?";

const BRANCH_KEYWORDS: Record<'attack' | 'fever' | 'antibody', string[]> = {
  attack: ['attack', 'fight', 'destroy', 'kill', 'eat', 'engulf', 'white blood', 'immune', 'defend', 'chase', 'hunt', 'eliminate', 'combat', 'battle', 'soldier', 'army', 'war', 'phagocyte', 'neutrophil'],
  fever: ['fever', 'heat', 'hot', 'temperature', 'warm', 'burn', 'sweat', 'inflam', 'fire', 'thermal', 'overheat'],
  antibody: ['antibod', 'remember', 'memory', 'tag', 'mark', 'label', 'vaccine', 'recogni', 'learn', 'adapt', 'flag', 'identify', 'protein', 'lock', 'key'],
};

function classifyInput(input: string): 'attack' | 'fever' | 'antibody' {
  const lower = input.toLowerCase();
  const scores: Record<string, number> = { attack: 0, fever: 0, antibody: 0 };

  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[branch] += 1;
    }
  }

  const max = Math.max(scores.attack, scores.fever, scores.antibody);
  if (max === 0) return 'attack';
  if (scores.antibody === max) return 'antibody';
  if (scores.fever === max) return 'fever';
  return 'attack';
}

export function InteractiveAgent({ onResult }: InteractiveAgentProps) {
  const [phase, setPhase] = useState<'question' | 'input' | 'analyzing'>('question');
  const [userInput, setUserInput] = useState('');
  const [dots, setDots] = useState('');
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<TypewriterHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const audio = new Audio(`${import.meta.env.BASE_URL}assets/audio/interactive_question.wav`);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (mountedRef.current) {
        setAudioDuration(audio.duration);
      }
    });

    audio.play().catch(() => {});

    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleQuestionComplete = useCallback(() => {
    setPhase('input');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;
    setPhase('analyzing');
    const branch = classifyInput(userInput);
    setTimeout(() => onResult(branch, userInput), 2500);
  }, [userInput, onResult]);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const id = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <div className="bg-black/50 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          <div className="px-6 py-3 border-b border-cyan-500/10 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-400/70 uppercase">AI Peer Agent — Interactive Challenge</span>
            </div>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-2 rounded-full bg-cyan-500/30 animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-cyan-500/20">
                <img src={`${import.meta.env.BASE_URL}assets/cap_portrait.png`} alt="Agent" className="w-full h-full object-cover mix-blend-screen opacity-80" />
              </div>
              <div className="flex-1">
                <div className="text-slate-100 text-base md:text-lg leading-relaxed font-light">
                  <Typewriter
                    ref={typewriterRef}
                    text={AGENT_QUESTION}
                    speed={25}
                    duration={audioDuration}
                    onComplete={handleQuestionComplete}
                  />
                </div>
              </div>
            </div>

            {phase === 'input' && (
              <div className="animate-[fadeSlideUp_0.5s_ease-out]">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Type your strategy..."
                      className="w-full px-4 py-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 font-light text-sm focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                    className="px-5 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    <Send className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Send white blood cells to attack!', 'Raise body temperature', 'Create antibodies to remember it'].map((hint, i) => (
                    <button
                      key={i}
                      onClick={() => setUserInput(hint)}
                      className="text-[10px] font-mono text-cyan-400/50 hover:text-cyan-300 border border-cyan-500/10 hover:border-cyan-500/30 px-3 py-1 rounded-full transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'analyzing' && (
              <div className="flex flex-col items-center gap-4 py-6 animate-[fadeSlideUp_0.5s_ease-out]">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse" />
                </div>
                <div className="font-mono text-sm text-cyan-300 tracking-wider">
                  ANALYZING STRATEGY{dots}
                </div>
                <div className="text-xs text-slate-400 font-light max-w-md text-center">
                  Your AI Peer Agent is evaluating your approach and preparing a simulation of the consequences.
                </div>
                <div className="mt-2 px-4 py-2 bg-cyan-950/20 border border-cyan-500/10 rounded-lg">
                  <span className="text-xs text-slate-300 italic">"{userInput}"</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
