"use client";

import { DailyCheckin } from "@/lib/types";

interface EnergySparklineProps {
  checkins: DailyCheckin[];
  width?: number;
  height?: number;
}

export function EnergySparkline({ checkins, width = 200, height = 40 }: EnergySparklineProps) {
  if (checkins.length < 2) {
    return (
      <div className="text-xs text-text-muted" style={{ width, height }}>
        Need more data...
      </div>
    );
  }

  const maxEnergy = 5;
  const padding = 4;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = checkins.map((c, i) => {
    const x = padding + (i / (checkins.length - 1)) * innerWidth;
    const y = padding + innerHeight - (c.energy / maxEnergy) * innerHeight;
    return `${x},${y}`;
  });

  const lastCheckin = checkins[checkins.length - 1];
  const color = lastCheckin.energy >= 4 ? "#4abe7a" : lastCheckin.energy >= 3 ? "#d4a843" : "#e05252";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {checkins.map((c, i) => {
        const x = padding + (i / (checkins.length - 1)) * innerWidth;
        const y = padding + innerHeight - (c.energy / maxEnergy) * innerHeight;
        return (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        );
      })}
    </svg>
  );
}
