export interface TaskAllocation {
  taskId: string;
  date: string;
  plannedHours: number;
}

export function distributeTask(
  taskId: string,
  startDate: string,
  totalHours: number,
  dailyHours: number,
  dueDate?: string
): TaskAllocation[] {
  const allocations: TaskAllocation[] = [];
  let remaining = totalHours;
  const current = new Date(startDate);
  const end = dueDate ? new Date(dueDate) : null;

  while (remaining > 0) {
    if (end && current > end) break;

    const hours = Math.min(dailyHours, remaining);
    allocations.push({
      taskId,
      date: current.toISOString().split("T")[0],
      plannedHours: hours,
    });

    remaining -= hours;
    current.setDate(current.getDate() + 1);
  }

  return allocations;
}

export function getDayTotalHours(
  allocations: TaskAllocation[],
  date: string
): number {
  return allocations
    .filter((a) => a.date === date)
    .reduce((sum, a) => sum + a.plannedHours, 0);
}

export function isOvercommitted(
  allocations: TaskAllocation[],
  date: string,
  threshold = 10
): boolean {
  return getDayTotalHours(allocations, date) > threshold;
}
