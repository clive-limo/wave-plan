-- Add scheduled_hour to task_day_logs for time-slot placement
ALTER TABLE public.task_day_logs ADD COLUMN IF NOT EXISTS scheduled_hour float;
