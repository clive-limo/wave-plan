"use client";

import { DailyCheckin } from "@/lib/types";
import { useMemo, useState, useEffect, useId } from "react";

interface EnergySparklineProps {
  checkins: DailyCheckin[];
  width?: number;
  height?: number;
  interactive?: boolean;
}

export function EnergySparkline({ checkins, width = 480, height = 90, interactive = false }: EnergySparklineProps) {
  const maxEnergy = 5;
  const padding = { top: 12, right: 12, bottom: 12, left: 12 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const uniqueId = useId().replace(/:/g, "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const points = useMemo(() => {
    if (checkins.length < 2) return [];
    return checkins.map((c, i) => ({
      x: padding.left + (i / (checkins.length - 1)) * innerWidth,
      y: padding.top + innerHeight - (c.energy / maxEnergy) * innerHeight,
    }));
  }, [checkins, innerWidth, innerHeight, padding.left, padding.top]);

  if (checkins.length < 2) {
    return (
      <div className="flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-bg-primary/10 w-full" style={{ height }}>
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Insufficient Data</p>
      </div>
    );
  }

  const linePath = (() => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return path;
  })();

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x},${height - padding.bottom} L ${points[0].x},${height - padding.bottom} Z`
    : "";

  const lastCheckin = checkins[checkins.length - 1];
  const color = lastCheckin.energy >= 4 ? "#10b981" : lastCheckin.energy >= 3 ? "#f59e0b" : "#ef4444";

  const gradientId = `energy-grad-${uniqueId}`;

  return (
    <div className="relative w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible block"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          className="transition-opacity duration-1000 ease-out"
          style={{ opacity: mounted ? 1 : 0 }}
        />

        {/* Main curve */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: mounted ? "none" : "2000",
            strokeDashoffset: mounted ? 0 : 2000,
            transition: "stroke-dashoffset 1.5s ease-out, opacity 0.5s ease-out",
            opacity: mounted ? 0.8 : 0,
          }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="var(--color-bg-card)"
            stroke={color}
            strokeWidth="1"
            className="transition-all duration-300 opacity-0 group-hover:opacity-100"
          />
        ))}
      </svg>
    </div>
  );
}
