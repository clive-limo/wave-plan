"use client";

import { getHpColor, getHpLabel } from "@/lib/hp";
import { ProgressBar } from "@/components/ui/progress-bar";

interface HpBarProps {
  hp: number;
  className?: string;
}

export function HpBar({ hp, className = "" }: HpBarProps) {
  const color = getHpColor(hp);
  const label = getHpLabel(hp);
  const isCritical = hp < 30;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
          HP
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color }}>{label}</span>
          <span className="text-xs text-text-muted">{hp}/100</span>
        </div>
      </div>
      <ProgressBar value={hp} color={color} height="h-3" />
      {isCritical && (
        <p className="text-xs text-hp-low mt-1.5">
          Your energy is low. Consider taking a break or reducing workload.
        </p>
      )}
    </div>
  );
}
