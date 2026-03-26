"use client";

import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getTaskProgress } from "@/lib/progress";

interface QuestCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task["status"], position?: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  fun: "sparkles",
  learning: "book-open",
  errands: "check-circle",
  health: "heart",
  other: "star",
};

const CATEGORY_LABELS: Record<string, string> = {
  fun: "Fun",
  learning: "Learning",
  errands: "Errands",
  health: "Health",
  other: "Other",
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function QuestCard({ task, onStatusChange, onDelete }: QuestCardProps) {
  const isDone = task.status === "done";

  return (
    <div
      className={`
        p-4 rounded-lg border border-border bg-bg-card
        transition-all duration-200
        ${isDone ? "opacity-50" : "hover:bg-bg-elevated hover:border-gold/20"}
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => onStatusChange(task.id, isDone ? "todo" : "done", { x: e.clientX, y: e.clientY })}
          className={`
            mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer transition-colors
            ${isDone
              ? "bg-gold text-bg-primary flex items-center justify-center text-xs"
              : "border-2 border-gold/40 hover:border-gold"
            }
          `}
          style={{ borderRadius: "4px" }}
        >
          {isDone && "\u2713"}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDone ? "line-through text-text-muted" : ""}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.category && (
              <Badge variant="gold">{CATEGORY_LABELS[task.category] ?? task.category}</Badge>
            )}
            <Badge variant={task.priority}>{task.priority}</Badge>
            {task.due_date && (
              <span className="text-xs text-text-muted">{formatDate(task.due_date)}</span>
            )}
            {task.xp_awarded && (
              <Badge variant="gold">+{task.xp_awarded} XP</Badge>
            )}
          </div>

          {/* Progress bar for multi-day quests */}
          {task.total_hours && task.total_hours > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-[3px] bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-gold"
                  style={{ width: `${(getTaskProgress(task) ?? 0) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-text-muted flex-shrink-0">
                {task.actual_hours ?? 0}/{task.total_hours}h
              </span>
            </div>
          )}
        </div>

        {onDelete && !isDone && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-text-muted hover:text-hp-low text-sm cursor-pointer transition-colors"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
