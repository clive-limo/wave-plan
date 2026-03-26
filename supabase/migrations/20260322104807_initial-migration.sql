-- Wave Plan Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  avatar_url text,
  total_xp int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Guilds
create table if not exists public.guilds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text not null default '#5b8def',
  icon text not null default 'briefcase',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks
create type task_priority as enum ('urgent', 'normal', 'low');
create type task_status as enum ('todo', 'in_progress', 'done');

create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  guild_id uuid references public.guilds(id) on delete cascade,
  title text not null,
  description text,
  priority task_priority not null default 'normal',
  status task_status not null default 'todo',
  category text,
  start_date date,
  due_date date,
  total_hours float,
  daily_hours float,
  actual_hours float,
  xp_awarded int,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Task Day Logs (for planner time tracking)
create table if not exists public.task_day_logs (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  planned_hours float not null default 0,
  actual_hours float not null default 0,
  completed boolean not null default false,
  notes text,
  unique(task_id, date)
);

-- Daily Check-ins
create table if not exists public.daily_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  energy int not null check (energy between 1 and 5),
  mood text not null,
  sleep_quality int not null check (sleep_quality between 1 and 5),
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Daily Hours (per guild, part of check-in)
create table if not exists public.daily_hours (
  id uuid default gen_random_uuid() primary key,
  checkin_id uuid references public.daily_checkins(id) on delete cascade not null,
  guild_id uuid references public.guilds(id) on delete cascade not null,
  hours float not null default 0
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.guilds enable row level security;
alter table public.tasks enable row level security;
alter table public.task_day_logs enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.daily_hours enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Guilds: users can only CRUD their own
create policy "Users can view own guilds" on public.guilds for select using (auth.uid() = user_id);
create policy "Users can insert own guilds" on public.guilds for insert with check (auth.uid() = user_id);
create policy "Users can update own guilds" on public.guilds for update using (auth.uid() = user_id);
create policy "Users can delete own guilds" on public.guilds for delete using (auth.uid() = user_id);

-- Tasks: users can only CRUD their own
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Task Day Logs
create policy "Users can view own day logs" on public.task_day_logs for select using (auth.uid() = user_id);
create policy "Users can insert own day logs" on public.task_day_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own day logs" on public.task_day_logs for update using (auth.uid() = user_id);
create policy "Users can delete own day logs" on public.task_day_logs for delete using (auth.uid() = user_id);

-- Daily Check-ins
create policy "Users can view own checkins" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.daily_checkins for update using (auth.uid() = user_id);

-- Daily Hours
create policy "Users can view own daily hours" on public.daily_hours for select
  using (exists (select 1 from public.daily_checkins c where c.id = checkin_id and c.user_id = auth.uid()));
create policy "Users can insert own daily hours" on public.daily_hours for insert
  with check (exists (select 1 from public.daily_checkins c where c.id = checkin_id and c.user_id = auth.uid()));

-- Indexes
create index if not exists idx_guilds_user on public.guilds(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_guild on public.tasks(guild_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_task_day_logs_task on public.task_day_logs(task_id);
create index if not exists idx_task_day_logs_date on public.task_day_logs(date);
create index if not exists idx_checkins_user_date on public.daily_checkins(user_id, date);
