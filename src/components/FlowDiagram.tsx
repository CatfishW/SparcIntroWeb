import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Typewriter } from './Typewriter';

interface FlowDiagramProps {
  userAnswer: string;
  branch: 'attack' | 'fever' | 'antibody';
  onComplete: () => void;
}

const BRANCH_LABELS: Record<string, string> = {
  attack: 'Immune Attack',
  fever: 'Fever Response',
  antibody: 'Antibody Production',
};

const BRANCH_COLORS: Record<string, { main: string; glow: string }> = {
  attack: { main: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  fever: { main: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  antibody: { main: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
};

const EXPLANATION_TEXT = "This is exactly how SPARC works! In the game, your AI Peer Agent listens to your ideas, analyzes your reasoning, and creates personalized learning paths. Every student gets a unique journey based on their own thinking — that's the power of Systematic Problem Solving and Algorithmic Reasoning.";

export function FlowDiagram({ userAnswer, branch, onComplete }: FlowDiagramProps) {
  const [step, setStep] = useState(0);
  const [explanationDone, setExplanationDone] = useState(false);

  useEffect(() => {
    if (step >= 7) return;
    const delays = [400, 600, 500, 400, 500, 500, 400];
    const timer = setTimeout(() => setStep(s => s + 1), delays[step] || 500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const nodeClass = (threshold: number) =>
    `transition-all duration-700 ${step >= threshold ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`;

  const lineClass = (threshold: number) =>
    `transition-all duration-500 ${step >= threshold ? 'opacity-100' : 'opacity-0'}`;

  const activeBranch = BRANCH_COLORS[branch];
  const allBranches = ['attack', 'fever', 'antibody'] as const;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="mb-6 font-mono text-[10px] tracking-[0.4em] text-cyan-400/60 uppercase text-center">
          How SPARC Agent-Guided Learning Works
        </div>

        <div className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/15 rounded-2xl p-6 md:p-10 mb-8">
          <svg viewBox="0 0 800 420" className="w-full" xmlns="http://www.w3.org/2000/svg">
            {/* User Input Node */}
            <g className={nodeClass(0)}>
              <rect x="300" y="10" width="200" height="56" rx="12" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.5)" strokeWidth="1.5" />
              <text x="400" y="32" textAnchor="middle" fill="rgb(165,243,252)" fontSize="10" fontFamily="monospace" letterSpacing="2">YOUR INPUT</text>
              <text x="400" y="50" textAnchor="middle" fill="rgb(203,213,225)" fontSize="9" fontFamily="sans-serif">
                {userAnswer.length > 35 ? userAnswer.substring(0, 35) + '…' : userAnswer}
              </text>
            </g>

            {/* Line: Input → Agent */}
            <g className={lineClass(1)}>
              <line x1="400" y1="66" x2="400" y2="120" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" values="7;0" dur="0.8s" repeatCount="indefinite" />
              </line>
              <polygon points="394,118 400,128 406,118" fill="rgba(6,182,212,0.6)" />
            </g>

            {/* Agent Node */}
            <g className={nodeClass(2)}>
              <rect x="300" y="130" width="200" height="56" rx="12" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />
              <circle cx="340" cy="158" r="10" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
              <text x="340" y="162" textAnchor="middle" fill="rgb(34,211,238)" fontSize="10">🤖</text>
              <text x="420" y="153" textAnchor="middle" fill="rgb(165,243,252)" fontSize="10" fontFamily="monospace" letterSpacing="2">AI PEER AGENT</text>
              <text x="420" y="170" textAnchor="middle" fill="rgb(148,163,184)" fontSize="8" fontFamily="sans-serif">Analyzes reasoning</text>
            </g>

            {/* Lines: Agent → 3 Branches */}
            {allBranches.map((b, i) => {
              const targetX = 130 + i * 270;
              const isActive = b === branch;
              const color = BRANCH_COLORS[b];
              return (
                <g key={b} className={lineClass(3)}>
                  <path
                    d={`M 400 186 Q 400 220 ${targetX} 250`}
                    fill="none"
                    stroke={isActive ? color.main : 'rgba(100,116,139,0.3)'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? 'none' : '4 3'}
                  >
                    {isActive && (
                      <animate attributeName="stroke-dashoffset" values="20;0" dur="1s" repeatCount="1" fill="freeze" />
                    )}
                  </path>
                  <polygon
                    points={`${targetX - 5},248 ${targetX},258 ${targetX + 5},248`}
                    fill={isActive ? color.main : 'rgba(100,116,139,0.3)'}
                  />
                </g>
              );
            })}

            {/* 3 Consequence Nodes */}
            {allBranches.map((b, i) => {
              const x = 130 + i * 270;
              const isActive = b === branch;
              const color = BRANCH_COLORS[b];
              return (
                <g key={`node-${b}`} className={nodeClass(4 + i)}>
                  <rect
                    x={x - 95}
                    y="260"
                    width="190"
                    height="56"
                    rx="12"
                    fill={isActive ? `${color.main}20` : 'rgba(30,41,59,0.4)'}
                    stroke={isActive ? color.main : 'rgba(100,116,139,0.3)'}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  {isActive && (
                    <rect
                      x={x - 95}
                      y="260"
                      width="190"
                      height="56"
                      rx="12"
                      fill="none"
                      stroke={color.main}
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <text
                    x={x}
                    y="285"
                    textAnchor="middle"
                    fill={isActive ? 'white' : 'rgb(148,163,184)'}
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="1"
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {BRANCH_LABELS[b].toUpperCase()}
                  </text>
                  <text
                    x={x}
                    y="302"
                    textAnchor="middle"
                    fill={isActive ? 'rgb(203,213,225)' : 'rgb(100,116,139)'}
                    fontSize="8"
                    fontFamily="sans-serif"
                  >
                    {isActive ? '✓ Your path' : 'Alternative path'}
                  </text>
                </g>
              );
            })}

            {/* Result Arrow from active branch */}
            <g className={lineClass(6)}>
              <line
                x1={130 + allBranches.indexOf(branch) * 270}
                y1="316"
                x2={130 + allBranches.indexOf(branch) * 270}
                y2="360"
                stroke={activeBranch.main}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              >
                <animate attributeName="stroke-dashoffset" values="7;0" dur="0.8s" repeatCount="indefinite" />
              </line>
              <rect
                x={130 + allBranches.indexOf(branch) * 270 - 85}
                y="362"
                width="170"
                height="48"
                rx="10"
                fill={`${activeBranch.main}15`}
                stroke={activeBranch.main}
                strokeWidth="1.5"
              />
              <text
                x={130 + allBranches.indexOf(branch) * 270}
                y="383"
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontFamily="monospace"
                letterSpacing="2"
              >
                PERSONALIZED
              </text>
              <text
                x={130 + allBranches.indexOf(branch) * 270}
                y="399"
                textAnchor="middle"
                fill="rgb(203,213,225)"
                fontSize="9"
                fontFamily="monospace"
                letterSpacing="2"
              >
                LEARNING PATH
              </text>
            </g>
          </svg>
        </div>

        {step >= 7 && (
          <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/15 rounded-xl p-5 md:p-6 mb-6 animate-[fadeSlideUp_0.6s_ease-out]">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-slate-100 text-sm md:text-base leading-relaxed font-light">
                <Typewriter
                  text={EXPLANATION_TEXT}
                  speed={18}
                  duration={16}
                  onComplete={() => setExplanationDone(true)}
                />
              </div>
              <audio autoPlay src={`${import.meta.env.BASE_URL}assets/audio/flow_explanation.wav`} />
            </div>

            {explanationDone && (
              <button
                onClick={handleContinue}
                className="mt-2 group flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400/60 rounded-lg transition-all duration-300 animate-[fadeSlideUp_0.4s_ease-out]"
              >
                <span className="font-mono text-xs text-cyan-200 group-hover:text-white tracking-wider uppercase">
                  Continue to Chat
                </span>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
