"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Routine, RoutineLog } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toDateString } from "@/lib/date-utils";
import { parseRecurrenceRule, isRecurringOnDate } from "@/lib/recurrence";
import { getRoutineStreak, getCompletionRate } from "@/lib/routine-stats";

interface RoutineMomentumProps {
  routines: Routine[];
  logs: RoutineLog[];
  counts: Record<string, number>;
  today: Date;
  from: string;
}

function ruleFor(routine: Routine) {
  return parseRecurrenceRule(routine.recurrence_rule) ?? { frequency: "daily" as const };
}

export function RoutineMomentum({ routines, logs, counts, today, from }: RoutineMomentumProps) {
  const to = toDateString(today);

  const completedByRoutine = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of logs) {
      let set = m.get(l.routine_id);
      if (!set) {
        set = new Set();
        m.set(l.routine_id, set);
      }
      set.add(l.date);
    }
    return m;
  }, [logs]);

  const stats = useMemo(() => {
    const todays = routines.filter((r) => isRecurringOnDate(ruleFor(r), today, r.created_at));
    const doneToday = todays.filter((r) => completedByRoutine.get(r.id)?.has(to)).length;

    const rates = routines.map((r) =>
      getCompletionRate(r, completedByRoutine.get(r.id) ?? new Set(), from, to)
    );
    const consistency = rates.length
      ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
      : 0;

    const bestStreak = routines.reduce(
      (max, r) => Math.max(max, getRoutineStreak(r, completedByRoutine.get(r.id) ?? new Set(), today)),
      0
    );

    const totalCheckoffs = Object.values(counts).reduce((a, b) => a + b, 0);

    return { todaysCount: todays.length, doneToday, consistency, bestStreak, totalCheckoffs };
  }, [routines, completedByRoutine, counts, today, to, from]);

  return (
    <section className="card-surface p-5 flex items-center gap-5 flex-wrap">
      <div className="flex items-center gap-3 flex-shrink-0">
        <CircularProgress
          value={stats.doneToday}
          max={Math.max(stats.todaysCount, 1)}
          size={56}
          strokeWidth={5}
          color="var(--color-sun)"
          label={`${stats.doneToday}/${stats.todaysCount}`}
        />
        <div>
          <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-[.15em]">
            Routine momentum
          </div>
          <div className="text-sm font-semibold">Done today</div>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap flex-1">
        <Stat
          icon="flame"
          color="var(--color-sun)"
          value={String(stats.bestStreak)}
          label={`Best streak (day${stats.bestStreak === 1 ? "" : "s"})`}
        />
        <Stat
          icon="trophy"
          color="var(--color-gold)"
          value={`${stats.consistency}%`}
          label="30-day consistency"
        />
        <Stat
          icon="check"
          color="var(--color-hp-high)"
          value={String(stats.totalCheckoffs)}
          label="Total check-offs"
        />
      </div>

      <Link
        href="/routines"
        className="btn btn-ghost text-xs px-3 py-1.5 flex-shrink-0"
      >
        View all <Icon name="arrow-right" size={12} />
      </Link>
    </section>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: string;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}1f` }}
      >
        <Icon name={icon} size={17} color={color} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold font-[family-name:var(--font-heading)] leading-none">
          {value}
        </div>
        <div className="text-[11px] text-text-muted mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}
