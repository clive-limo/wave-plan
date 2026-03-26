"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getActiveTasks, getCompletedTasksInRange } from "@/lib/supabase/queries/tasks";
import { getTodayCheckin, getRecentCheckins, createCheckin } from "@/lib/supabase/queries/checkins";
import { calculateHp, getHpColor, getHpLabel } from "@/lib/hp";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { getPeriodRange, StatPeriod } from "@/lib/date-utils";
import { Guild, Task, Profile, DailyCheckin, Mood } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { EnergySparkline } from "@/components/dashboard/energy-sparkline";
import { WeeklyCompletion } from "@/components/dashboard/weekly-completion";
import { HoursOverview } from "@/components/dashboard/hours-overview";
import { OverdueCount } from "@/components/dashboard/overdue-count";
import { GuildWorkload } from "@/components/dashboard/guild-workload";
import { StreakBadge } from "@/components/gamification/streak-badge";
import { AnimatedXpCounter } from "@/components/gamification/animated-xp-counter";
import { DailyCheckinModal } from "@/components/checkin/daily-checkin-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, FeatureCard, FeatureGrid } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guilds, setGuilds] = useState<Map<string, Guild>>(new Map());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<StatPeriod>("this-week");
  const [showCheckin, setShowCheckin] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { from, to } = getPeriodRange(period);
    const [guildList, taskList, completed, recentCheckins, todayCheckin, { data: { user } }] =
      await Promise.all([
        getGuilds(supabase),
        getActiveTasks(supabase),
        getCompletedTasksInRange(supabase, from, to),
        getRecentCheckins(supabase, 7),
        getTodayCheckin(supabase),
        supabase.auth.getUser(),
      ]);

    setGuilds(new Map(guildList.map((g) => [g.id, g])));
    setTasks(taskList);
    setCompletedTasks(completed);
    setCheckins(recentCheckins);

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hp = calculateHp(checkins);
  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const hasNoData = guilds.size === 0 && tasks.length === 0;

  if (hasNoData) {
    return (
      <div className="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
        <EmptyState
          icon={<span>{"\u2694\uFE0F"}</span>}
          title="Welcome to Wave Plan"
          description="Your adventure begins here. Set up your first guild and start tracking tasks to see your dashboard come alive."
          className="flex-1"
        >
          <FeatureGrid>
            <FeatureCard icon={<span>{"\uD83D\uDEE1\uFE0F"}</span>} title="Create a Guild" description="Guilds represent your jobs or roles. Each gets its own color and task queue." action={<Link href="/guilds" className="text-xs text-text-primary hover:underline">Set up guilds &rarr;</Link>} />
            <FeatureCard icon={<span>{"\uD83D\uDDFA\uFE0F"}</span>} title="Start Side Quests" description="Track personal tasks, fun projects, and important things to remember." action={<Link href="/side-quests" className="text-xs text-text-primary hover:underline">View quests &rarr;</Link>} />
            <FeatureCard icon={<span>{"\uD83D\uDCC5"}</span>} title="Plan Your Week" description="Assign hours to tasks and see them distributed across your calendar." action={<Link href="/planner" className="text-xs text-text-primary hover:underline">Open planner &rarr;</Link>} />
          </FeatureGrid>
        </EmptyState>
        <DailyCheckinModal open={showCheckin} onSubmit={handleCheckin} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6 min-h-[calc(100vh-140px)]">
      {/* Hero Stats Row */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-6 bg-bg-card border-border/60 relative overflow-hidden group">
          <Heart size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <CircularProgress
              value={hp}
              size={110}
              strokeWidth={8}
              color={getHpColor(hp)}
              label={String(hp)}
              sublabel={getHpLabel(hp)}
            />
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Vitality</span>
              {hp < 30 && <Badge className="text-[8px] border border-hp-low/50 text-hp-low bg-hp-low/5 font-black uppercase tracking-tighter">Emergency</Badge>}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 bg-bg-card border-border/60 relative overflow-hidden group">
          <Zap size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <CircularProgress
              value={xpProgress * 100}
              size={110}
              strokeWidth={8}
              color="var(--color-gold)"
              label={`Lv.${levelInfo.level}`}
              sublabel={levelInfo.title}
            />
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Mastery</span>
              <p className="text-[10px] font-mono text-gold font-bold">
                <AnimatedXpCounter value={totalXp} /> / {levelInfo.xpForNext}
              </p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col p-6 bg-bg-card border-border/60 relative overflow-hidden group">
          <Activity size={80} strokeWidth={1} className="absolute -bottom-6 -right-4 text-text-muted/[0.06] pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Activity Pulse</span>
                <h3 className="text-sm font-semibold text-text-primary mt-1">Energy Variance</h3>
              </div>
              <div className="flex items-center gap-4">
                {(profile?.longest_streak ?? 0) > 0 && (
                  <div className="text-[9px] font-bold text-gold uppercase tracking-widest bg-gold/5 px-2 py-0.5 rounded border border-gold/20">
                    PB: {profile?.longest_streak}d
                  </div>
                )}
                <StreakBadge streak={profile?.current_streak ?? 0} />
              </div>
            </div>
            <div className="mt-auto w-full">
              <EnergySparkline checkins={checkins} height={90} />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Section with Select */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">
              Performance Insights
            </h2>
            <div className="h-[1px] w-16 bg-border/60" />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as StatPeriod)}
            className="px-2 py-1.5 rounded bg-bg-card border border-border/60 text-[10px] font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-border transition-all uppercase tracking-tight"
          >
            <option value="this-week">This Week</option>
            <option value="7-days">Last 7 Days</option>
            <option value="this-month">This Month</option>
            <option value="30-days">Last 30 Days</option>
          </select>
        </div>
        
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          <WeeklyCompletion activeTasks={tasks} completedTasks={completedTasks} />
          <HoursOverview activeTasks={tasks} completedTasks={completedTasks} />
          <OverdueCount tasks={tasks} />
          <GuildWorkload activeTasks={tasks} completedTasks={completedTasks} guilds={guilds} />
        </div>
      </section>

      {/* Main content row — 2/3 + 1/3 */}
      <div className="grid gap-6 lg:grid-cols-3 flex-1">
        <Card flush className="lg:col-span-2 border-border/60 bg-bg-card flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Today&apos;s Plan</CardTitle>
            <Link href="/planner" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">
              Open Planner &rarr;
            </Link>
          </div>
          <div className="px-6 py-4 flex-1">
            <TodayPlan tasks={tasks} guilds={guilds} />
          </div>
        </Card>

        <Card flush className="border-border/60 bg-bg-card flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Upcoming Deadlines</CardTitle>
          </div>
          <div className="px-6 py-4 flex-1">
            <UpcomingTasks tasks={tasks} guilds={guilds} />
          </div>
        </Card>
      </div>

      <DailyCheckinModal open={showCheckin} onSubmit={handleCheckin} />
    </div>
  );
}

