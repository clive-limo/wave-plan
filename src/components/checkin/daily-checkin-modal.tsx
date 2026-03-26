"use client";

import { useState } from "react";
import { Mood } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface DailyCheckinModalProps {
  open: boolean;
  onSubmit: (data: { energy: number; mood: Mood; sleep_quality: number }) => Promise<void>;
}

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "stressed", label: "Stressed", emoji: "\uD83D\uDE30" },
  { value: "drained", label: "Drained", emoji: "\uD83D\uDE29" },
  { value: "neutral", label: "Neutral", emoji: "\uD83D\uDE10" },
  { value: "motivated", label: "Motivated", emoji: "\uD83D\uDE0A" },
  { value: "energized", label: "Energized", emoji: "\uD83D\uDD25" },
];

function RatingScale({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="text-sm text-text-secondary block mb-2">{label}</label>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`
              w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-all
              ${value === n
                ? "bg-gold/20 text-gold border border-gold/40"
                : "bg-bg-primary border border-border text-text-muted hover:text-text-secondary hover:border-border-light"
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyCheckinModal({ open, onSubmit }: DailyCheckinModalProps) {
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState<Mood>("neutral");
  const [sleep, setSleep] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    await onSubmit({ energy, mood, sleep_quality: sleep });
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={() => {}} title="Daily Check-in">
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-sm">
          How are you doing today? This helps track your wellbeing.
        </p>

        <RatingScale label="Energy level" value={energy} onChange={setEnergy} />
        <RatingScale label="Sleep quality" value={sleep} onChange={setSleep} />

        <div>
          <label className="text-sm text-text-secondary block mb-2">Mood</label>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex items-center gap-1.5
                  ${mood === m.value
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-bg-primary border border-border text-text-muted hover:text-text-secondary"
                  }
                `}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full">
          {loading ? "Saving..." : "Save Check-in"}
        </Button>
      </div>
    </Modal>
  );
}
