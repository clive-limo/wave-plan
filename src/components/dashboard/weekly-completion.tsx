"use client";

import { Task } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

interface Props {
  activeTasks: Task[];
  completedTasks: Task[];
}

export function WeeklyCompletion({ activeTasks, completedTasks }: Props) {
  const total = activeTasks.length + completedTasks.length;
  const done = completedTasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Completion</CardTitle>
      <p className="text-2xl font-bold text-text-primary">{percent}%</p>
      <ProgressBar value={done} max={total || 1} color="var(--color-gold)" />
      <p className="text-xs text-text-muted">
        {done} of {total} tasks done
      </p>
    </Card>
  );
}
