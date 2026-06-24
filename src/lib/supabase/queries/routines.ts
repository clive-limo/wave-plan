import { SupabaseClient } from "@supabase/supabase-js";
import { Routine, RoutineLog } from "@/lib/types";

export async function getRoutines(supabase: SupabaseClient): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createRoutine(
  supabase: SupabaseClient,
  routine: {
    title: string;
    icon?: string;
    color?: string;
    recurrence_rule?: string;
    sort_order?: number;
  }
): Promise<Routine> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("routines")
    .insert({
      user_id: user.user.id,
      title: routine.title,
      icon: routine.icon ?? "sun",
      color: routine.color ?? "#FFC857",
      recurrence_rule: routine.recurrence_rule ?? null,
      sort_order: routine.sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Routine;
}

export async function updateRoutine(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<
    Pick<Routine, "title" | "icon" | "color" | "recurrence_rule" | "sort_order" | "is_active">
  >
): Promise<Routine> {
  const { data, error } = await supabase
    .from("routines")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Routine;
}

// Soft delete by default to preserve routine_logs history for the overview charts.
export async function deleteRoutine(supabase: SupabaseClient, id: string): Promise<Routine> {
  return updateRoutine(supabase, id, { is_active: false });
}

// Hard delete (cascades routine_logs). Use when the user wants the history gone too.
export async function hardDeleteRoutine(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) throw error;
}

export async function getRoutineLogs(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<RoutineLog[]> {
  const { data, error } = await supabase
    .from("routine_logs")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;
  return data ?? [];
}

// All-time completion tally per routine, for the "X total" stat.
export async function getRoutineCompletionCounts(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("routine_logs").select("routine_id");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { routine_id: string }).routine_id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

// Check off (completed=true → upsert) or undo (completed=false → delete the row).
export async function setRoutineCompletion(
  supabase: SupabaseClient,
  routineId: string,
  date: string,
  completed: boolean
): Promise<RoutineLog | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  if (!completed) {
    const { error } = await supabase
      .from("routine_logs")
      .delete()
      .eq("routine_id", routineId)
      .eq("date", date);
    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from("routine_logs")
    .upsert(
      {
        routine_id: routineId,
        user_id: user.user.id,
        date,
        completed: true,
      },
      { onConflict: "routine_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as RoutineLog;
}
