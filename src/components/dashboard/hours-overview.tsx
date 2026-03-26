"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
}

export function HoursOverview({ activeTasks, completedTasks }: Props) {
  const allTasks = [...activeTasks, ...completedTasks];
  const planned = allTasks.reduce((sum, t) => sum + (t.total_hours ?? t.daily_hours ?? 0), 0);
  const actual = allTasks.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0);
  const percent = planned > 0 ? Math.min(Math.round((actual / planned) * 100), 100) : 0;
  const isOver = actual > planned && planned > 0;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimatedPercent(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);

  return (
    <Card className="flex flex-col h-full bg-bg-card border-border/60 relative overflow-hidden group">
      <Clock size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Tracked Time
          </CardTitle>
        </div>

        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-4xl font-semibold text-text-primary tracking-tight">{actual}h</span>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">/ {planned}h</span>
        </div>

        <div className="mt-auto space-y-4">
          <div className="relative h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedPercent}%`,
                background: isOver ? "#f59e0b" : "#3b82f6",
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-tight">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-amber-500" : "bg-blue-500"}`} />
              {isOver ? "Over Budget" : `${percent}% Effort`}
            </span>
            <span>{planned - actual > 0 ? `${planned - actual}h Left` : "0h Left"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
