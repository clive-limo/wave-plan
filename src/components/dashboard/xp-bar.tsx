"use client";

import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/progress-bar";

interface XpBarProps {
  totalXp: number;
  className?: string;
}

export function XpBar({ totalXp, className = "" }: XpBarProps) {
  const info = getLevelInfo(totalXp);
  const progress = getXpProgress(totalXp);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gold font-semibold">Lv.{info.level}</span>
          <span className="text-xs text-text-secondary">{info.title}</span>
        </div>
        <span className="text-xs text-text-muted">
          {totalXp} / {info.xpForNext} XP
        </span>
      </div>
      <ProgressBar value={progress * 100} color="var(--color-gold)" height="h-2" />
    </div>
  );
}