function UpcomingTasks({ tasks, guilds }: { tasks: Task[]; guilds: Map<string, Guild> }) {
  const now = new Date();
  const threeDaysOut = new Date();
  threeDaysOut.setDate(now.getDate() + 3);
  const cutoff = threeDaysOut.toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const upcoming = tasks
    .filter((t) => t.due_date && t.due_date >= today && t.due_date <= cutoff && t.status !== "done")
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 10);

  if (upcoming.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 opacity-50">Clear Skies</p>
        <p className="text-xs text-text-muted">No deadlines in the next 3 days.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {upcoming.map((task) => {
        const guild = task.guild_id ? guilds.get(task.guild_id) : null;
        return (
          <div key={task.id} className="flex items-center gap-3 py-3 px-2 rounded hover:bg-bg-primary/50 transition-colors text-sm group">
            <div className="w-1 h-3 rounded-full flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: guild?.color ?? "var(--color-text-muted)" }} />
            <span className="truncate flex-1 font-medium text-text-secondary group-hover:text-text-primary transition-colors">{task.title}</span>
            <span className="text-[10px] font-mono text-text-muted flex-shrink-0 tabular-nums">
              {new Date(task.due_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6 min-h-[calc(100vh-140px)]">
      <div className="grid gap-6 lg:grid-cols-4">
        <Skeleton className="h-40 rounded-lg border-border/60" />
        <Skeleton className="h-40 rounded-lg border-border/60" />
        <Skeleton className="lg:col-span-2 h-40 rounded-lg border-border/60" />
      </div>
      
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-8 w-32 rounded" />
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-40 rounded-lg border-border/60" />
        <Skeleton className="h-40 rounded-lg border-border/60" />
        <Skeleton className="h-40 rounded-lg border-border/60" />
        <Skeleton className="h-40 rounded-lg border-border/60" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 flex-1">
        <Skeleton className="lg:col-span-2 min-h-[400px] rounded-lg border-border/60" />
        <Skeleton className="min-h-[400px] rounded-lg border-border/60" />
      </div>
    </div>
  );
}
