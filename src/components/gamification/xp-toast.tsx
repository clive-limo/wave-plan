"use client";

import { useEffect, useState } from "react";

interface XpToastProps {
  xp: number;
  offsetIndex?: number;
  onDone: () => void;
}

export function XpToast({ xp, offsetIndex = 0, onDone }: XpToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`
        fixed right-4 z-[55]
        px-4 py-2.5 rounded-lg bg-bg-elevated border border-gold/30
        text-gold font-semibold text-sm shadow-lg
        transition-all duration-300
        ${visible ? "animate-slide-in opacity-100" : "opacity-0 translate-x-4"}
      `}
      style={{ bottom: `${32 + offsetIndex * 48}px` }}
    >
      +{xp} XP
    </div>
  );
}
