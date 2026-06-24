"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getActiveTasks, getCompletedTasksInRange } from "@/lib/supabase/queries/tasks";
import { getTodayCheckin, getRecentCheckins, createCheckin } from "@/lib/supabase/queries/checkins";
import {
  getRoutines,
  getRoutineLogs,
  getRoutineCompletionCounts,
  setRoutineCompletion,
} from "@/lib/supabase/queries/routines";
import { parseRecurrenceRule, isRecurringOnDate } from "@/lib/recurrence";
import { calculateHp, getHpColor, getHpLabel } from "@/lib/hp";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { getPeriodRange, StatPeriod, toDateString } from "@/lib/date-utils";
import { Guild, Task, Profile, DailyCheckin, Mood, Routine, RoutineLog } from "@/lib/types";
import { useCelebration } from "@/contexts/celebration-context";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineMomentum } from "@/components/dashboard/routine-momentum";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { EnergySparkline } from "@/components/dashboard/energy-sparkline";
import { WeeklyCompletion } from "@/components/dashboard/weekly-completion";
import { HoursOverview } from "@/components/dashboard/hours-overview";
import { OverdueCount } from "@/components/dashboard/overdue-count";
import { GuildWorkload } from "@/components/dashboard/guild-workload";
import { DailyCheckinModal } from "@/components/checkin/daily-checkin-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, FeatureCard, FeatureGrid } from "@/components/ui/empty-state";
import { Sticker, CharacterGauge } from "@/components/ui/sticker";
import { Heart, Plus, ArrowRight, Shield, Flame } from "lucide-react";
import Link from "next/link";

