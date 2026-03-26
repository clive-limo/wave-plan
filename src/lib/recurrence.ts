import { RecurrenceRule, Task } from "./types";
import { toDateString } from "./date-utils";

export function parseRecurrenceRule(json: string | null): RecurrenceRule | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as RecurrenceRule;
  } catch {
    return null;
  }
}

export function isRecurringOnDate(
  rule: RecurrenceRule,
  date: Date,
  taskCreatedAt?: string
): boolean {
  // Check end date
  if (rule.end_date && toDateString(date) > rule.end_date) {
    return false;
  }

  switch (rule.frequency) {
    case "daily":
      return true;

    case "weekdays": {
      const day = date.getDay();
      return day >= 1 && day <= 5;
    }

    case "weekly": {
      if (!rule.days || rule.days.length === 0) return false;
      return rule.days.includes(date.getDay());
    }

    case "custom": {
      if (!rule.interval || !rule.unit || !taskCreatedAt) return false;
      const origin = new Date(taskCreatedAt);
      const diffMs = date.getTime() - origin.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (rule.unit === "day") {
        return diffDays >= 0 && diffDays % rule.interval === 0;
      }
      if (rule.unit === "week") {
        const diffWeeks = Math.floor(diffDays / 7);
        return diffDays >= 0 && diffWeeks % rule.interval === 0 && date.getDay() === origin.getDay();
      }
      return false;
    }

    default:
      return false;
  }
}

export function expandRecurringTasks(
  tasks: Task[],
  startDate: string,
  endDate: string
): Task[] {
  const result: Task[] = [];

  for (const task of tasks) {
    if (!task.is_recurring || !task.recurrence_rule) {
      result.push(task);
      continue;
    }

    const rule = parseRecurrenceRule(task.recurrence_rule);
    if (!rule) {
      result.push(task);
      continue;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      if (isRecurringOnDate(rule, current, task.created_at)) {
        const dateStr = toDateString(current);
        result.push({
          ...task,
          id: `${task.id}__${dateStr}`,
          start_date: dateStr,
          due_date: dateStr,
          total_hours: task.daily_hours,
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return result;
}

export function getRecurrenceLabel(rule: RecurrenceRule): string {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  switch (rule.frequency) {
    case "daily":
      return "Every day";
    case "weekdays":
      return "Weekdays";
    case "weekly":
      if (rule.days && rule.days.length > 0) {
        return `Every ${rule.days.map((d) => DAY_NAMES[d]).join(", ")}`;
      }
      return "Weekly";
    case "custom":
      if (rule.interval && rule.unit) {
        return `Every ${rule.interval} ${rule.unit}${rule.interval > 1 ? "s" : ""}`;
      }
      return "Custom";
    default:
      return "Repeating";
  }
}
