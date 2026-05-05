"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
}

export function WeeklyCompletion({ activeTasks, completedTasks }: Props) {
  const total = activeTasks.length + completedTasks.length;
  const done = completedTasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimatedPercent(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);

  return (
    <Card className="flex flex-col h-full bg-bg-card border-border/60 relative overflow-hidden group">
      <CircleCheck size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Task Completion
          </CardTitle>
        </div>

        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-4xl font-semibold text-text-primary tracking-tight">{percent}%</span>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Done</span>
        </div>

        <div className="mt-auto space-y-4">
          <div className="relative h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedPercent}%`,
                background: "var(--color-gold)",
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-tight">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {done} Completed
            </span>
            <span>{total} Total</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
