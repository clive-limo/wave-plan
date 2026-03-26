"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getActiveTasks } from "@/lib/supabase/queries/tasks";
import { getTodayCheckin, getRecentCheckins, createCheckin } from "@/lib/supabase/queries/checkins";
import { calculateHp, getHpColor, getHpLabel } from "@/lib/hp";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { Guild, Task, Profile, DailyCheckin, Mood } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { EnergySparkline } from "@/components/dashboard/energy-sparkline";
import { StreakBadge } from "@/components/gamification/streak-badge";
import { AnimatedXpCounter } from "@/components/gamification/animated-xp-counter";
import { DailyCheckinModal } from "@/components/checkin/daily-checkin-modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState, FeatureCard, FeatureGrid } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guilds, setGuilds] = useState<Map<string, Guild>>(new Map());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [showCheckin, setShowCheckin] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [guildList, taskList, recentCheckins, todayCheckin, { data: { user } }] =
      await Promise.all([
        getGuilds(supabase),
        getActiveTasks(supabase),
        getRecentCheckins(supabase, 7),
        getTodayCheckin(supabase),
        supabase.auth.getUser(),
      ]);

    setGuilds(new Map(guildList.map((g) => [g.id, g])));
    setTasks(taskList);
    setCheckins(recentCheckins);

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);
    }
    if (!todayCheckin) setShowCheckin(true);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCheckin(data: { energy: number; mood: Mood; sleep_quality: number }) {
    const supabase = createClient();
    const checkin = await createCheckin(supabase, data);
    setCheckins((prev) => [...prev, checkin]);
    setShowCheckin(false);
  }

  if (loading) {
    return (
      <div className="animate-fade-in grid gap-4 lg:grid-cols-3">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
        <SkeletonCard className="lg:col-span-2" />
        <SkeletonCard />
      </div>
    );
  }

  const hp = calculateHp(checkins);
  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const hasNoData = guilds.size === 0 && tasks.length === 0;

  if (hasNoData) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={<span>{"\u2694\uFE0F"}</span>}
          title="Welcome to Wave Plan"
          description="Your adventure begins here. Set up your first guild and start tracking tasks to see your dashboard come alive."
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
    <div className="animate-fade-in">
      {/* Top stats row — 3 columns */}
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        {/* HP */}
        <Card className="flex flex-col items-center py-5">
          <CardTitle className="mb-3">HP</CardTitle>
          <CircularProgress
            value={hp}
            size={100}
            strokeWidth={8}
            color={getHpColor(hp)}
            label={String(hp)}
            sublabel={getHpLabel(hp)}
          />
          {hp < 30 && (
            <p className="text-xs text-hp-low mt-3 text-center">
              Energy is low. Consider taking a break.
            </p>
          )}
        </Card>

        {/* XP */}
        <Card className="flex flex-col items-center py-5">
          <CardTitle className="mb-3">Experience</CardTitle>
          <CircularProgress
            value={xpProgress * 100}
            size={100}
            strokeWidth={8}
            color="var(--color-gold)"
            label={`Lv.${levelInfo.level}`}
            sublabel={levelInfo.title}
          />
          <p className="text-xs text-text-muted mt-3">
            <AnimatedXpCounter value={totalXp} /> / {levelInfo.xpForNext} XP
          </p>
        </Card>

        {/* Streak + Energy */}
        <Card className="flex flex-col py-5">
          <CardTitle className="mb-3">Activity</CardTitle>
          <div className="flex items-center justify-between mb-4">
            <StreakBadge streak={profile?.current_streak ?? 0} />
            {(profile?.longest_streak ?? 0) > 0 && (
              <Badge variant="default">Best: {profile?.longest_streak}d</Badge>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-xs text-text-muted mb-2">Energy (7 days)</p>
            <EnergySparkline checkins={checkins} width={280} height={50} />
          </div>
        </Card>
      </div>

      {/* Main content row — 2/3 + 1/3 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card flush className="lg:col-span-2">
          <div className="px-4 pt-4 pb-2">
            <CardTitle>Today&apos;s Plan</CardTitle>
          </div>
          <div className="px-4 pb-4">
            <TodayPlan tasks={tasks} guilds={guilds} />
          </div>
        </Card>

        <Card flush>
          <div className="px-4 pt-4 pb-2">
            <CardTitle>Upcoming</CardTitle>
          </div>
          <div className="px-4 pb-4">
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
    .slice(0, 8);

  if (upcoming.length === 0) {
    return <p className="text-text-muted text-sm py-4">No deadlines in the next 3 days.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {upcoming.map((task) => {
        const guild = task.guild_id ? guilds.get(task.guild_id) : null;
        return (
          <div key={task.id} className="flex items-center gap-3 py-2.5 text-sm">
            {guild && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: guild.color }} />}
            <span className="truncate flex-1">{task.title}</span>
            <span className="text-xs text-text-muted flex-shrink-0">
              {new Date(task.due_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
