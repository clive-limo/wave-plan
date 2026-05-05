"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { StreakEvent } from "@/contexts/celebration-context";

interface StreakToastProps {
  event: StreakEvent;
  offsetIndex?: number;
  onDone: () => void;
}

const VARIANTS: Record<
  StreakEvent["type"],
  { color: string; icon: string }
> = {
  "streak-broken": { color: "#FF5A5A", icon: "flame" },
  "shield-used": { color: "#6B96FF", icon: "shield" },
  "shield-earned": { color: "#FFC857", icon: "shield" },
};

export function StreakToast({ event, offsetIndex = 0, onDone }: StreakToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  const variant = VARIANTS[event.type];

  let title: string;
  let sub: string | null = null;
  switch (event.type) {
    case "streak-broken":
      title = "Streak broken";
      sub = `−${event.penalty} XP`;
      break;
    case "shield-used":
      title = "Shield used";
      sub = "Streak preserved";
      break;
    case "shield-earned":
      title = "Shield earned";
      sub = "+1 Shield";
      break;
  }

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
        boxShadow: `0 0 0 1px ${variant.color}55 inset, 0 8px 24px rgba(0,0,0,0.4), 0 0 18px ${variant.color}30`,
      }}
    >
      <Icon name={variant.icon} size={18} color={variant.color} />
      <div className="flex-1">
        <div
          className="text-[13px] font-semibold"
          style={{ color: variant.color }}
        >
          {title}
        </div>
        {sub && <div className="text-[11px] text-text-secondary">{sub}</div>}
      </div>
    </div>
  );
}
