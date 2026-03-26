"use client";

import { Task, Guild } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
  guilds: Map<string, Guild>;
}

export function GuildWorkload({ activeTasks, completedTasks, guilds }: Props) {
  const allTasks = [...activeTasks, ...completedTasks];

  const guildHours = new Map<string, number>();
  for (const task of allTasks) {
    if (!task.guild_id) continue;
    const hours = task.total_hours ?? task.daily_hours ?? 1;
    guildHours.set(task.guild_id, (guildHours.get(task.guild_id) ?? 0) + hours);
  }

  const entries = Array.from(guildHours.entries())
    .map(([id, hours]) => ({ guild: guilds.get(id), hours }))
    .filter((e) => e.guild)
    .sort((a, b) => b.hours - a.hours);

  const maxHours = entries[0]?.hours ?? 1;

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Guild Workload</CardTitle>
      {entries.length === 0 ? (
        <p className="text-xs text-text-muted">No guild tasks in this period</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(({ guild, hours }) => (
            <div key={guild!.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: guild!.color }}
                  />
                  <span className="text-text-secondary truncate">{guild!.name}</span>
                </div>
                <span className="text-text-muted">{hours}h</span>
              </div>
              <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(hours / maxHours) * 100}%`,
                    backgroundColor: guild!.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
