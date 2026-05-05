interface LogoProps {
  size?: number;
  withText?: boolean;
}

export function Logo({ size = 32, withText = true }: LogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40">
        <defs>
          <radialGradient id="logo-sun" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#FFD23F" />
            <stop offset="60%" stopColor="#FF8F4D" />
            <stop offset="100%" stopColor="#FF6D29" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="18" r="11" fill="url(#logo-sun)" />
        <path
          d="M2 30 C 8 26, 12 32, 20 30 S 32 26, 38 30 L 38 38 L 2 38 Z"
          fill="#0E0A07"
        />
        <path
          d="M2 30 C 8 26, 12 32, 20 30 S 32 26, 38 30"
          stroke="#FF6D29"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      {withText && (
        <span
          className="font-[family-name:var(--font-heading)] font-bold tracking-tight whitespace-nowrap"
          style={{ fontSize: size * 0.55 }}
        >
          Wave Plan
        </span>
      )}
    </div>
  );
}
