import { SupabaseClient } from "@supabase/supabase-js";
import { Task, TaskDayLog } from "@/lib/types";

export async function getTasksForDateRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .neq("status", "done")
    .or(`start_date.lte.${endDate},start_date.is.null`)
    .or(`due_date.gte.${startDate},due_date.is.null`)
    .order("priority", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getDayLogs(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<TaskDayLog[]> {
  const { data, error } = await supabase
    .from("task_day_logs")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;
  return data ?? [];
}

export async function upsertDayLog(
  supabase: SupabaseClient,
  log: {
    task_id: string;
    date: string;
    planned_hours: number;
    actual_hours?: number;
    completed?: boolean;
    notes?: string;
    scheduled_hour?: number | null;
  }
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("task_day_logs")
    .upsert(
      {
        task_id: log.task_id,
        user_id: user.user.id,
        date: log.date,
        planned_hours: log.planned_hours,
        actual_hours: log.actual_hours ?? 0,
        completed: log.completed ?? false,
        notes: log.notes ?? null,
        scheduled_hour: log.scheduled_hour ?? null,
      },
      { onConflict: "task_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TaskDayLog;
}

export async function updateDayLogHour(
  supabase: SupabaseClient,
  taskId: string,
  date: string,
  scheduledHour: number,
  dailyHours: number
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("task_day_logs")
    .upsert(
      {
        task_id: taskId,
        user_id: user.user.id,
        date,
        planned_hours: dailyHours,
        scheduled_hour: scheduledHour,
        actual_hours: 0,
        completed: false,
      },
      { onConflict: "task_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TaskDayLog;
}

export async function completeDayLog(
  supabase: SupabaseClient,
  taskId: string,
  date: string,
  hoursCompleted: number
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("task_day_logs")
    .upsert(
      {
        task_id: taskId,
        user_id: user.user.id,
        date,
        planned_hours: hoursCompleted,
        actual_hours: hoursCompleted,
        completed: true,
      },
      { onConflict: "task_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TaskDayLog;
}
