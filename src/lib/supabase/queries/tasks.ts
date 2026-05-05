import { SupabaseClient } from "@supabase/supabase-js";
import { Task, Priority, TaskStatus, QuestCategory } from "@/lib/types";

export async function getTasksByGuild(
  supabase: SupabaseClient,
  guildId: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSideQuests(supabase: SupabaseClient): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .is("guild_id", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveTasks(supabase: SupabaseClient): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .neq("status", "done")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(
  supabase: SupabaseClient,
  task: {
    guild_id?: string | null;
    title: string;
    description?: string;
    priority: Priority;
    category?: QuestCategory;
    start_date?: string;
    due_date?: string;
    total_hours?: number;
    daily_hours?: number;
    is_recurring?: boolean;
    recurrence_rule?: string;
  }
): Promise<Task> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.user.id,
      guild_id: task.guild_id ?? null,
      title: task.title,
      description: task.description ?? null,
      priority: task.priority,
      status: "todo" as TaskStatus,
      category: task.category ?? null,
      start_date: task.is_recurring ? null : (task.start_date ?? null),
      due_date: task.is_recurring ? null : (task.due_date ?? null),
      total_hours: task.is_recurring ? null : (task.total_hours ?? null),
      daily_hours: task.daily_hours ?? null,
      is_recurring: task.is_recurring ?? false,
      recurrence_rule: task.recurrence_rule ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<Task, "title" | "description" | "priority" | "status" | "due_date" | "start_date" | "total_hours" | "daily_hours" | "actual_hours" | "xp_awarded" | "completed_at" | "is_recurring" | "recurrence_rule" | "guild_id">>
) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function getCompletedTasksInRange(
  supabase: SupabaseClient,
  from: string,
  to: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "done")
    .gte("completed_at", from)
    .lte("completed_at", to)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function deleteTask(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
