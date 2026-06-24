"use client";

import { Routine } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { parseRecurrenceRule, getRecurrenceLabel } from "@/lib/recurrence";

interface RoutineCardProps {
  routine: Routine;
  done: boolean;
  onToggle: (id: string, done: boolean, position?: { x: number; y: number }) => void;
  onEdit?: (routine: Routine) => void;
  onDelete?: (id: string) => void;
}

export function RoutineCard({ routine, done, onToggle, onEdit, onDelete }: RoutineCardProps) {
  const rule = parseRecurrenceRule(routine.recurrence_rule) ?? { frequency: "daily" as const };

  function handleToggle(e: React.MouseEvent) {
    onToggle(routine.id, !done, { x: e.clientX, y: e.clientY });
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-card
        transition-all duration-200
        ${done ? "opacity-60" : "hover:bg-bg-elevated"}
      `}
    >
      <button
        onClick={handleToggle}
        aria-label={done ? "Mark not done" : "Mark done"}
        className="w-6 h-6 rounded-full border-2 flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center"
        style={
          done
            ? { backgroundColor: routine.color, borderColor: routine.color }
            : { borderColor: `${routine.color}80` }
        }
      >
        {done && <Icon name="check" size={13} color="var(--color-bg-primary)" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${done ? "line-through text-text-muted" : ""}`}>{routine.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant="default" className="gap-1">
            <Icon name="routine" size={10} color={routine.color} /> {getRecurrenceLabel(rule)}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(routine)}
            className="text-text-muted hover:text-text-primary text-xs cursor-pointer transition-colors px-1"
            title="Edit routine"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(routine.id)}
            className="text-text-muted hover:text-hp-low text-xs cursor-pointer transition-colors px-1"
            title="Delete routine"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
