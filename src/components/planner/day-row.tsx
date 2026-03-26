"use client";

import { Task, Guild } from "@/lib/types";
import { isToday } from "@/lib/date-utils";
import { TimeBlock } from "./time-block";

interface DayTask {
  task: Task;
  hours: number;
}

interface DayRowProps {
  date: Date;
  dayTasks: DayTask[];
  guilds: Map<string, Guild>;
}

export function DayRow({ date, dayTasks, guilds }: DayRowProps) {
  const today = isToday(date);
  const totalHours = dayTasks.reduce((sum, dt) => sum + dt.hours, 0);
  const overcommitted = totalHours > 10;

  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("en-US", { month: "short" });

  return (
    <div className={`px-4 py-3 ${today ? "bg-bg-elevated/40" : ""}`}>
      {/* Day header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className={`
            text-xs font-medium uppercase tracking-wider
            ${today ? "text-text-primary" : "text-text-muted"}
          `}>
            {dayName}
          </span>
          <span className={`
            text-sm font-medium
            ${today
              ? "bg-white text-bg-primary w-6 h-6 rounded-full flex items-center justify-center text-xs"
              : "text-text-secondary"
            }
          `}>
            {dayNum}
          </span>
          <span className="text-xs text-text-muted">{monthName}</span>
        </div>

        <div className="flex-1" />

        {totalHours > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded
            ${overcommitted
              ? "bg-hp-low/10 text-hp-low font-medium"
              : "bg-bg-elevated text-text-muted"
            }
          `}>
            {totalHours}h{overcommitted ? " overcommitted" : ""}
          </span>
        )}
      </div>

      {/* Tasks */}
      {dayTasks.length === 0 ? (
        <div className="py-1">
          <span className="text-xs text-text-muted">No tasks scheduled</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {dayTasks.map(({ task, hours }) => {
            const guild = task.guild_id ? guilds.get(task.guild_id) : null;
            return (
              <TimeBlock
                key={task.id}
                task={task}
                hours={hours}
                guildColor={guild?.color ?? "#c9a84c"}
                guildName={guild?.name ?? "Side Quest"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
