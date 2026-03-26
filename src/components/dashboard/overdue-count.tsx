"use client";

import { Task } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { Card, CardTitle } from "@/components/ui/card";

interface Props {
  tasks: Task[];
}

export function OverdueCount({ tasks }: Props) {
  const today = toDateString(new Date());
  const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done");
  const count = overdue.length;

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Overdue</CardTitle>
      <p
        className={`text-2xl font-bold ${count > 0 ? "text-hp-low" : "text-text-primary"}`}
      >
        {count}
      </p>
      <p className="text-xs text-text-muted">
        {count === 0 ? "All caught up" : `${count} task${count > 1 ? "s" : ""} past due`}
      </p>
    </Card>
  );
}
