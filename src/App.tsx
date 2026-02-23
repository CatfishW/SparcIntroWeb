import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { OverlayUI } from './components/OverlayUI';
import { BloodstreamCanvas } from './components/BloodstreamCanvas';
import { LLMChat } from './components/LLMChat';
import { InteractiveAgent } from './components/InteractiveAgent';
import { CinematicCutscene } from './components/CinematicCutscene';
import { FlowDiagram } from './components/FlowDiagram';
import { LoadingScreen } from './components/LoadingScreen';
import { Rocket, ExternalLink, Cpu } from 'lucide-react';
import type { BloodstreamAPI } from './components/BloodstreamCanvas';
import { bloodstreamCurve } from './three/curve';
import dialogueData from './data/dialogue.json';
import type { DialogueNode } from './types';

type AppPhase = 'loading' | 'start' | 'dialogue' | 'interactive' | 'cutscene' | 'flow_diagram' | 'llm_chat';

function App() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [interactiveBranch, setInteractiveBranch] = useState<'attack' | 'fever' | 'antibody'>('attack');
  const [userAnswer, setUserAnswer] = useState('');
  const clickCount = useRef(0);
  const canvasRef = useRef<BloodstreamAPI>(null);
  const cameraState = useRef({ t: 0 });

  const handleChoice = useCallback((nextId: string) => {
    clickCount.current += 1;
    if (nextId === 'end_of_intro') {
      setPhase('interactive');
      setCurrentNodeId('');
    } else {
      setCurrentNodeId(nextId);
    }
  }, []);

  const handleInteractiveResult = useCallback((branch: 'attack' | 'fever' | 'antibody') => {
    setInteractiveBranch(branch);
    setPhase('cutscene');
  }, []);

  const handleCutsceneComplete = useCallback(() => {
    setPhase('flow_diagram');
  }, []);

  const handleFlowComplete = useCallback(() => {
    setPhase('llm_chat');
  }, []);

  const currentNode = (dialogueData.nodes as DialogueNode[]).find(n => n.id === currentNodeId) || null;

  useEffect(() => {
    if (!canvasRef.current) return;
    const { camera } = canvasRef.current;

    const totalStages = 8;
    const targetT = clickCount.current * (1 / totalStages);

    gsap.killTweensOf(cameraState.current);
    gsap.to(cameraState.current, {
      t: targetT,
      duration: 5,
      ease: 'power2.inOut',
      onUpdate: () => {
        let safeT = cameraState.current.t % 1.0;
        if (safeT < 0) safeT += 1.0;
        
        let lookT = (cameraState.current.t + 0.01) % 1.0;
        if (lookT < 0) lookT += 1.0;

        camera.position.copy(bloodstreamCurve.getPointAt(safeT));
        camera.lookAt(bloodstreamCurve.getPointAt(lookT));
      }
    });

  }, [currentNodeId]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const { camera } = canvasRef.current;
    camera.position.copy(bloodstreamCurve.getPointAt(0));
    camera.lookAt(bloodstreamCurve.getPointAt(0.01));
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
      <BloodstreamCanvas ref={canvasRef} className="absolute inset-0 z-0" />

      
      {phase === 'loading' && (
        <LoadingScreen onComplete={() => setPhase('start')} />
      )}
      {phase === 'start' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-1000">
          <div className="mb-16 flex flex-col items-center gap-4">
            <div className="font-mono text-xl md:text-3xl text-cyan-500 tracking-[0.5em] animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] text-center px-4">
              INITIALIZING SPARC SYSTEM...
            </div>
            <div className="w-64 h-1 bg-cyan-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
            </div>
          </div>
          
          <button
            onClick={() => setPhase('dialogue')}
            className="group relative px-12 py-6 bg-black/50 border-2 border-cyan-500 text-cyan-400 font-bold text-2xl md:text-4xl tracking-[0.3em] uppercase transition-all duration-500 hover:bg-cyan-500/20 hover:text-cyan-100 hover:scale-105 hover:shadow-[0_0_70px_rgba(6,182,212,0.7)] hover:border-cyan-300 overflow-hidden rounded backdrop-blur-md pointer-events-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-6">
              <Cpu className="w-10 h-10 animate-pulse text-cyan-300" />
              START MISSION
            </span>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />
          </button>
        </div>
      )}

      {phase === 'dialogue' && (
        <OverlayUI currentDialogueNode={currentNode} onChoice={handleChoice} isStarted={true} />
      )}

      {phase === 'interactive' && (
        <InteractiveAgent onResult={(branch, answer) => {
          setUserAnswer(answer);
          handleInteractiveResult(branch);
        }} />
      )}

      {phase === 'cutscene' && (
        <CinematicCutscene branch={interactiveBranch} onComplete={handleCutsceneComplete} />
      )}

      {phase === 'flow_diagram' && (
        <FlowDiagram
          userAnswer={userAnswer}
          branch={interactiveBranch}
          onComplete={handleFlowComplete}
        />
      )}

      {phase === 'llm_chat' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center p-4 md:p-8 bg-black/60 backdrop-blur-md overflow-hidden">
          <div className="w-full max-w-7xl flex-1 mb-8 pointer-events-auto min-h-0 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 rounded-2xl">
            <LLMChat />
          </div>
          
          <a 
            href="https://game.agaii.org/" 
            className="group relative inline-flex items-center gap-6 px-16 py-8 font-bold text-3xl tracking-[0.2em] text-white uppercase bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 rounded-full transition-all duration-500 overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.4)] hover:shadow-[0_0_120px_rgba(239,68,68,0.8)] backdrop-blur-2xl pointer-events-auto mb-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Rocket className="w-8 h-8 text-red-500 group-hover:scale-125 transition-transform" />
            <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
              JUMP TO GAME: AGAII.ORG
            </span>
            <ExternalLink className="w-6 h-6 text-red-400 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
          </a>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}

export default App
