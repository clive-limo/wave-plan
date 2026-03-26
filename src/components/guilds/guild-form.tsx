"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "./color-picker";
import { GUILD_COLORS } from "@/lib/constants";

interface GuildFormProps {
  initial?: { name: string; color: string; icon: string };
  onSubmit: (data: { name: string; color: string; icon: string }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const ICON_OPTIONS = [
  { value: "briefcase", emoji: "\uD83D\uDCBC" },
  { value: "code", emoji: "\uD83D\uDCBB" },
  { value: "palette", emoji: "\uD83C\uDFA8" },
  { value: "book", emoji: "\uD83D\uDCDA" },
  { value: "rocket", emoji: "\uD83D\uDE80" },
  { value: "star", emoji: "\u2B50" },
  { value: "zap", emoji: "\u26A1" },
  { value: "coffee", emoji: "\u2615" },
  { value: "globe", emoji: "\uD83C\uDF0D" },
  { value: "wrench", emoji: "\uD83D\uDD27" },
  { value: "music", emoji: "\uD83C\uDFB5" },
  { value: "heart", emoji: "\u2764\uFE0F" },
];

export function GuildForm({ initial, onSubmit, onCancel, submitLabel = "Create Guild" }: GuildFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? GUILD_COLORS[0].value);
  const [icon, setIcon] = useState(initial?.icon ?? "briefcase");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, color, icon });
    } finally {
      setLoading(false);
    }
  }

  const selectedEmoji = ICON_OPTIONS.find((i) => i.value === icon)?.emoji ?? "\uD83D\uDCBC";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Icon</span>
          <div className="flex gap-1.5 flex-wrap">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIcon(opt.value)}
                className={`
                  w-9 h-9 rounded-md flex items-center justify-center text-lg cursor-pointer transition-colors
                  ${icon === opt.value ? "bg-bg-elevated border border-border-light" : "hover:bg-bg-elevated"}
                `}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Input
        label="Guild name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Acme Corp, Freelance, Side Hustle"
        required
      />

      <ColorPicker value={color} onChange={setColor} />

      <div className="flex items-center gap-3 mb-1">
        <span className="text-sm text-text-secondary">Preview:</span>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {selectedEmoji} {name || "Guild Name"}
        </span>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
