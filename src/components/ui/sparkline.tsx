interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = "#FF6D29",
  width = 120,
  height = 36,
  fill = true,
  className,
}: SparklineProps) {
  if (data.length === 0) {
    return <svg width={width} height={height} className={className} />;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = points
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} className={className} style={{ display: "block" }}>
      {fill && <path d={area} fill={color} opacity={0.18} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}
