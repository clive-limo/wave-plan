interface StatBlockProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export function StatBlock({ label, value, subtext, color }: StatBlockProps) {
  return (
    <div className="p-3 rounded-lg bg-bg-primary border border-border text-center">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p
        className="text-xl font-bold font-[family-name:var(--font-heading)]"
        style={color ? { color } : {}}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-text-muted mt-0.5">{subtext}</p>}
    </div>
  );
}
