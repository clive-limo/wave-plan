"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getCheckinHistory } from "@/lib/supabase/queries/checkins";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { calculateHp, getHpColor, getHpLabel } from "@/lib/hp";
import { Profile, Guild, Task, DailyCheckin } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { EnergyChart } from "@/components/character/energy-chart";
import { GuildStats } from "@/components/character/guild-stats";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NavIcon } from "@/components/layout/nav-icon";
import { AnimatedXpCounter } from "@/components/gamification/animated-xp-counter";

export default function CharacterPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [guildList, checkinHistory, { data: { user } }] = await Promise.all([
      getGuilds(supabase),
      getCheckinHistory(supabase, 30),
      supabase.auth.getUser(),
    ]);
    setGuilds(guildList);
    setCheckins(checkinHistory);

    if (user) {
      const [{ data: profileData }, { data: allTasks }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("tasks").select("*").eq("user_id", user.id),
      ]);
      if (profileData) setProfile(profileData);
      if (allTasks) setTasks(allTasks);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 pb-4 border-b border-border"><div className="h-7 w-40 animate-shimmer rounded" /></div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-2" /><SkeletonCard />
        </div>
      </div>
    );
  }

  const hp = calculateHp(checkins.slice(-7));
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const hasActivity = totalDone > 0 || checkins.length > 0;

  if (!hasActivity) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Character Sheet</h1>
        </div>
        <EmptyState
          icon={<NavIcon name="user" size={24} />}
          title="Your story begins"
          description="Complete tasks and do daily check-ins to build your character stats. Your XP, level, streak, and energy history will appear here."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="w-14 h-14 rounded-xl bg-bg-card border border-border flex items-center justify-center text-2xl flex-shrink-0">
          {"\u2694\uFE0F"}
        </div>
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">
            {profile?.display_name ?? "Adventurer"}
          </h1>
          <p className="text-sm text-gold">
            Level {levelInfo.level} &middot; {levelInfo.title}
          </p>
        </div>
      </div>

      {/* Stats row — 4 columns with circular progress for HP & XP */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-4">
        <Card className="flex flex-col items-center py-4">
          <CircularProgress
            value={hp}
            size={72}
            strokeWidth={6}
            color={getHpColor(hp)}
            label={String(hp)}
            sublabel="HP"
          />
          <p className="text-[10px] text-text-muted mt-2">{getHpLabel(hp)}</p>
        </Card>

        <Card className="flex flex-col items-center py-4">
          <CircularProgress
            value={xpProgress * 100}
            size={72}
            strokeWidth={6}
            color="var(--color-gold)"
            label={`${levelInfo.level}`}
            sublabel="Level"
          />
          <p className="text-[10px] text-text-muted mt-2"><AnimatedXpCounter value={totalXp} /> XP</p>
        </Card>

        <Card className="flex flex-col items-center justify-center py-4">
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            {profile?.current_streak ?? 0}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Day Streak</span>
          <span className="text-[10px] text-text-muted mt-0.5">Best: {profile?.longest_streak ?? 0}d</span>
        </Card>

        <Card className="flex flex-col items-center justify-center py-4">
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            {totalDone}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Tasks Done</span>
        </Card>
      </div>

      {/* Detail row — guild breakdown (2/3) + energy chart (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Guild Breakdown</CardTitle></CardHeader>
          <GuildStats guilds={guilds} tasks={tasks} />
        </Card>

        <Card>
          <CardHeader><CardTitle>Energy (30 Days)</CardTitle></CardHeader>
          <EnergyChart checkins={checkins} />
        </Card>
      </div>
    </div>
  );
}
