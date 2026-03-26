"use client";

import { Task, Guild } from "@/lib/types";
import { isToday, formatDayShort, formatDayNum } from "@/lib/date-utils";
import { TimeBlock } from "./time-block";

interface DayTask {
  task: Task;
  hours: number;
}

interface DayColumnProps {
  date: Date;
  dayTasks: DayTask[];
  guilds: Map<string, Guild>;
  compact?: boolean;
}

export function DayColumn({ date, dayTasks, guilds, compact }: DayColumnProps) {
  const today = isToday(date);
  const totalHours = dayTasks.reduce((sum, dt) => sum + dt.hours, 0);
  const overcommitted = totalHours > 10;

  return (
    <div
      className={`
        flex flex-col min-w-0 flex-1
        ${compact ? "p-1" : "p-2"}
        ${today ? "bg-bg-elevated/50 rounded-lg" : ""}
      `}
    >
      <div className="text-center mb-2">
        <p className="text-xs text-text-muted">{formatDayShort(date)}</p>
        <p
          className={`
            text-sm font-medium
            ${today ? "text-white bg-white/10 w-7 h-7 rounded-full flex items-center justify-center mx-auto" : "text-text-primary"}
          `}
        >
          {formatDayNum(date)}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 min-h-[60px]">
        {dayTasks.map(({ task, hours }) => {
          const guild = task.guild_id ? guilds.get(task.guild_id) : null;
          return (
            <TimeBlock
              key={task.id}
              task={task}
              hours={hours}
              guildColor={guild?.color}
              guildName={guild?.name}
            />
          );
        })}
      </div>

      {totalHours > 0 && (
        <div className={`text-center mt-2 text-xs ${overcommitted ? "text-hp-low font-medium" : "text-text-muted"}`}>
          {totalHours}h{overcommitted ? " !" : ""}
        </div>
      )}
    </div>
  );
}
