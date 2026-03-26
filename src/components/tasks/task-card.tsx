"use client";

import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { NavIcon } from "@/components/layout/nav-icon";
import { getTaskProgress } from "@/lib/progress";

interface TaskCardProps {
  task: Task;
  guildColor?: string;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskCard({ task, guildColor, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border border-border bg-bg-card
        transition-all duration-200
        ${isDone ? "opacity-50" : "hover:bg-bg-elevated"}
      `}
    >
      <button
        onClick={() => onStatusChange(task.id, isDone ? "todo" : "done")}
        className={`
          mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer transition-colors
          ${isDone
            ? "bg-hp-high border-hp-high"
            : "border-border-light hover:border-text-secondary"
          }
        `}
        style={!isDone && guildColor ? { borderColor: `${guildColor}60` } : {}}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isDone ? "line-through text-text-muted" : ""}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.is_recurring && (
            <Badge variant="default" className="gap-1">
              <NavIcon name="repeat" size={10} /> Recurring
            </Badge>
          )}
          <Badge variant={task.priority}>{task.priority}</Badge>
          {task.due_date && (
            <span className="text-xs text-text-muted">{formatDate(task.due_date)}</span>
          )}
          {task.total_hours && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              {task.actual_hours ?? 0}/{task.total_hours}h
              <span className="w-12 h-[3px] bg-bg-primary rounded-full overflow-hidden inline-block">
                <span
                  className="block h-full rounded-full transition-all bg-text-secondary"
                  style={{ width: `${(getTaskProgress(task) ?? 0) * 100}%` }}
                />
              </span>
            </span>
          )}
          {task.xp_awarded && (
            <Badge variant="gold">+{task.xp_awarded} XP</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && !isDone && (
          <button
            onClick={() => onEdit(task)}
            className="text-text-muted hover:text-text-primary text-xs cursor-pointer transition-colors px-1"
            title="Edit task"
          >
            Edit
          </button>
        )}
        {onDelete && !isDone && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-text-muted hover:text-hp-low text-xs cursor-pointer transition-colors px-1"
            title="Delete task"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
