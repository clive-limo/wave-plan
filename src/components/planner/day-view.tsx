"use client";

import { Task, Guild } from "@/lib/types";
import { toDateString, isToday } from "@/lib/date-utils";
import { TimeBlock } from "./time-block";

interface DayViewProps {
  date: Date;
  tasks: Task[];
  guilds: Map<string, Guild>;
}

function getTasksForDay(tasks: Task[], dateStr: string) {
  return tasks.filter((task) => {
    if (!task.start_date && !task.due_date) return false;
    const start = task.start_date ?? task.due_date!;
    const end = task.due_date ?? start;
    return dateStr >= start && dateStr <= end;
  });
}

export function DayView({ date, tasks, guilds }: DayViewProps) {
  const dateStr = toDateString(date);
  const dayTasks = getTasksForDay(tasks, dateStr);
  const today = isToday(date);

  const totalHours = dayTasks.reduce((sum, t) => sum + (t.daily_hours ?? 1), 0);
  const overcommitted = totalHours > 10;

  const byGuild = new Map<string, Task[]>();
  const sideQuests: Task[] = [];

  for (const task of dayTasks) {
    if (task.guild_id) {
      const existing = byGuild.get(task.guild_id) ?? [];
      existing.push(task);
      byGuild.set(task.guild_id, existing);
    } else {
      sideQuests.push(task);
    }
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          {today && <span className="ml-2 text-xs text-text-muted">(Today)</span>}
        </h3>
        <span className={`text-sm ${overcommitted ? "text-hp-low font-medium" : "text-text-muted"}`}>
          {totalHours}h scheduled{overcommitted ? " - Overcommitted!" : ""}
        </span>
      </div>

      {dayTasks.length === 0 ? (
        <p className="text-text-muted text-sm py-8 text-center">Nothing scheduled for this day.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(byGuild.entries()).map(([guildId, gTasks]) => {
            const guild = guilds.get(guildId);
            return (
              <div key={guildId}>
                <h4
                  className="text-sm font-medium mb-2"
                  style={{ color: guild?.color }}
                >
                  {guild?.name ?? "Unknown Guild"}
                </h4>
                {gTasks.map((task) => (
                  <TimeBlock
                    key={task.id}
                    task={task}
                    hours={task.daily_hours ?? 1}
                    guildColor={guild?.color}
                  />
                ))}
              </div>
            );
          })}

          {sideQuests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">Side Quests</h4>
              {sideQuests.map((task) => (
                <TimeBlock
                  key={task.id}
                  task={task}
                  hours={task.daily_hours ?? 1}
                  guildColor="#c9a84c"
                  guildName="Side Quest"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
