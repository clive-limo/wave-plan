"use client";

import { Task } from "@/lib/types";
import { toDateString, isToday, formatDayShort, getMonthDates } from "@/lib/date-utils";

interface MonthViewProps {
  year: number;
  month: number;
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

function countTasksForDay(tasks: Task[], dateStr: string): number {
  return tasks.filter((task) => {
    if (!task.start_date && !task.due_date) return false;
    const start = task.start_date ?? task.due_date!;
    const end = task.due_date ?? start;
    return dateStr >= start && dateStr <= end;
  }).length;
}

function getHeatColor(count: number): string {
  if (count === 0) return "transparent";
  if (count <= 2) return "rgba(74, 190, 122, 0.15)";
  if (count <= 4) return "rgba(212, 168, 67, 0.2)";
  return "rgba(224, 82, 82, 0.2)";
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({ year, month, tasks, onDayClick }: MonthViewProps) {
  const dates = getMonthDates(year, month);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-bg-card">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-2 text-xs text-text-muted font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {dates.map((date) => {
          const dateStr = toDateString(date);
          const isCurrentMonth = date.getMonth() === month;
          const today = isToday(date);
          const count = countTasksForDay(tasks, dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(date)}
              className={`
                p-2 min-h-[60px] text-left cursor-pointer transition-colors
                ${isCurrentMonth ? "bg-bg-card" : "bg-bg-primary"}
                hover:bg-bg-elevated
              `}
              style={{ backgroundColor: isCurrentMonth ? getHeatColor(count) : undefined }}
            >
              <span
                className={`
                  text-xs
                  ${today ? "bg-white text-bg-primary px-1.5 py-0.5 rounded-full font-medium" : ""}
                  ${isCurrentMonth ? "text-text-primary" : "text-text-muted"}
                `}
              >
                {date.getDate()}
              </span>
              {count > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-text-muted">{count} task{count !== 1 ? "s" : ""}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
