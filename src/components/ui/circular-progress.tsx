"use client";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = "var(--color-gold)",
  trackColor = "var(--color-bg-primary)",
  label,
  sublabel,
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference - percent * circumference;
  const center = size / 2;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {/* Center label overlay */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ marginTop: -size, height: size, width: size }}
      >
        <span className="text-lg font-bold font-[family-name:var(--font-heading)]" style={{ color }}>
          {label ?? Math.round(percent * 100)}
        </span>
        {sublabel && (
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
