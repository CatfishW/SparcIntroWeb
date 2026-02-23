import { useState, useEffect } from 'react';
import { Cpu, Volume2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const ASSETS = {
  images: [
    'cap_portrait.png',
    'gura_portrait.png',
  ],
  audio: [
    'start.wav',
    'acronym_explanation.wav',
    'what_is_sparc.wav',
    'ai_agents.wav',
    'how_agents_help.wav',
    'human_body.wav',
    'why_body.wav',
    'body_algorithms.wav',
    'algorithmic_reasoning.wav',
    'examples_reasoning.wav',
    'ai_reasoning.wav',
    'deep_dive.wav',
    'future.wav',
    'get_started.wav',
    'interactive_question.wav',
    'cutscene_attack_0.wav',
    'cutscene_attack_1.wav',
    'cutscene_attack_2.wav',
    'cutscene_fever_0.wav',
    'cutscene_fever_1.wav',
    'cutscene_fever_2.wav',
    'cutscene_antibody_0.wav',
    'cutscene_antibody_1.wav',
    'cutscene_antibody_2.wav',
    'flow_explanation.wav',
  ],
};

const BASE_URL = import.meta.env.BASE_URL;

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const totalAssets = ASSETS.images.length + ASSETS.audio.length;

  useEffect(() => {
    let mounted = true;

    const preloadFile = async (src: string): Promise<void> => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Failed to load');
        await response.arrayBuffer();
      } catch {
        // Silently continue on error
      }
    };

    const preloadAll = async () => {
      let count = 0;

      for (const img of ASSETS.images) {
        if (!mounted) return;
        const src = `${BASE_URL}assets/${img}`;
        setCurrentFile(img);
        await preloadFile(src);
        count++;
        if (mounted) setLoadedCount(count);
      }

      for (const audio of ASSETS.audio) {
        if (!mounted) return;
        const src = `${BASE_URL}assets/audio/${audio}`;
        setCurrentFile(audio);
        await preloadFile(src);
        count++;
        if (mounted) setLoadedCount(count);
      }

      if (mounted) {
        setIsComplete(true);
        setCurrentFile('');
      }
    };

    preloadAll();

    return () => { mounted = false; };
  }, []);

  const progress = Math.round((loadedCount / totalAssets) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-black to-black" />
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-500/5"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.1) 2px, rgba(0, 212, 255, 0.1) 4px)',
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Cpu className="w-10 h-10 text-cyan-400" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/50 animate-pulse" />
            </div>
            <span className="text-3xl font-bold tracking-[0.2em] text-white">SPARC</span>
          </div>
          <div className="text-cyan-400/60 font-mono text-xs tracking-[0.3em] uppercase">
            Systematic Problem Solving & Algorithmic Reasoning
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {!isComplete ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-cyan-400/70 tracking-wider uppercase">
                    Loading Assets
                  </span>
                  <span className="font-mono text-xs text-cyan-300">
                    {loadedCount} / {totalAssets}
                  </span>
                </div>
                <div className="h-2 bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-500/20">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="font-mono truncate">{currentFile || 'Initializing...'}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-cyan-500/10 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/50">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3" />
                    <span>VOICE: PREPARING</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-cyan-400">
                  {progress}%
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-sm text-green-400 tracking-wider uppercase">
                  All Assets Loaded
                </span>
              </div>

              <button
                onClick={onComplete}
                className="group relative px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-400 rounded-lg transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative font-mono text-sm text-cyan-100 group-hover:text-white tracking-[0.2em] uppercase font-medium">
                  Enter Experience
                </span>
              </button>

              <div className="mt-4 text-[10px] text-slate-500 font-mono">
                Click to begin your journey through the bloodstream
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="text-[10px] font-mono text-cyan-400/30 tracking-wider">
            SPARCINTRO v1.0 — Powered by AI Peer Agent
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
