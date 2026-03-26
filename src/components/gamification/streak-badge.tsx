import { getStreakMultiplier } from "@/lib/xp";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className = "" }: StreakBadgeProps) {
  if (streak === 0) return null;

  const multiplier = getStreakMultiplier(streak);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gold text-sm font-medium">
        {streak} day streak
      </span>
      {multiplier > 1 && (
        <span className="text-xs bg-gold/15 text-gold px-1.5 py-0.5 rounded">
          x{multiplier} XP
        </span>
      )}
    </div>
  );
}
