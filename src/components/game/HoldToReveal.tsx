import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HoldToRevealProps {
  onRevealed: () => void;
  children: React.ReactNode;
  duration?: number;
}

export function HoldToReveal({ onRevealed, children, duration = 600 }: HoldToRevealProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>();

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const p = Math.min(elapsed / duration, 1);
    setProgress(p);
    if (p < 1) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [duration]);

  const startPress = useCallback(() => {
    if (isRevealed) return;
    setIsPressing(true);
    startTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(updateProgress);
    timerRef.current = setTimeout(() => {
      setIsRevealed(true);
      setIsPressing(false);
      setProgress(1);
    }, duration);
  }, [duration, isRevealed, updateProgress]);

  const endPress = useCallback(() => {
    if (isRevealed) return;
    setIsPressing(false);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [isRevealed]);

  const handleDismiss = useCallback(() => {
    setIsRevealed(false);
    setProgress(0);
    onRevealed();
  }, [onRevealed]);

  const circumference = 2 * Math.PI * 126;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="hold"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative flex items-center justify-center"
          >
            <button
              onPointerDown={startPress}
              onPointerUp={endPress}
              onPointerLeave={endPress}
              onContextMenu={(e) => e.preventDefault()}
              className="w-64 h-64 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center relative active:scale-[0.98] transition-transform touch-none"
            >
              <span className="text-label">HOLD TO REVEAL</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128" cy="128" r="126"
                  fill="none"
                  stroke="hsl(var(--loyal))"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: isPressing ? "none" : "stroke-dashoffset 0.2s" }}
                />
              </svg>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-8 w-full px-6"
            onClick={handleDismiss}
          >
            {children}
            <p className="text-label text-muted-foreground mt-4">TAP ANYWHERE TO HIDE</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
