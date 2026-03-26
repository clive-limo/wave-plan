"use client";

import { DailyCheckin } from "@/lib/types";

interface EnergyChartProps {
  checkins: DailyCheckin[];
}

export function EnergyChart({ checkins }: EnergyChartProps) {
  if (checkins.length === 0) {
    return <p className="text-text-muted text-sm text-center py-8">No check-in data yet.</p>;
  }

  const maxEnergy = 5;

  return (
    <div className="flex flex-col gap-1">
      {checkins.map((c) => {
        const date = new Date(c.date);
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const percent = (c.energy / maxEnergy) * 100;
        const color = c.energy >= 4 ? "#4abe7a" : c.energy >= 3 ? "#d4a843" : "#e05252";

        return (
          <div key={c.date} className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-14 text-right flex-shrink-0">{label}</span>
            <div className="flex-1 h-5 bg-bg-primary rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs text-text-muted w-4">{c.energy}</span>
          </div>
        );
      })}
    </div>
  );
}
