-- Routines: recurring daily-ritual checklist items (separate from tasks)

create table if not exists public.routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  icon text not null default 'sun',
  color text not null default '#FFC857',
  recurrence_rule text,            -- JSON of RecurrenceRule; null => every day
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_logs (
  id uuid default gen_random_uuid() primary key,
  routine_id uuid references public.routines(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique(routine_id, date)
);

-- Row Level Security
alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;

-- Routines: users can only CRUD their own
create policy "Users can view own routines" on public.routines for select using (auth.uid() = user_id);
create policy "Users can insert own routines" on public.routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines" on public.routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines" on public.routines for delete using (auth.uid() = user_id);

-- Routine Logs: users can only CRUD their own
create policy "Users can view own routine logs" on public.routine_logs for select using (auth.uid() = user_id);
create policy "Users can insert own routine logs" on public.routine_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own routine logs" on public.routine_logs for update using (auth.uid() = user_id);
create policy "Users can delete own routine logs" on public.routine_logs for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_routines_user on public.routines(user_id);
create index if not exists idx_routine_logs_routine on public.routine_logs(routine_id);
create index if not exists idx_routine_logs_user_date on public.routine_logs(user_id, date);
