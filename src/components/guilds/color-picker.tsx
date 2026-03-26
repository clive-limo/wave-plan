"use client";

import { GUILD_COLORS } from "@/lib/constants";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-text-secondary">Color</span>
      <div className="flex gap-2 flex-wrap">
        {GUILD_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`
              w-7 h-7 rounded-full cursor-pointer transition-all duration-200
              ${value === c.value ? "ring-2 ring-offset-2 ring-offset-bg-primary" : "hover:scale-110"}
            `}
            style={{
              backgroundColor: c.value,
              ...(value === c.value ? { "--tw-ring-color": c.value } as React.CSSProperties : {}),
            }}
            title={c.label}
          />
        ))}
      </div>
    </div>
  );
}
