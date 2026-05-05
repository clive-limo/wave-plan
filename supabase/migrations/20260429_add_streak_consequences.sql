-- Streak consequences: shields and idempotent break check
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_shields_remaining int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_check_date date;