const ROUTINE_XP = 25;
const ROUTINE_HISTORY_DAYS = 30;

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guilds, setGuilds] = useState<Map<string, Guild>>(new Map());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineLogs, setRoutineLogs] = useState<RoutineLog[]>([]);
  const [routineCounts, setRoutineCounts] = useState<Record<string, number>>({});
  const [period, setPeriod] = useState<StatPeriod>("this-week");
  const [showCheckin, setShowCheckin] = useState(false);
  const [loading, setLoading] = useState(true);

  const { celebrate } = useCelebration();

  const load = useCallback(async () => {
    const supabase = createClient();
    const { from, to } = getPeriodRange(period);

    // Routines use a fixed 30-day window, independent of the task-stats period.
    const routineToDate = new Date();
    const routineFromDate = new Date();
    routineFromDate.setDate(routineFromDate.getDate() - (ROUTINE_HISTORY_DAYS - 1));
    const routineFrom = toDateString(routineFromDate);
    const routineTo = toDateString(routineToDate);

    const [
      guildList,
      taskList,
      completed,
      recentCheckins,
      todayCheckin,
      routineList,
      routineLogList,
      routineCountMap,
      { data: { user } },
    ] = await Promise.all([
      getGuilds(supabase),
      getActiveTasks(supabase),
      getCompletedTasksInRange(supabase, from, to),
      getRecentCheckins(supabase, 7),
      getTodayCheckin(supabase),
      getRoutines(supabase),
      getRoutineLogs(supabase, routineFrom, routineTo),
      getRoutineCompletionCounts(supabase),
      supabase.auth.getUser(),
    ]);

    setGuilds(new Map(guildList.map((g) => [g.id, g])));
    setTasks(taskList);
    setCompletedTasks(completed);
    setCheckins(recentCheckins);
    setRoutines(routineList);
    setRoutineLogs(routineLogList);
    setRoutineCounts(routineCountMap);

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);
    }
    if (!todayCheckin) setShowCheckin(true);
    setLoading(false);
  }, [period]);

  useEffect(() => { load(); }, [load]);

  async function handleCheckin(data: { energy: number; mood: Mood; sleep_quality: number }) {
    const supabase = createClient();
    const checkin = await createCheckin(supabase, data);
    setCheckins((prev) => [...prev, checkin]);
    setShowCheckin(false);
  }

  async function handleRoutineToggle(
    id: string,
    done: boolean,
    position?: { x: number; y: number }
  ) {
    const todayStr = toDateString(new Date());

    // Optimistic update of the per-day logs + all-time counts.
    setRoutineLogs((prev) => {
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
    setRoutineCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + (done ? 1 : -1)),
    }));

    const supabase = createClient();
    try {
      await setRoutineCompletion(supabase, id, todayStr, done);
    } catch {
      return; // leave optimistic UI; a reload reconciles
    }

    // XP + streak + confetti on completion only (undo is XP-neutral).
    if (done) {
      await celebrate({ xp: ROUTINE_XP, priority: "low", position });
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hp = calculateHp(checkins);
  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const hasNoData = guilds.size === 0 && tasks.length === 0 && routines.length === 0;

  if (hasNoData) {
    return (
      <div className="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
        <EmptyState
          icon={<Sticker shape="blob" color="#FF6D29" size={80} expression="happy" />}
          title="The water's been waiting."
          description="Set up a crew, drop your first quest, and the day starts to take shape."
          className="flex-1"
        >
          <FeatureGrid>
            <FeatureCard
              icon={<Sticker shape="hex" color="#2B6BFF" size={44} expression="happy" />}
              title="Build your crew"
              description="Guilds are your jobs and roles. Each gets its own colour and queue."
              action={<Link href="/guilds" className="text-xs text-text-primary hover:underline">Set up guilds &rarr;</Link>}
            />
            <FeatureCard
              icon={<Sticker shape="star" color="#FFC857" size={44} expression="happy" />}
              title="Drop a side quest"
              description="The personal stuff — fun things, errands, projects, dreams."
              action={<Link href="/side-quests" className="text-xs text-text-primary hover:underline">View quests &rarr;</Link>}
            />
            <FeatureCard
              icon={<Sticker shape="cloud" color="#2DBE6C" size={44} expression="happy" />}
              title="Block your week"
              description="Drag hours onto the calendar. Watch the wave take shape."
              action={<Link href="/planner" className="text-xs text-text-primary hover:underline">Open planner &rarr;</Link>}
            />
          </FeatureGrid>
        </EmptyState>
        <DailyCheckinModal open={showCheckin} onSubmit={handleCheckin} />
      </div>
    );
  }

  // Today summary
  const today = toDateString(new Date());
  const todayTasks = tasks.filter((t) => {
    if (!t.start_date && !t.due_date) return false;
    const start = t.start_date ?? t.due_date!;
    const end = t.due_date ?? start;
    return today >= start && today <= end;
  });
  const todayDoneCount = todayTasks.filter((t) => t.status === "done").length;
  const todayTotal = todayTasks.length;
  const urgentToday = todayTasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;

  // Routines scheduled today + which are already checked off.
  const todayDate = new Date();
  const todaysRoutines = routines.filter((r) =>
    isRecurringOnDate(
      parseRecurrenceRule(r.recurrence_rule) ?? { frequency: "daily" },
      todayDate,
      r.created_at
    )
  );
  const completedRoutineToday = new Set(
    routineLogs.filter((l) => l.date === today).map((l) => l.routine_id)
  );
  const doneRoutines = todaysRoutines.filter((r) => completedRoutineToday.has(r.id)).length;
  const routineFrom = toDateString(
    new Date(todayDate.getTime() - (ROUTINE_HISTORY_DAYS - 1) * 86400000)
  );

  const energyAvg = checkins.length
    ? checkins.reduce((s, c) => s + c.energy, 0) / checkins.length
    : 0;
  const energyTrend = checkins.length >= 2
    ? checkins[checkins.length - 1].energy - checkins[0].energy
    : 0;

  const streak = profile?.current_streak ?? 0;
  const shields = profile?.streak_shields_remaining ?? 0;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      {/* Greeting */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-text-muted uppercase tracking-[.15em] mb-1">
            {dateLabel}
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-[32px] font-bold tracking-tight m-0">
            Morning, {firstName}.{" "}
            <span className="text-gold">The water&apos;s good.</span>
          </h1>
          <p className="text-text-secondary mt-1.5">
            {todayDoneCount} of {todayTotal} blocks done
            {streak > 0 && <> · {streak}-day streak burning</>}
            {urgentToday > 0 && <> · {urgentToday} urgent thing{urgentToday === 1 ? "" : "s"} waiting on you.</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCheckin(true)}
            className="btn btn-ghost"
          >
            <Heart size={14} /> Check in
          </button>
          <Link href="/side-quests" className="btn btn-primary">
            <Plus size={14} /> New quest
          </Link>
        </div>
      </div>

      {/* Hero — 4 character gauge cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* HP */}
        <HeroCard glowColor="rgba(255,109,41,0.18)">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-[.15em]">
                Vitals
              </div>
              <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold mt-0.5">
                {hp}
                <span className="text-text-faint text-lg">/100</span>
              </div>
              <div className="pill pill-sun mt-2">{getHpLabel(hp)}</div>
            </div>
            <CharacterGauge
              value={hp}
              max={100}
              size={88}
              stroke={9}
              color={getHpColor(hp)}
              shape="heart"
              expression={hp < 30 ? "flat" : "happy"}
            />
          </div>
          <p className="text-xs text-text-secondary mt-3.5 m-0">
            Eat lunch. Take the 3pm walk. Be nice to your knees.
          </p>
        </HeroCard>

        {/* Level / XP */}
        <HeroCard glowColor="rgba(255,200,87,0.18)">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-[.15em]">
                Level {levelInfo.level}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold mt-0.5">
                <span className="gold-shimmer">{levelInfo.title}</span>
              </div>
              <div className="pill pill-gold mt-2">
                {Math.max(0, levelInfo.xpForNext - totalXp)} XP to lvl {levelInfo.level + 1}
              </div>
            </div>
            <CharacterGauge
              value={xpProgress * 100}
              max={100}
              size={88}
              stroke={9}
              color="#FFC857"
              shape="star"
              expression="happy"
            />
          </div>
          <p className="text-xs text-text-secondary mt-3.5 m-0">
            Keep at it — every quest stacks gold on your wave.
          </p>
        </HeroCard>

        {/* Energy pulse */}
        <HeroCard glowColor="rgba(43,107,255,0.18)">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-[.15em]">
                Energy pulse
              </div>
              <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold mt-0.5">
                {energyAvg ? energyAvg.toFixed(1) : "—"}
                <span className="text-text-faint text-lg">/5</span>
              </div>
              <div className="pill pill-blue mt-2">
                {energyTrend > 0 ? "Trending up ↑" : energyTrend < 0 ? "Easing off ↓" : "Steady →"}
              </div>
            </div>
            <Sticker shape="cloud" color="#2B6BFF" size={64} expression="happy" />
          </div>
          <div className="mt-3.5 -mx-1">
            <EnergySparkline checkins={checkins} height={48} />
          </div>
        </HeroCard>

        {/* Streak */}
        <HeroCard glowColor="rgba(255,90,90,0.18)">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-[.15em]">
                Streak on fire
              </div>
              <div className="font-[family-name:var(--font-heading)] text-[40px] font-bold mt-0.5 leading-none">
                {streak}
                <span className="text-text-faint text-lg ml-1">days</span>
              </div>
              <div className="mt-2 flex gap-1.5 items-center flex-wrap">
                <div className="pill pill-gold">
                  <Shield size={11} /> {shields} shield{shields === 1 ? "" : "s"}
                </div>
                {(profile?.longest_streak ?? 0) > 0 && (
                  <div className="pill">PB {profile?.longest_streak}d</div>
                )}
              </div>
            </div>
            <Sticker shape="triangle" color="#FF3D2E" size={64} expression="open" tilt={-6} />
          </div>
          <p className="text-xs text-text-secondary mt-3.5 m-0">
            Miss a day and a shield catches you{shields > 0 ? `. You've got ${shields}.` : "."}
          </p>
        </HeroCard>
      </div>

      {/* Performance insights */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">
              How the week is shaping up
            </h2>
            <div className="h-px w-16 bg-border-light/60" />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as StatPeriod)}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] text-[10px] font-bold text-text-primary uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-sun cursor-pointer"
          >
            <option value="this-week">This Week</option>
            <option value="7-days">Last 7 Days</option>
            <option value="this-month">This Month</option>
            <option value="30-days">Last 30 Days</option>
          </select>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <WeeklyCompletion activeTasks={tasks} completedTasks={completedTasks} />
          <HoursOverview activeTasks={tasks} completedTasks={completedTasks} />
          <OverdueCount tasks={tasks} />
          <GuildWorkload activeTasks={tasks} completedTasks={completedTasks} guilds={guilds} />
        </div>
      </section>

      {/* Routine momentum */}
      {routines.length > 0 && (
        <RoutineMomentum
          routines={routines}
          logs={routineLogs}
          counts={routineCounts}
          today={todayDate}
          from={routineFrom}
        />
      )}

      {/* Today + Upcoming */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold m-0">
                Today&apos;s wave
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {todayDoneCount} done · {Math.max(0, todayTotal - todayDoneCount)} ahead
              </p>
            </div>
            <Link
              href="/planner"
              className="btn btn-ghost text-xs px-3 py-1.5"
            >
              Open planner <ArrowRight size={12} />
            </Link>
          </div>
          <TodayPlan tasks={tasks} guilds={guilds} />
        </div>

        <div className="card-surface p-6 flex flex-col">
          {todaysRoutines.length > 0 && (
            <div className="mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  Today&apos;s routines
                </span>
                <span className="text-[11px] text-text-muted tabular-nums">
                  {doneRoutines} / {todaysRoutines.length}
                </span>
              </div>
              {todaysRoutines.map((r) => (
                <RoutineCard
                  key={r.id}
                  routine={r}
                  done={completedRoutineToday.has(r.id)}
                  onToggle={handleRoutineToggle}
                />
              ))}
              <div className="h-px bg-border-light/60 mt-3" />
            </div>
          )}
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold m-0">
              Coming up
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Next 3 days</p>
          </div>
          <UpcomingTasks tasks={tasks} guilds={guilds} />
        </div>
      </div>

      <DailyCheckinModal open={showCheckin} onSubmit={handleCheckin} />
    </div>
  );
}

