import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, ChevronRight, Volume2, SkipForward } from 'lucide-react';
import type { DialogueNode } from '../types';
import { Typewriter, type TypewriterHandle } from './Typewriter';

interface OverlayUIProps {
  currentDialogueNode: DialogueNode | null;
  onChoice: (nextId: string) => void;
  isStarted: boolean;
}

export function OverlayUI({ currentDialogueNode, onChoice, isStarted }: OverlayUIProps) {
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const prevNodeId = useRef<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const typewriterRef = useRef<TypewriterHandle>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleTypingComplete = useCallback(() => {
    setIsTypingDone(true);
  }, []);

  const handleSkip = useCallback(() => {
    if (typewriterRef.current && !typewriterRef.current.isDone) {
      typewriterRef.current.skip();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, []);

  useEffect(() => {
    if (!isStarted || !currentDialogueNode) return;
    if (currentDialogueNode.id === prevNodeId.current) return;

    prevNodeId.current = currentDialogueNode.id;
    setIsTypingDone(false);
    setAudioDuration(undefined);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }

    if (!currentDialogueNode.voiceFile) return;

    const audioPath = `${import.meta.env.BASE_URL}assets/${currentDialogueNode.voiceFile}`;
    const audio = new Audio(audioPath);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (mountedRef.current) {
        setAudioDuration(audio.duration);
      }
    });

    audio.play().catch(e => {
      console.warn('Audio playback failed:', e, 'Path:', audioPath);
    });

    return () => {
      prevNodeId.current = undefined;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [currentDialogueNode?.id, isStarted]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden text-slate-50 font-sans">
      
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center font-mono text-[9px] tracking-[0.3em] text-cyan-400/40 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
          <span>SPARC_CORE_V2.5</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Volume2 className="w-2.5 h-2.5" />
            <span>VOICE: ON</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="w-2 h-2" />
            <span>{currentDialogueNode?.id.toUpperCase() || 'IDLE'}</span>
          </div>
        </div>
      </div>

      {currentDialogueNode && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none px-4 pb-4">
          <div className="w-full max-w-5xl bg-black/40 backdrop-blur-2xl border border-cyan-500/15 rounded-xl pointer-events-auto flex flex-col md:flex-row transition-all duration-500 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div
              className="hidden md:block w-28 bg-cyan-950/10 border-r border-cyan-500/10 flex-shrink-0 relative overflow-hidden group cursor-pointer"
              onClick={handleSkip}
            >
              <img 
                src={`${import.meta.env.BASE_URL}assets/cap_portrait.png`}
                alt="AI" 
                className="w-full h-full object-cover opacity-80 mix-blend-screen scale-125 transition-transform duration-1000 group-hover:scale-150"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/60 to-transparent" />
            </div>

            <div className="flex-1 flex flex-col px-5 py-4 min-w-0 gap-3 cursor-pointer" onClick={handleSkip}>
              <div className="font-sans text-sm md:text-base lg:text-lg text-slate-100 leading-relaxed font-light tracking-tight">
                <Typewriter 
                  ref={typewriterRef}
                  key={currentDialogueNode.id}
                  text={currentDialogueNode.text} 
                  speed={20}
                  duration={audioDuration}
                  onComplete={handleTypingComplete} 
                />
              </div>

              {!isTypingDone && (
                <div className="flex items-center gap-1 text-cyan-400/50 font-mono text-[10px] tracking-wider">
                  <SkipForward className="w-3 h-3" />
                  <span>CLICK TO SKIP</span>
                </div>
              )}

              <div className={`flex flex-wrap items-center gap-2 transition-all duration-700 ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0'}`}>
                {currentDialogueNode.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); onChoice(option.nextId); }}
                    className="group relative flex items-center gap-2 px-4 py-2 bg-cyan-500/5 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/60 rounded-lg transition-all duration-300 text-left"
                  >
                    <span className="font-mono text-[10px] md:text-xs text-cyan-100 group-hover:text-white uppercase tracking-wider">
                      {option.label}
                    </span>
                    <ChevronRight className="w-3 h-3 text-cyan-500 group-hover:text-cyan-300 transition-all" />
                  </button>
                ))}
                {currentDialogueNode.options.length === 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onChoice('end_of_intro'); }}
                    className="group flex items-center gap-4 px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 hover:border-cyan-300 rounded-lg transition-all duration-500 animate-pulse"
                  >
                    <span className="font-mono text-xs text-white font-bold tracking-[0.2em] uppercase">
                      CONTINUE
                    </span>
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
