"use client";

import { useState } from "react";
import { Mood } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Sticker } from "@/components/ui/sticker";

interface DailyCheckinModalProps {
  open: boolean;
  onSubmit: (data: { energy: number; mood: Mood; sleep_quality: number }) => Promise<void>;
}

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "stressed", label: "Stressed", emoji: "😩" },
  { value: "drained", label: "Drained", emoji: "😮‍💨" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "motivated", label: "Motivated", emoji: "😊" },
  { value: "energized", label: "Energized", emoji: "🤩" },
];

export function DailyCheckinModal({ open, onSubmit }: DailyCheckinModalProps) {
  const [energy, setEnergy] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(false);

  const ready = energy > 0 && sleep > 0 && mood !== null;

  async function handleSubmit() {
    if (!ready || !mood) return;
    setLoading(true);
    await onSubmit({ energy, mood, sleep_quality: sleep });
    setLoading(false);
  }

  return (
    <Modal
      open={open}
      onClose={() => {}}
      dismissible={false}
      maxWidth={500}
    >
      <div className="text-center mb-6">
        <Sticker shape="flower" color="#FF6FB5" size={64} expression="happy" />
        <h2
          className="font-[family-name:var(--font-heading)] font-bold mt-3.5 mb-1"
          style={{ fontSize: 26, letterSpacing: "-0.02em" }}
        >
          How&apos;s the water today?
        </h2>
        <p className="text-text-secondary text-[13px] m-0">
          Quick three taps. We use it to plan kinder days.
        </p>
      </div>

      <div className="flex flex-col gap-[18px]">
        <div>
          <label className="label">Energy</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnergy(n)}
                className={`
                  flex-1 py-3.5 rounded-xl font-[family-name:var(--font-heading)]
                  font-bold text-lg transition-colors
                  ${energy === n
                    ? "bg-sun text-[#1A0A03]"
                    : "bg-white/[0.04] text-text-primary shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] hover:bg-white/[0.08]"
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Sleep</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSleep(n)}
                className={`
                  flex-1 py-3.5 rounded-xl font-[family-name:var(--font-heading)]
                  font-bold text-lg transition-colors
                  ${sleep === n
                    ? "bg-gold text-[#1A0A03]"
                    : "bg-white/[0.04] text-text-primary shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] hover:bg-white/[0.08]"
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Mood</label>
          <div className="flex gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`
                  flex-1 py-3 rounded-xl flex flex-col items-center gap-1
                  transition-colors
                  ${mood === m.value
                    ? "bg-[rgba(255,109,41,0.18)] shadow-[0_0_0_1.5px_var(--color-sun)_inset]"
                    : "bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] hover:bg-white/[0.08]"
                  }
                `}
              >
                <span style={{ fontSize: 24 }}>{m.emoji}</span>
                <span className="text-[10px] text-text-secondary">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary mt-1"
          disabled={!ready || loading}
          style={{ padding: 14 }}
          onClick={handleSubmit}
        >
          {loading
            ? "Setting the day…"
            : ready
            ? "Set the day"
            : "Pick all three first"}
        </button>
      </div>
    </Modal>
  );
}
