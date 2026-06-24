import { Routine, RoutineLog } from "./types";
import { parseRecurrenceRule, isRecurringOnDate } from "./recurrence";
import { toDateString } from "./date-utils";

// A routine with a null rule defaults to "every day".
function ruleFor(routine: Routine) {
  return parseRecurrenceRule(routine.recurrence_rule) ?? { frequency: "daily" as const };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Current streak: walk backwards over the routine's SCHEDULED days only, counting
// consecutive completed ones. An incomplete *today* does not break the streak (the
// day isn't over); the first earlier scheduled-but-missed day ends it.
export function getRoutineStreak(
  routine: Routine,
  completedDates: Set<string>,
  today: Date
): number {
  const rule = ruleFor(routine);
  const origin = new Date(routine.created_at);
  const todayStr = toDateString(today);

  let streak = 0;
  let cursor = new Date(today);

  // Cap the walk so a long-lived routine can't loop unbounded.
  for (let i = 0; i < 366; i++) {
    const dateStr = toDateString(cursor);
    if (dateStr < toDateString(origin)) break;

    if (isRecurringOnDate(rule, cursor, routine.created_at)) {
      if (completedDates.has(dateStr)) {
        streak++;
      } else if (dateStr !== todayStr) {
        break; // a past scheduled day was missed
      }
    }
    cursor = addDays(cursor, -1);
  }

  return streak;
}

// Consistency over a window: completions / scheduled-days-in-window (0..1).
export function getCompletionRate(
  routine: Routine,
  completedDates: Set<string>,
  from: string,
  to: string
): number {
  const rule = ruleFor(routine);
  let scheduled = 0;
  let done = 0;

  let cursor = new Date(from);
  const end = new Date(to);
  while (cursor <= end) {
    if (isRecurringOnDate(rule, cursor, routine.created_at)) {
      scheduled++;
      if (completedDates.has(toDateString(cursor))) done++;
    }
    cursor = addDays(cursor, 1);
  }

  return scheduled === 0 ? 0 : done / scheduled;
}

export interface DailyCompletionPoint {
  date: string;
  done: number;
  scheduled: number;
}

// For each day in [from, to]: how many routines were scheduled vs. completed.
// Drives the overall completion-trend chart.
export function getDailyCompletionSeries(
  routines: Routine[],
  logs: RoutineLog[],
  from: string,
  to: string
): DailyCompletionPoint[] {
  // Set of "routineId|date" for O(1) completion lookups.
  const completed = new Set(logs.map((l) => `${l.routine_id}|${l.date}`));

  const series: DailyCompletionPoint[] = [];
  let cursor = new Date(from);
  const end = new Date(to);

  while (cursor <= end) {
    const dateStr = toDateString(cursor);
    let scheduled = 0;
    let done = 0;

    for (const routine of routines) {
      if (isRecurringOnDate(ruleFor(routine), cursor, routine.created_at)) {
        scheduled++;
        if (completed.has(`${routine.id}|${dateStr}`)) done++;
      }
    }

    series.push({ date: dateStr, done, scheduled });
    cursor = addDays(cursor, 1);
  }

  return series;
}
