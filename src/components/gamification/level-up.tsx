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
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  function dismiss() {
    setVisible(false);
    setTimeout(onDone, 300);
  }

  return (
    <div
      onClick={dismiss}
      className={`
        fixed inset-0 z-[200] flex items-center justify-center
        bg-black/55 backdrop-blur-md
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="relative text-center animate-overlay-pop">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: -200,
            background:
              "radial-gradient(circle, rgba(255,200,87,0.35), rgba(255,109,41,0.1) 40%, transparent 70%)",
            animation: "float 3s ease-in-out infinite",
          }}
        />
        <div className="relative">
          <div className="font-[family-name:var(--font-mono)] text-sm text-gold uppercase tracking-[0.3em] mb-3">
            Level Up
          </div>
          <div
            className="font-[family-name:var(--font-heading)] gold-shimmer glow-text font-bold leading-[0.9]"
            style={{ fontSize: 180, letterSpacing: "-0.05em" }}
          >
            {level}
          </div>
          <div
            className="font-[family-name:var(--font-heading)] font-bold mt-3"
            style={{ fontSize: 28 }}
          >
            <span className="gold-shimmer">{title}</span>
          </div>
          <p className="text-text-secondary mt-3 m-0">
            The tide knows your name now.
          </p>
        </div>
      </div>
    </div>
  );
}
