"use client";

import { useState, useEffect } from "react";
import { Task, Guild } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
  guilds: Map<string, Guild>;
}

export function GuildWorkload({ activeTasks, completedTasks, guilds }: Props) {
  const allTasks = [...activeTasks, ...completedTasks];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

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

  const totalHours = Array.from(guildHours.values()).reduce((sum, h) => sum + h, 0);

  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  return (
    <Card className="flex flex-col h-full bg-bg-card border-border/60 relative overflow-hidden group">
      <PieChart size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Guild Workload
          </CardTitle>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
             <p className="text-[10px] font-bold uppercase tracking-widest">No Guild Data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center flex-1">
            {/* Semi-circular Gauge */}
            <div className="flex items-center justify-center w-full mb-4 mt-2">
              <div className="relative" style={{ width: size, height: size / 2 + 5 }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                  {/* Background track */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-bg-primary)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    transform={`rotate(180 ${size / 2} ${size / 2})`}
                  />

                  {/* Segments */}
                  {(() => {
                    let currentAccumulated = 0;
                    return entries.map((entry, i) => {
                      const percent = entry.hours / totalHours;
                      const targetOffset = circumference * (1 - percent);
                      const rotation = 180 + (currentAccumulated * 180);
                      currentAccumulated += percent;

                      return (
                        <circle
                          key={entry.guild!.id}
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          fill="none"
                          stroke={entry.guild!.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${circumference} ${circumference}`}
                          strokeDashoffset={mounted ? targetOffset : circumference}
                          strokeLinecap={entries.length === 1 ? "round" : (i === 0 ? "round" : (i === entries.length - 1 ? "round" : "butt"))}
                          className="transition-all duration-1000 ease-out"
                          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Value display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <span className="text-2xl font-bold tracking-tight text-text-primary leading-none">{totalHours}h</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Total</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full mt-auto pt-4">
              {entries.slice(0, 4).map((entry) => (
                <div key={entry.guild!.id} className="flex items-center gap-2 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.guild!.color }} />
                  <span className="text-[10px] font-bold text-text-secondary truncate uppercase tracking-tight">{entry.guild!.name}</span>
                  <span className="text-[10px] text-text-muted ml-auto font-mono font-bold">
                    {Math.round((entry.hours / totalHours) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
