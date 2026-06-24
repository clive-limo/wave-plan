"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getRoutines,
  getRoutineLogs,
  getRoutineCompletionCounts,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  setRoutineCompletion,
} from "@/lib/supabase/queries/routines";
import { Routine, RoutineLog } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { parseRecurrenceRule, isRecurringOnDate } from "@/lib/recurrence";
import { Modal } from "@/components/ui/modal";
import { Sticker } from "@/components/ui/sticker";
import { Icon } from "@/components/ui/icon";
import { SkeletonCard } from "@/components/ui/skeleton";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineForm, RoutineFormData } from "@/components/routines/routine-form";
import { RoutineOverview } from "@/components/routines/routine-overview";
import { useCelebration } from "@/contexts/celebration-context";

const ROUTINE_XP = 25;
const HISTORY_DAYS = 30;

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

  const { celebrate } = useCelebration();

  const today = useMemo(() => new Date(), []);
  const todayStr = toDateString(today);
  const from = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - (HISTORY_DAYS - 1));
    return toDateString(d);
  }, [today]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [routineList, logList, countMap] = await Promise.all([
        getRoutines(supabase),
        getRoutineLogs(supabase, from, todayStr),
        getRoutineCompletionCounts(supabase),
      ]);
      setRoutines(routineList);
      setLogs(logList);
      setCounts(countMap);
      setLoading(false);
    })();
  }, [from, todayStr]);

  const completedToday = useMemo(
    () => new Set(logs.filter((l) => l.date === todayStr).map((l) => l.routine_id)),
    [logs, todayStr]
  );

  const todaysRoutines = useMemo(
    () =>
      routines.filter((r) =>
        isRecurringOnDate(
          parseRecurrenceRule(r.recurrence_rule) ?? { frequency: "daily" },
          today,
          r.created_at
        )
      ),
    [routines, today]
  );

  async function handleToggle(
    id: string,
    done: boolean,
    position?: { x: number; y: number }
  ) {
    // Optimistic update of the per-day logs (drives both checklist + overview).
    setLogs((prev) => {
      if (done) {
        if (prev.some((l) => l.routine_id === id && l.date === todayStr)) return prev;
        return [
          ...prev,
          {
            id: `optimistic-${id}-${todayStr}`,
            routine_id: id,
            user_id: "",
            date: todayStr,
            completed: true,
            created_at: "",
          },
        ];
      }
      return prev.filter((l) => !(l.routine_id === id && l.date === todayStr));
    });
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + (done ? 1 : -1)) }));

    const supabase = createClient();
    try {
      await setRoutineCompletion(supabase, id, todayStr, done);
    } catch {
      return; // leave optimistic UI; a reload will reconcile
    }

    // XP + streak + confetti on completion only (undo is XP-neutral).
    if (done) {
      await celebrate({ xp: ROUTINE_XP, priority: "low", position });
    }
  }

  async function handleSubmit(data: RoutineFormData) {
    const supabase = createClient();
    if (editing) {
      const updated = await updateRoutine(supabase, editing.id, {
        title: data.title,
        icon: data.icon,
        color: data.color,
        recurrence_rule: data.recurrence_rule,
      });
      setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
    } else {
      const routine = await createRoutine(supabase, {
        title: data.title,
        icon: data.icon,
        color: data.color,
        recurrence_rule: data.recurrence_rule,
        sort_order: routines.length,
      });
      setRoutines((prev) => [...prev, routine]);
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await deleteRoutine(supabase, id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const doneCount = todaysRoutines.filter((r) => completedToday.has(r.id)).length;

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1
            className="font-[family-name:var(--font-heading)] font-bold m-0"
            style={{ fontSize: 32, letterSpacing: "-0.02em" }}
          >
            Routines
          </h1>
          <p className="text-text-secondary mt-1.5 m-0">
            Set it once, check it off daily. Small rituals, big momentum.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Icon name="plus" size={14} /> New routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="card-surface flex flex-col items-center text-center p-10 gap-4">
          <Sticker shape="cloud" color="#FFC857" size={80} expression="happy" />
          <div>
            <p className="text-base font-semibold m-0">No routines yet.</p>
            <p className="text-sm text-text-secondary mt-1">
              Add a daily ritual — meditate, read, move. Then keep the streak alive.
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Create your first routine
          </button>
        </div>
      ) : (
        <>
          {/* Today's checklist */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2
                className="font-[family-name:var(--font-heading)] font-bold m-0"
                style={{ fontSize: 20, letterSpacing: "-0.02em" }}
              >
                Today
              </h2>
              <span className="text-sm text-text-muted tabular-nums">
                {doneCount} of {todaysRoutines.length} done
              </span>
            </div>

            {todaysRoutines.length === 0 ? (
              <div className="card-surface text-center p-6 text-sm text-text-secondary">
                Nothing scheduled today. Enjoy the breather. 🌊
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {todaysRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    done={completedToday.has(routine.id)}
                    onToggle={handleToggle}
                    onEdit={(r) => setEditing(r)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Analytics / momentum */}
          <RoutineOverview
            routines={routines}
            logs={logs}
            counts={counts}
            today={today}
            from={from}
          />
        </>
      )}

      <Modal
        open={showForm || editing !== null}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit routine" : "New routine"}
      >
        <RoutineForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          initial={
            editing
              ? {
                  title: editing.title,
                  icon: editing.icon,
                  color: editing.color,
                  recurrence_rule: editing.recurrence_rule ?? undefined,
                }
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
