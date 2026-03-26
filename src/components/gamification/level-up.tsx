"use client";

import { useEffect, useState } from "react";

interface LevelUpProps {
  level: number;
  title: string;
  onDone: () => void;
}

export function LevelUp({ level, title, onDone }: LevelUpProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/40
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
    >
      <div className="text-center animate-fade-in">
        <div className="animate-glow inline-block px-8 py-6 rounded-xl bg-bg-elevated border border-gold/40">
          <p className="text-gold text-xs uppercase tracking-widest mb-2">Level Up</p>
          <p className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-1">
            Level {level}
          </p>
          <p className="text-gold text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}
