export type Priority = "urgent" | "normal" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";
export type Mood = "stressed" | "drained" | "neutral" | "motivated" | "energized";
export type QuestCategory = "fun" | "learning" | "errands" | "health" | "other";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_shields_remaining: number;
  last_streak_check_date: string | null;
  created_at: string;
}

export interface Guild {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "weekdays" | "custom";
  days?: number[];
  interval?: number;
  unit?: "day" | "week";
  end_date?: string;
}

export interface Task {
  id: string;
  user_id: string;
  guild_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  category: QuestCategory | null;
  start_date: string | null;
  due_date: string | null;
  total_hours: number | null;
  daily_hours: number | null;
  actual_hours: number | null;
  xp_awarded: number | null;
  completed_at: string | null;
  created_at: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  energy: number;
  mood: Mood;
  sleep_quality: number;
  created_at: string;
}

export interface DailyHours {
  id: string;
  checkin_id: string;
  guild_id: string;
  hours: number;
}

export interface TaskDayLog {
  id: string;
  task_id: string;
  user_id: string;
  date: string;
  planned_hours: number;
  actual_hours: number;
  completed: boolean;
  notes: string | null;
  scheduled_hour: number | null;
}

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  color: string;
  recurrence_rule: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}
