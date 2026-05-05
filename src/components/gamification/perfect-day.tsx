"use client";

import { useEffect, useMemo, useState } from "react";

interface PerfectDayProps {
  blocksCompleted: number;
  totalXp: number;
  onDone: () => void;
}

const CONFETTI_COLORS = ["#FFC857", "#FF6D29", "#FF6FB5", "#FFFFFF", "#2B6BFF"];

export function PerfectDay({ blocksCompleted, totalXp, onDone }: PerfectDayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const dist = 300 + Math.random() * 250;
        return {
          tx: `${Math.cos(angle) * dist}px`,
          ty: `${Math.sin(angle) * dist}px`,
          r: `${Math.random() * 720 - 360}deg`,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          duration: 1.4 + Math.random() * 0.6,
        };
      }),
    []
  );

  function dismiss() {
    setVisible(false);
    setTimeout(onDone, 300);
  }

  return (
    <div
      onClick={dismiss}
      className={`
        fixed inset-0 z-[200] flex items-center justify-center overflow-hidden
        bg-black/50 backdrop-blur-md
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {confetti.map((c, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute left-1/2 top-1/2"
          style={
            {
              width: 8,
              height: 14,
              borderRadius: 2,
              background: c.color,
              "--tx": c.tx,
              "--ty": c.ty,
              "--r": c.r,
              animation: `confetti-pop ${c.duration}s ease-out forwards`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="text-center animate-overlay-pop">
        <div style={{ fontSize: 80 }}>🌅</div>
        <h1
          className="font-[family-name:var(--font-heading)] gold-shimmer glow-text font-bold m-3"
          style={{ fontSize: 84, letterSpacing: "-0.03em" }}
        >
          Perfect Day!
        </h1>
        <div className="font-[family-name:var(--font-heading)] text-text-primary text-[22px]">
          {blocksCompleted} / {blocksCompleted} blocks · +{totalXp} XP
        </div>
        <p className="text-text-secondary mt-3 m-0">
          Now go close the laptop. Seriously.
        </p>
      </div>
    </div>
  );
}
