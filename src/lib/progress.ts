import { Task } from "./types";

export function getTaskProgress(task: Task): number | null {
  if (!task.total_hours || task.total_hours <= 0) return null;
  const actual = task.actual_hours ?? 0;
  return Math.min(actual / task.total_hours, 1);
}

export function getProgressPercent(task: Task): number | null {
  const progress = getTaskProgress(task);
  if (progress === null) return null;
  return Math.round(progress * 100);
}
