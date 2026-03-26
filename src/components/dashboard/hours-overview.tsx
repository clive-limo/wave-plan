"use client";

import { Task } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
}

export function HoursOverview({ activeTasks, completedTasks }: Props) {
  const allTasks = [...activeTasks, ...completedTasks];
  const planned = allTasks.reduce((sum, t) => sum + (t.total_hours ?? t.daily_hours ?? 0), 0);
  const actual = allTasks.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0);

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Hours</CardTitle>
      <p className="text-2xl font-bold text-text-primary">
        {actual}h <span className="text-sm font-normal text-text-muted">/ {planned}h</span>
      </p>
      <ProgressBar
        value={actual}
        max={planned || 1}
        color={actual > planned ? "var(--color-hp-low)" : "var(--color-gold)"}
      />
      <p className="text-xs text-text-muted">actual vs planned</p>
    </Card>
  );
}
