import type { CSSProperties } from "react";

export type StickerShape =
  | "blob"
  | "squircle"
  | "arch"
  | "hex"
  | "flower"
  | "heart"
  | "star"
  | "triangle"
  | "pill"
  | "cloud";

export type StickerExpression = "happy" | "open" | "flat" | "wow";

const SHAPE_PATHS: Record<StickerShape, string> = {
  blob: "M50 2 C75 2 98 18 98 50 C98 78 78 98 50 98 C22 98 2 78 2 50 C2 22 22 2 50 2 Z",
  squircle: "M50 2 C82 2 98 18 98 50 C98 82 82 98 50 98 C18 98 2 82 2 50 C2 18 18 2 50 2 Z",
  arch: "M50 2 C76 2 96 22 96 50 L96 92 C96 95 94 98 90 98 L10 98 C6 98 4 95 4 92 L4 50 C4 22 24 2 50 2 Z",
  hex: "M50 4 L88 26 L88 74 L50 96 L12 74 L12 26 Z",
  flower:
    "M50 8 C58 0 72 4 74 16 C86 14 94 24 90 36 C100 40 100 56 90 60 C94 72 86 84 74 80 C72 92 58 96 50 88 C42 96 28 92 26 80 C14 84 6 72 10 60 C0 56 0 40 10 36 C6 24 14 14 26 16 C28 4 42 0 50 8 Z",
  heart:
    "M50 92 C20 70 6 52 6 32 C6 16 18 6 30 6 C40 6 46 12 50 22 C54 12 60 6 70 6 C82 6 94 16 94 32 C94 52 80 70 50 92 Z",
  star: "M50 4 L60 28 L86 30 L66 48 L72 74 L50 60 L28 74 L34 48 L14 30 L40 28 Z",
  triangle: "M50 6 L94 88 L6 88 Z",
  pill: "M50 4 L50 96 M30 4 L70 4 C82 4 94 16 94 28 L94 72 C94 84 82 96 70 96 L30 96 C18 96 6 84 6 72 L6 28 C6 16 18 4 30 4 Z",
  cloud:
    "M30 80 C16 80 6 70 6 56 C6 44 14 36 24 34 C26 22 38 14 50 14 C62 14 72 22 74 34 C86 34 94 44 94 56 C94 70 84 80 70 80 Z",
};

interface StickerProps {
  shape?: StickerShape;
  color?: string;
  size?: number;
  tilt?: number;
  expression?: StickerExpression;
  style?: CSSProperties;
  faceColor?: string;
  className?: string;
}

export function Sticker({
  shape = "blob",
  color = "#FF6D29",
  size = 80,
  tilt = 0,
  expression = "happy",
  style,
  faceColor = "#0E0A07",
  className,
}: StickerProps) {
  const path = SHAPE_PATHS[shape];
  return (
    <div
      className={`sticker ${className ?? ""}`}
      style={{ width: size, height: size, transform: `rotate(${tilt}deg)`, ...style }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="block">
        <path d={path} fill={color} />
      </svg>
      <div className="face" style={{ transform: `rotate(${-tilt}deg)` }}>
        <div className="eyes">
          <div className="eye" style={{ background: faceColor }} />
          <div
            className="eye"
            style={{ background: faceColor, animationDelay: "0.2s" }}
          />
        </div>
        {expression === "happy" && (
          <div className="mouth smile" style={{ borderBottomColor: faceColor }} />
        )}
        {expression === "open" && (
          <div className="mouth" style={{ background: faceColor }} />
        )}
        {expression === "flat" && (
          <div
            className="rounded-full mt-[6%]"
            style={{ width: "24%", height: 3, background: faceColor }}
          />
        )}
        {expression === "wow" && (
          <div
            className="rounded-full mt-[4%]"
            style={{ width: "14%", height: "14%", background: faceColor }}
          />
        )}
      </div>
    </div>
  );
}

interface CharacterGaugeProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  shape?: StickerShape;
  expression?: StickerExpression;
  /** If false (or no shape provided AND label provided), shows label/sublabel text instead of sticker */
  sticker?: boolean;
  label?: string;
  subLabel?: string;
}

export function CharacterGauge({
  value,
  max,
  size = 120,
  stroke = 10,
  color = "#FF6D29",
  shape = "blob",
  expression = "happy",
  sticker = true,
  label,
  subLabel,
}: CharacterGaugeProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = c * pct;
  const showSticker = sticker && !label;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
            transition: "stroke-dasharray 0.6s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showSticker ? (
          <Sticker
            shape={shape}
            color={color}
            size={size * 0.55}
            expression={expression}
          />
        ) : (
          <>
            <div
              className="font-[family-name:var(--font-heading)] font-bold text-text-primary leading-none"
              style={{ fontSize: size * 0.26 }}
            >
              {label}
            </div>
            {subLabel && (
              <div className="font-[family-name:var(--font-mono)] text-text-muted uppercase tracking-[0.1em] mt-1 text-[10px]">
                {subLabel}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