function HeroCard({
  children,
  glowColor,
}: {
  children: React.ReactNode;
  glowColor: string;
}) {
  return (
    <div
      className="card-surface p-5 min-h-[200px] flex flex-col"
      style={{
        background: `radial-gradient(ellipse at top right, ${glowColor}, transparent 60%), linear-gradient(180deg, var(--color-bg-card), var(--color-bg-1))`,
      }}
    >
      {children}
    </div>
  );
}

function UpcomingTasks({
  tasks,
  guilds,
}: {
  tasks: Task[];
  guilds: Map<string, Guild>;
}) {
  const now = new Date();
  const threeDaysOut = new Date();
  threeDaysOut.setDate(now.getDate() + 3);
  const cutoff = threeDaysOut.toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const upcoming = tasks
    .filter(
      (t) =>
        t.due_date &&
        t.due_date >= today &&
        t.due_date <= cutoff &&
        t.status !== "done"
    )
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 6);

  if (upcoming.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-3">
        <Sticker shape="squircle" color="#FFC857" size={44} expression="happy" />
        <div>
          <p className="text-sm font-medium">Light week ahead.</p>
          <p className="text-xs text-text-secondary mt-1">
            Maybe schedule that long walk you keep mentioning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {upcoming.map((task) => {
        const guild = task.guild_id ? guilds.get(task.guild_id) : null;
        const dueLabel = formatDueLabel(task.due_date!);
        const priorityClass =
          task.priority === "urgent"
            ? "pill-red"
            : task.priority === "low"
            ? "pill-leaf"
            : "pill-sun";
        return (
          <div
            key={task.id}
            className="p-3.5 rounded-2xl bg-white/[0.025] shadow-[0_0_0_1px_var(--color-border)_inset]"
          >
            <div className="flex justify-between mb-2 items-center gap-2">
              <span className="pill">{dueLabel}</span>
              <span className={`pill ${priorityClass}`}>{task.priority}</span>
            </div>
            <div className="text-sm font-medium mb-1.5 line-clamp-2">{task.title}</div>
            {guild && (
              <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    background: guild.color,
                    boxShadow: `0 0 8px ${guild.color}`,
                  }}
                />
                {guild.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDueLabel(due: string): string {
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5">
      <div className="h-12 w-1/2 animate-shimmer rounded" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 min-h-[400px] rounded-3xl" />
        <Skeleton className="min-h-[400px] rounded-3xl" />
      </div>
    </div>
  );
}
