"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getCheckinHistory } from "@/lib/supabase/queries/checkins";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { calculateHp, getHpColor } from "@/lib/hp";
import { Profile, Guild, Task, DailyCheckin } from "@/lib/types";
import { Sticker, CharacterGauge } from "@/components/ui/sticker";
import { Sparkline } from "@/components/ui/sparkline";
import { Icon } from "@/components/ui/icon";
import { SkeletonCard } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, string> = {
  briefcase: "💼", code: "💻", palette: "🎨", book: "📚", rocket: "🚀",
  star: "⭐", zap: "⚡", coffee: "☕", globe: "🌍", wrench: "🔧",
  music: "🎵", heart: "❤️",
};

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
      <div className="animate-fade-in flex flex-col gap-5">
        <SkeletonCard className="min-h-[220px] rounded-3xl" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const recentCheckins = checkins.slice(-7);
  const hp = calculateHp(recentCheckins);
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;

  const guildTaskCounts = guilds.map((g) => ({
    ...g,
    count: tasks.filter((t) => t.guild_id === g.id).length,
  }));
  const totalGuildTasks = Math.max(
    1,
    guildTaskCounts.reduce((s, g) => s + g.count, 0)
  );

  const energyAvg =
    checkins.length > 0
      ? checkins.reduce((s, c) => s + c.energy, 0) / checkins.length
      : 0;
  const energyData = checkins.map((c) => c.energy);

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      {/* Hero header */}
      <div className="card-surface relative overflow-hidden p-7 min-h-[220px]">
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          style={{
            right: -100,
            top: -80,
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(255,200,87,0.30) 0%, rgba(255,109,41,0.15) 30%, transparent 60%)",
            filter: "blur(20px)",
          }}
        />
        <div className="relative flex items-center gap-7 flex-wrap">
          <div className="relative">
            <Sticker shape="blob" color="#FF6D29" size={140} expression="happy" />
            <div
              className="absolute font-[family-name:var(--font-heading)]"
              style={{
                bottom: -6,
                right: -6,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFC857, #FF6D29)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#1A0A03",
                boxShadow: "0 0 20px rgba(255,200,87,0.6)",
              }}
            >
              {levelInfo.level}
            </div>
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-text-muted uppercase tracking-widest">
              Level {levelInfo.level}
            </div>
            <h1
              className="font-[family-name:var(--font-heading)] font-bold mt-1 mb-2"
              style={{ fontSize: 44, letterSpacing: "-0.02em" }}
            >
              {profile?.display_name ?? "Adventurer"}
            </h1>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="pill pill-gold">
                <Icon name="trophy" size={12} /> {levelInfo.title}
              </span>
              <span className="pill pill-sun">
                <Icon name="flame" size={12} /> {streak}-day streak
              </span>
              <span className="pill">
                <Icon name="check" size={12} /> {totalDone} quests cleared
              </span>
            </div>
            <p className="text-text-secondary max-w-[520px] mt-3.5 m-0">
              Keep stacking days. Each one teaches you something the data only hints at.
            </p>
          </div>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <div className="card-surface p-[22px] flex items-center gap-4">
          <CharacterGauge
            value={hp}
            max={100}
            size={88}
            stroke={9}
            color={getHpColor(hp)}
            shape="heart"
            expression={hp < 30 ? "flat" : "happy"}
          />
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Vitals
            </div>
            <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold">
              {hp}/100
            </div>
            <div className="text-xs text-text-secondary">Holding steady</div>
          </div>
        </div>

        <div className="card-surface p-[22px] flex items-center gap-4">
          <CharacterGauge
            value={xpProgress * 100}
            max={100}
            size={88}
            stroke={9}
            color="#FFC857"
            shape="star"
          />
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Progress
            </div>
            <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold">
              Lvl {levelInfo.level}
            </div>
            <div className="text-xs text-text-secondary">
              {totalXp}/{levelInfo.xpForNext} XP
            </div>
          </div>
        </div>

        <div className="card-surface p-[22px] flex items-center gap-4">
          <Sticker shape="triangle" color="#FF3D2E" size={72} expression="open" />
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Streak
            </div>
            <div className="font-[family-name:var(--font-heading)] text-[36px] font-bold">
              {streak}
            </div>
            <div className="text-xs text-text-secondary">
              days in a row{longest > streak ? ` · best ${longest}` : ""}
            </div>
          </div>
        </div>

        <div className="card-surface p-[22px] flex items-center gap-4">
          <Sticker shape="hex" color="#2DBE6C" size={72} expression="happy" />
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Lifetime
            </div>
            <div className="font-[family-name:var(--font-heading)] text-[28px] font-bold">
              {totalDone}
            </div>
            <div className="text-xs text-text-secondary">quests done</div>
          </div>
        </div>
      </div>

      {/* Detail row — guild breakdown + sparkline */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="card-surface p-[22px] lg:col-span-2">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold m-0 mb-4">
            Where your hours go
          </h3>
          {guildTaskCounts.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Add a guild and a quest to see how your work is shaped.
            </p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {guildTaskCounts.map((g) => {
                const pct = (g.count / totalGuildTasks) * 100;
                const emoji = ICON_MAP[g.icon] ?? g.icon ?? "💼";
                return (
                  <div key={g.id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] font-medium inline-flex items-center gap-2">
                        <span style={{ fontSize: 16 }}>{emoji}</span> {g.name}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-text-muted">
                        {g.count} {g.count === 1 ? "quest" : "quests"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-white/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: g.color,
                          boxShadow: `0 0 8px ${g.color}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-surface p-[22px]">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold m-0 mb-4">
            30-day pulse
          </h3>
          <div className="mb-3.5">
            <div className="font-[family-name:var(--font-heading)] text-[32px] font-bold">
              {energyAvg ? energyAvg.toFixed(1) : "—"}
              <span className="text-text-faint text-base"> /5 avg</span>
            </div>
            <div className="text-xs text-text-secondary">
              {checkins.length} check-ins logged
            </div>
          </div>
          {energyData.length > 0 ? (
            <Sparkline data={energyData} color="#FF6D29" width={280} height={64} />
          ) : (
            <div className="text-sm text-text-secondary">
              Daily check-ins will fill this in.
            </div>
          )}
          <div className="flex justify-between mt-2 font-[family-name:var(--font-mono)] text-[10px] text-text-muted">
            <span>30d ago</span>
            <span>today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
