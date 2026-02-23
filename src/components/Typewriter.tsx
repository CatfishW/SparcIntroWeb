import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export interface TypewriterHandle {
  skip: () => void;
  isDone: boolean;
}

export const Typewriter = forwardRef<TypewriterHandle, TypewriterProps>(
  ({ text, speed = 30, duration, onComplete, className }, ref) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isDone, setIsDone] = useState(false);

    const onCompleteRef = useRef(onComplete);
    const durationRef = useRef(duration);
    const speedRef = useRef(speed);
    const cancelledRef = useRef(false);
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    onCompleteRef.current = onComplete;
    durationRef.current = duration;
    speedRef.current = speed;

    const skip = () => {
      if (isDone || !text) return;
      cancelledRef.current = true;
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      setDisplayedText(text);
      setIsDone(true);
      onCompleteRef.current?.();
    };

    useImperativeHandle(ref, () => ({ skip, isDone }), [isDone, text]);

    useEffect(() => {
      setDisplayedText('');
      setIsDone(false);
      cancelledRef.current = false;

      if (!text) {
        setIsDone(true);
        onCompleteRef.current?.();
        return;
      }

      let i = 0;

      const tick = () => {
        if (cancelledRef.current) return;

        i++;
        setDisplayedText(text.substring(0, i));

        if (i >= text.length) {
          setIsDone(true);
          onCompleteRef.current?.();
          return;
        }

        const dur = durationRef.current;
        const nextDelay = dur && text.length > 0
          ? (dur * 1000) / text.length
          : speedRef.current;

        timerIdRef.current = setTimeout(tick, nextDelay);
      };

      const initialDelay = durationRef.current && text.length > 0
        ? (durationRef.current * 1000) / text.length
        : speedRef.current;

      timerIdRef.current = setTimeout(tick, initialDelay);

      return () => {
        cancelledRef.current = true;
        if (timerIdRef.current) clearTimeout(timerIdRef.current);
      };
    }, [text]);

    return (
      <div className={className}>
        {displayedText}
        {!isDone && <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-cyan-400 align-middle shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
      </div>
    );
  }
);
