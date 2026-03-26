"use client";

import { useEffect, useState } from "react";
import { ConfettiBurst } from "./confetti-burst";

interface PerfectDayProps {
  blocksCompleted: number;
  totalXp: number;
  onDone: () => void;
}

export function PerfectDay({ blocksCompleted, totalXp, onDone }: PerfectDayProps) {
  const [visible, setVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  function dismiss() {
    setVisible(false);
    setTimeout(onDone, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-[55] flex items-center justify-center bg-black/50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={dismiss}
    >
      {showConfetti && (
        <ConfettiBurst
          priority="urgent"
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          onDone={() => setShowConfetti(false)}
        />
      )}

      <div className="text-center animate-fade-in">
        <div className="inline-block px-10 py-8 rounded-xl bg-bg-elevated border border-gold/30">
          <p className="text-gold-shimmer text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
            Perfect Day!
          </p>
          <p className="text-text-secondary text-sm mb-1">
            {blocksCompleted}/{blocksCompleted} blocks completed
          </p>
          <p className="text-gold text-lg font-semibold">
            +{totalXp} XP
          </p>
        </div>
      </div>
    </div>
  );
}
