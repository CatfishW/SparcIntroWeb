import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Typewriter } from './Typewriter';

interface CinematicCutsceneProps {
  branch: 'attack' | 'fever' | 'antibody';
  onComplete: () => void;
}

interface CutsceneData {
  title: string;
  phases: { text: string; visual: 'attack' | 'fever' | 'antibody'; color: string }[];
}

const CUTSCENES: Record<string, CutsceneData> = {
  attack: {
    title: 'IMMUNE RESPONSE: DIRECT ATTACK',
    phases: [
      {
        text: "White blood cells detect the invader! Neutrophils are the first responders — they rush through the bloodstream toward the germ at incredible speed.",
        visual: 'attack',
        color: 'rgb(239, 68, 68)',
      },
      {
        text: "The phagocytes surround the germ and engulf it completely — a process called phagocytosis. The germ is trapped inside and broken down by powerful enzymes.",
        visual: 'attack',
        color: 'rgb(249, 115, 22)',
      },
      {
        text: "Victory! The invader is neutralized. But the battle leaves debris — that's why you sometimes feel sore or see swelling. Your body's cleanup crew is hard at work.",
        visual: 'attack',
        color: 'rgb(34, 197, 94)',
      },
    ],
  },
  fever: {
    title: 'THERMAL DEFENSE: FEVER PROTOCOL',
    phases: [
      {
        text: "The hypothalamus receives chemical signals from immune cells — pyrogens — and raises the body's thermostat. Temperature begins climbing above 37°C.",
        visual: 'fever',
        color: 'rgb(251, 191, 36)',
      },
      {
        text: "At higher temperatures, many germs can't reproduce as effectively. Meanwhile, your immune cells actually work faster in the heat — it's like a turbo boost for your defenses!",
        visual: 'fever',
        color: 'rgb(239, 68, 68)',
      },
      {
        text: "As the infection is controlled, the thermostat resets. You start sweating to cool down. The fever was your body's brilliant algorithmic response — raising the cost of survival for the invader.",
        visual: 'fever',
        color: 'rgb(34, 197, 94)',
      },
    ],
  },
  antibody: {
    title: 'ADAPTIVE IMMUNITY: ANTIBODY PRODUCTION',
    phases: [
      {
        text: "B-cells identify the germ's unique surface markers — called antigens. It's like reading a barcode. Each germ has a different one, and your body learns to recognize it.",
        visual: 'antibody',
        color: 'rgb(99, 102, 241)',
      },
      {
        text: "The B-cells begin mass-producing Y-shaped proteins — antibodies — that perfectly match the germ's antigens. These antibodies latch on and flag the germ for destruction.",
        visual: 'antibody',
        color: 'rgb(168, 85, 247)',
      },
      {
        text: "Even after the germ is defeated, memory B-cells remain. If the same germ returns months or years later, your body can produce antibodies almost instantly. This is how vaccines work!",
        visual: 'antibody',
        color: 'rgb(34, 197, 94)',
      },
    ],
  },
};

function CutsceneVisual({ type, phase, color }: { type: string; phase: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    let t = 0;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; life: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: Math.random() * 4 + 1,
        life: Math.random(),
      });
    }

    const draw = () => {
      t += 0.016;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      if (type === 'attack') {
        const germR = 30 - phase * 8;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const noise = Math.sin(a * 5 + t * 3) * 5;
          const r = germR + noise;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(100, 200, 100, ${0.6 - phase * 0.15})`;
        ctx.fill();

        for (let i = 0; i < 5; i++) {
          const angle = (t * 0.5 + i * Math.PI * 2 / 5) % (Math.PI * 2);
          const dist = 60 + Math.sin(t * 2 + i) * 15;
          const wx = cx + Math.cos(angle) * dist;
          const wy = cy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(wx, wy, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(wx, wy, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
          ctx.fill();
        }
      } else if (type === 'fever') {
        const intensity = 0.3 + phase * 0.2;
        for (let i = 0; i < 8; i++) {
          const r = 20 + i * 15 + Math.sin(t * 2 + i) * 5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, ${150 - i * 15}, 50, ${intensity - i * 0.03})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        for (const p of particles) {
          p.x += p.vx + Math.sin(t + p.life * 10) * 0.5;
          p.y += p.vy - 0.5;
          if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
          if (p.x < 0 || p.x > w) p.x = Math.random() * w;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${180 + Math.random() * 75}, 50, ${0.3 + p.life * 0.4})`;
          ctx.fill();
        }
      } else {
        for (let i = 0; i < 6 + phase * 3; i++) {
          const angle = t * 0.3 + i * 1.2;
          const dist = 40 + i * 12 + Math.sin(t + i) * 10;
          const ax = cx + Math.cos(angle) * dist;
          const ay = cy + Math.sin(angle) * dist;

          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(-6, 4);
          ctx.lineTo(-2, 4);
          ctx.lineTo(-2, 8);
          ctx.lineTo(2, 8);
          ctx.lineTo(2, 4);
          ctx.lineTo(6, 4);
          ctx.closePath();
          ctx.fillStyle = `rgba(167, 139, 250, ${0.6 + Math.sin(t * 2 + i) * 0.2})`;
          ctx.fill();
          ctx.restore();
        }

        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.15) {
          const noise = Math.sin(a * 4 + t * 2) * 4;
          const r = 20 + noise;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [type, phase]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: `radial-gradient(ellipse at center, ${color}15, transparent 70%), #0a0a0a` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
}

export function CinematicCutscene({ branch, onComplete }: CinematicCutsceneProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const data = CUTSCENES[branch];
  const currentPhase = data.phases[phaseIndex];
  const isLastPhase = phaseIndex >= data.phases.length - 1;

  useEffect(() => {
    mountedRef.current = true;
    setAudioDuration(undefined);
    setTypingDone(false);

    const audio = new Audio(`${import.meta.env.BASE_URL}assets/audio/cutscene_${branch}_${phaseIndex}.wav`);
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
  }, [branch, phaseIndex]);

  const handleNext = () => {
    if (!typingDone) return;
    if (isLastPhase) {
      onComplete();
    } else {
      setPhaseIndex(prev => prev + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl max-h-full flex flex-col animate-[fadeSlideUp_0.6s_ease-out]">
        <div className="flex-shrink-0 mb-2 md:mb-4 flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.4em] text-cyan-400/60 uppercase">
            {data.title}
          </div>
          <div className="font-mono text-[10px] tracking-wider text-slate-500">
            {phaseIndex + 1} / {data.phases.length}
          </div>
        </div>

        <div className="flex-shrink min-h-0 aspect-[16/9] max-h-[45vh]">
          <CutsceneVisual type={branch} phase={phaseIndex} color={currentPhase.color} />
        </div>

        <div className="flex-shrink-0 mt-4 md:mt-6 bg-black/40 backdrop-blur-xl border border-cyan-500/15 rounded-xl p-4 md:p-5 overflow-y-auto max-h-[30vh]">
          <div className="text-slate-100 text-sm md:text-base leading-relaxed font-light">
            <Typewriter
              key={`${branch}-${phaseIndex}`}
              text={currentPhase.text}
              speed={18}
              duration={audioDuration}
              onComplete={() => setTypingDone(true)}
            />
          </div>

          {typingDone && (
            <button
              onClick={handleNext}
              className="mt-4 group flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400/60 rounded-lg transition-all duration-300 animate-[fadeSlideUp_0.4s_ease-out]"
            >
              <span className="font-mono text-xs text-cyan-200 group-hover:text-white tracking-wider uppercase">
                {isLastPhase ? 'See How It Works' : 'Continue'}
              </span>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
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
