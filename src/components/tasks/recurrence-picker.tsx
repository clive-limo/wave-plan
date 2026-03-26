"use client";

import { RecurrenceRule } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface RecurrencePickerProps {
  rule: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "weekly", label: "Specific days" },
  { value: "custom", label: "Custom interval" },
];

const DAY_LABELS = [
  { value: 0, label: "S" },
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
];

const UNIT_OPTIONS = [
  { value: "day", label: "days" },
  { value: "week", label: "weeks" },
];

export function RecurrencePicker({ rule, onChange }: RecurrencePickerProps) {
  function toggleDay(day: number) {
    const current = rule.days ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    onChange({ ...rule, days: next });
  }

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-bg-primary">
      <Select
        label="Repeats"
        options={FREQUENCY_OPTIONS}
        value={rule.frequency}
        onChange={(e) =>
          onChange({
            ...rule,
            frequency: e.target.value as RecurrenceRule["frequency"],
            days: e.target.value === "weekly" ? (rule.days ?? [1]) : undefined,
            interval: e.target.value === "custom" ? (rule.interval ?? 2) : undefined,
            unit: e.target.value === "custom" ? (rule.unit ?? "day") : undefined,
          })
        }
      />

      {rule.frequency === "weekly" && (
        <div>
          <span className="text-xs text-text-secondary block mb-1.5">On these days</span>
          <div className="flex gap-1">
            {DAY_LABELS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={`
                  w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition-colors
                  ${(rule.days ?? []).includes(value)
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-bg-elevated text-text-muted border border-border hover:text-text-secondary"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {rule.frequency === "custom" && (
        <div className="flex items-end gap-2">
          <Input
            label="Every"
            type="number"
            min="1"
            value={String(rule.interval ?? 2)}
            onChange={(e) => onChange({ ...rule, interval: parseInt(e.target.value) || 1 })}
            className="w-20"
          />
          <Select
            options={UNIT_OPTIONS}
            value={rule.unit ?? "day"}
            onChange={(e) => onChange({ ...rule, unit: e.target.value as "day" | "week" })}
            className="w-24"
          />
        </div>
      )}

      <Input
        label="Until (optional)"
        type="date"
        value={rule.end_date ?? ""}
        onChange={(e) => onChange({ ...rule, end_date: e.target.value || undefined })}
      />
    </div>
  );
}
