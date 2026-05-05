"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

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
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  const color = "#FFC857";

  return (
    <div
      className={`
        fixed right-6 z-[150] min-w-[220px]
        flex items-center gap-2.5 px-4 py-3 rounded-2xl
        transition-opacity duration-300
        ${visible ? "opacity-100 animate-toast-in" : "opacity-0 translate-x-4"}
      `}
      style={{
        bottom: `${24 + offsetIndex * 64}px`,
        background:
          "linear-gradient(180deg, var(--color-bg-elevated), var(--color-bg-card))",
        boxShadow: `0 0 0 1px ${color}55 inset, 0 8px 24px rgba(0,0,0,0.4), 0 0 18px ${color}30`,
      }}
    >
      <Icon name="sparkle" size={18} color={color} />
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color }}>
          +{xp} XP
        </div>
        <div className="text-[11px] text-text-secondary">Quest cleared</div>
      </div>
    </div>
  );
}
