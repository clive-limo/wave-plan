import { Shield } from "lucide-react";
import { getStreakMultiplier } from "@/lib/xp";

interface StreakBadgeProps {
  streak: number;
  shields?: number;
  className?: string;
}

export function StreakBadge({ streak, shields = 0, className = "" }: StreakBadgeProps) {
  if (streak === 0 && shields === 0) return null;

  const multiplier = getStreakMultiplier(streak);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {streak > 0 && (
        <span className="text-gold text-sm font-medium">
          {streak} day streak
        </span>
      )}
      {multiplier > 1 && (
        <span className="text-xs bg-gold/15 text-gold px-1.5 py-0.5 rounded">
          x{multiplier} XP
        </span>
      )}
      {shields > 0 && (
        <span
          className="flex items-center gap-0.5 text-blue-300"
          title={`${shields} streak shield${shields === 1 ? "" : "s"}`}
        >
          {Array.from({ length: shields }).map((_, i) => (
            <Shield key={i} className="w-3.5 h-3.5 fill-blue-400/30" />
          ))}
        </span>
      )}
    </div>
  );
}
