"use client";

import { useMemo } from "react";
import { Routine, RoutineLog } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/sparkline";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toDateString } from "@/lib/date-utils";
import { parseRecurrenceRule, isRecurringOnDate } from "@/lib/recurrence";
import {
  getRoutineStreak,
  getCompletionRate,
  getDailyCompletionSeries,
} from "@/lib/routine-stats";

interface RoutineOverviewProps {
  routines: Routine[];
  logs: RoutineLog[];
  counts: Record<string, number>;
  today: Date;
  from: string;
}

function ruleFor(routine: Routine) {
  return parseRecurrenceRule(routine.recurrence_rule) ?? { frequency: "daily" as const };
}

export function RoutineOverview({ routines, logs, counts, today, from }: RoutineOverviewProps) {
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

  // The list of day-strings in the window (oldest → newest), for the heatmaps.
  const days = useMemo(() => {
    const arr: string[] = [];
    const cursor = new Date(from);
    while (toDateString(cursor) <= to) {
      arr.push(toDateString(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return arr;
  }, [from, to]);

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

  // Daily completion trend: routines completed each day across the window.
  const series = useMemo(
    () => getDailyCompletionSeries(routines, logs, from, to),
    [routines, logs, from, to]
  );
  const trendData = series.map((p) => p.done);

  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-[family-name:var(--font-heading)] font-bold m-0"
        style={{ fontSize: 20, letterSpacing: "-0.02em" }}
      >
        Your momentum
      </h2>

      {/* Summary stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3">
          <CircularProgress
            value={stats.doneToday}
            max={Math.max(stats.todaysCount, 1)}
            size={56}
            strokeWidth={5}
            color="var(--color-sun)"
            label={`${stats.doneToday}/${stats.todaysCount}`}
          />
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider">Today</div>
            <div className="text-sm font-semibold">Done so far</div>
          </div>
        </Card>

        <StatCard
          icon="trophy"
          color="var(--color-gold)"
          value={`${stats.consistency}%`}
          label="30-day consistency"
        />
        <StatCard
          icon="flame"
          color="var(--color-sun)"
          value={String(stats.bestStreak)}
          label={`Best streak (day${stats.bestStreak === 1 ? "" : "s"})`}
        />
        <StatCard
          icon="check"
          color="var(--color-hp-high)"
          value={String(stats.totalCheckoffs)}
          label="Total check-offs"
        />
      </div>

      {/* Overall completion trend */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Completion trend</div>
            <div className="text-xs text-text-muted">Routines completed each day · last 30 days</div>
          </div>
        </div>
        <Sparkline data={trendData} color="var(--color-sun)" width={520} height={48} className="w-full" />
      </Card>

      {/* Per-habit history */}
      <Card flush className="overflow-hidden">
        <div className="divide-y divide-border">
          {routines.map((routine) => {
            const set = completedByRoutine.get(routine.id) ?? new Set<string>();
            const streak = getRoutineStreak(routine, set, today);
            const windowCount = set.size;
            const allTime = counts[routine.id] ?? 0;
            const rule = ruleFor(routine);

            return (
              <div key={routine.id} className="flex items-center gap-3 p-3 flex-wrap">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${routine.color}22` }}
                >
                  <Icon name={routine.icon} size={16} color={routine.color} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{routine.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-sun-2">
                        <Icon name="flame" size={11} color="var(--color-sun)" /> {streak}d
                      </span>
                    )}
                    <span>{windowCount} this month</span>
                    <span aria-hidden>·</span>
                    <span>{allTime} all-time</span>
                  </div>
                </div>

                {/* 30-day heatmap strip */}
                <div className="flex gap-[3px] flex-shrink-0">
                  {days.map((d) => {
                    const scheduled = isRecurringOnDate(rule, new Date(d), routine.created_at);
                    const done = set.has(d);
                    return (
                      <span
                        key={d}
                        title={d}
                        className="w-2 h-5 rounded-sm"
                        style={{
                          backgroundColor: done
                            ? routine.color
                            : scheduled
                              ? "var(--color-bg-primary)"
                              : "transparent",
                          boxShadow:
                            !done && scheduled
                              ? "0 0 0 1px var(--color-border) inset"
                              : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
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
    <Card className="flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}1f` }}
      >
        <Icon name={icon} size={20} color={color} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold font-[family-name:var(--font-heading)] leading-none">
          {value}
        </div>
        <div className="text-xs text-text-muted mt-1 truncate">{label}</div>
      </div>
    </Card>
  );
}
