"use client";

import { useState, useEffect } from "react";
import { RecurrenceRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { RecurrencePicker } from "@/components/tasks/recurrence-picker";

export interface RoutineFormData {
  title: string;
  icon: string;
  color: string;
  recurrence_rule: string;
}

interface RoutineFormProps {
  onSubmit: (data: RoutineFormData) => Promise<void>;
  onCancel?: () => void;
  initial?: Partial<RoutineFormData>;
  submitLabel?: string;
}

const COLORS = ["#FFC857", "#5B8DEF", "#43C59E", "#FF6D29", "#E85D9C", "#9B7EDE", "#3FC1C9"];
const ICONS = ["sun", "moon", "heart", "bolt", "sparkle", "flame"];

function parseRule(raw?: string): RecurrenceRule {
  if (raw) {
    try {
      return JSON.parse(raw) as RecurrenceRule;
    } catch {
      /* fallthrough */
    }
  }
  return { frequency: "daily" };
}

export function RoutineForm({ onSubmit, onCancel, initial, submitLabel }: RoutineFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "sun");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [rule, setRule] = useState<RecurrenceRule>(() => parseRule(initial?.recurrence_rule));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setIcon(initial.icon ?? "sun");
      setColor(initial.color ?? COLORS[0]);
      setRule(parseRule(initial.recurrence_rule));
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, icon, color, recurrence_rule: JSON.stringify(rule) });
      if (!initial) {
        setTitle("");
        setIcon("sun");
        setColor(COLORS[0]);
        setRule({ frequency: "daily" });
      }
    } finally {
      setLoading(false);
    }
  }

  const isEdit = !!initial;
  const label = submitLabel ?? (isEdit ? "Save" : "Add routine");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Routine name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Meditate, Read 20 min, Drink water"
        required
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Icon</span>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setIcon(name)}
              aria-label={name}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors
                ${icon === name
                  ? "bg-bg-elevated shadow-[0_0_0_1px_var(--color-border-light)_inset]"
                  : "bg-bg-primary border border-border hover:bg-bg-elevated"
                }
              `}
            >
              <Icon name={name} size={18} color={icon === name ? color : "currentColor"} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Color</span>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 2px var(--color-bg-card), 0 0 0 4px ${c}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      <RecurrencePicker rule={rule} onChange={setRule} />

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {isEdit ? "Discard" : "Cancel"}
          </Button>
        )}
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? (isEdit ? "Saving..." : "Creating...") : label}
        </Button>
      </div>
    </form>
  );
}
