"use client";

import { Task, Guild } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";

interface TodayPlanProps {
  tasks: Task[];
  guilds: Map<string, Guild>;
}

function isTaskForToday(task: Task, today: string): boolean {
  if (!task.start_date && !task.due_date) return false;
  const start = task.start_date ?? task.due_date!;
  const end = task.due_date ?? start;
  return today >= start && today <= end;
}

export function TodayPlan({ tasks, guilds }: TodayPlanProps) {
  const today = toDateString(new Date());
  const todayTasks = tasks.filter((t) => t.status !== "done" && isTaskForToday(t, today));
  const totalHours = todayTasks.reduce((sum, t) => sum + (t.daily_hours ?? 1), 0);

  if (todayTasks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-text-muted text-sm">Nothing scheduled for today.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-muted">{todayTasks.length} tasks</span>
        <span className="text-xs text-text-muted">{totalHours}h planned</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {todayTasks.slice(0, 8).map((task) => {
          const guild = task.guild_id ? guilds.get(task.guild_id) : null;
          return (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-primary border border-border text-sm"
            >
              {guild && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: guild.color }}
                />
              )}
              <span className="truncate flex-1">{task.title}</span>
              <Badge variant={task.priority} className="flex-shrink-0">
                {task.priority}
              </Badge>
              {task.daily_hours && (
                <span className="text-xs text-text-muted flex-shrink-0">
                  {task.daily_hours}h
                </span>
              )}
            </div>
          );
        })}
        {todayTasks.length > 8 && (
          <p className="text-xs text-text-muted text-center">
            +{todayTasks.length - 8} more
          </p>
        )}
      </div>
    </div>
  );
}
