"use client";

import { Task, Priority } from "@/lib/types";
import { Icon } from "@/components/ui/icon";

interface QuestCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task["status"], position?: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  fun: { icon: "🎉", label: "Fun" },
  learning: { icon: "📖", label: "Learning" },
  errands: { icon: "🛒", label: "Errands" },
  health: { icon: "🌱", label: "Health" },
  other: { icon: "✨", label: "Other" },
};

const PRIORITY_PILL: Record<Priority, string> = {
  urgent: "pill-red",
  normal: "pill-sun",
  low: "pill-leaf",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  normal: "Normal",
  low: "Chill",
};

function formatWhen(date: string | null): string {
  if (!date) return "Anytime";
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function QuestCard({ task, onStatusChange, onDelete }: QuestCardProps) {
  const isDone = task.status === "done";
  const cat = task.category ? CATEGORY_META[task.category] : null;

  if (isDone) {
    return (
      <div className="px-5 py-3.5 flex items-center gap-3 opacity-60 border-t border-border/50 first:border-t-0">
        <div className="w-[22px] h-[22px] rounded-lg bg-[#4EDD8E] flex items-center justify-center flex-shrink-0">
          <Icon name="check" size={13} color="#0E0A07" strokeWidth={3} />
        </div>
        <span className="line-through flex-1 truncate">{task.title}</span>
      </div>
    );
  }

  return (
    <div className="card-surface p-[18px] cursor-pointer transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-2.5">
        <button
          onClick={(e) =>
            onStatusChange(task.id, "done", { x: e.clientX, y: e.clientY })
          }
          className="w-[22px] h-[22px] rounded-lg flex-shrink-0 mt-0.5 shadow-[0_0_0_1.5px_var(--color-text-faint)_inset] transition-colors hover:shadow-[0_0_0_1.5px_var(--color-text-secondary)_inset]"
          aria-label="Complete"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold leading-snug">{task.title}</div>
          {task.description && (
            <div className="text-xs text-text-secondary mt-1">{task.description}</div>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-text-muted hover:text-guild-coral transition-colors flex-shrink-0"
            aria-label="Delete"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      <div className="flex justify-between items-center flex-wrap gap-1.5">
        <span className={`pill ${PRIORITY_PILL[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        <span className="text-[11px] text-text-muted inline-flex items-center gap-1">
          {cat && (
            <>
              <span>{cat.icon}</span>
              {cat.label} ·{" "}
            </>
          )}
          {formatWhen(task.due_date)}
        </span>
      </div>
    </div>
  );
}
