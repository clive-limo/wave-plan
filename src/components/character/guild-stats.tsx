"use client";

import { Guild, Task } from "@/lib/types";

interface GuildStatsProps {
  guilds: Guild[];
  tasks: Task[];
}

export function GuildStats({ guilds, tasks }: GuildStatsProps) {
  if (guilds.length === 0) {
    return <p className="text-text-muted text-sm text-center py-4">No guilds yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {guilds.map((guild) => {
        const guildTasks = tasks.filter((t) => t.guild_id === guild.id);
        const done = guildTasks.filter((t) => t.status === "done");
        const totalXp = done.reduce((sum, t) => sum + (t.xp_awarded ?? 0), 0);
        const totalHours = done.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0);

        return (
          <div
            key={guild.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-primary border border-border"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: guild.color }}
            />
            <span className="flex-1 text-sm font-medium" style={{ color: guild.color }}>
              {guild.name}
            </span>
            <div className="flex gap-4 text-xs text-text-muted">
              <span>{done.length} done</span>
              <span>{totalHours}h</span>
              <span className="text-gold">{totalXp} XP</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
