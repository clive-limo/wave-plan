import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { getLevelInfo } from "@/lib/levels";
import {
  getStreakPenalty,
  isStreakBroken,
  nextStreakValue,
  shouldEarnShield,
} from "@/lib/streaks";

export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function awardXp(
  supabase: SupabaseClient,
  amount: number
): Promise<{ newTotal: number; oldTotal: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  const oldTotal = profile?.total_xp ?? 0;
  const newTotal = oldTotal + amount;

  const { error } = await supabase
    .from("profiles")
    .update({ total_xp: newTotal })
    .eq("id", user.id);

  if (error) throw error;
  return { newTotal, oldTotal };
}

export interface RecordActivityResult {
  streakBefore: number;
  streakAfter: number;
  shieldEarned: boolean;
}

export async function recordActivity(
  supabase: SupabaseClient
): Promise<RecordActivityResult | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date, streak_shields_remaining")
    .eq("id", user.id)
    .single();
  if (readError || !profile) return null;

  const today = toDateString(new Date());
  const streakBefore: number = profile.current_streak ?? 0;
  const lastActivity: string | null = profile.last_activity_date ?? null;
  const shieldsBefore: number = profile.streak_shields_remaining ?? 0;
  const longestBefore: number = profile.longest_streak ?? 0;

  const streakAfter = nextStreakValue(streakBefore, lastActivity, today);
  const shieldEarned = shouldEarnShield(streakAfter, shieldsBefore);
  const shieldsAfter = shieldEarned ? shieldsBefore + 1 : shieldsBefore;
  const longestAfter = Math.max(longestBefore, streakAfter);

  if (
    streakAfter === streakBefore &&
    lastActivity === today &&
    shieldsAfter === shieldsBefore &&
    longestAfter === longestBefore
  ) {
    return { streakBefore, streakAfter, shieldEarned: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      current_streak: streakAfter,
      longest_streak: longestAfter,
      last_activity_date: today,
      streak_shields_remaining: shieldsAfter,
    })
    .eq("id", user.id);

  if (error) throw error;
  return { streakBefore, streakAfter, shieldEarned };
}

export type StreakBreakResult =
  | { broken: false }
  | { broken: true; shieldUsed: true; brokenStreak: number }
  | {
      broken: true;
      shieldUsed: false;
      brokenStreak: number;
      penalty: number;
      oldLevel: number;
      newLevel: number;
    };

export async function applyStreakBreak(
  supabase: SupabaseClient
): Promise<StreakBreakResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { broken: false };

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select(
      "current_streak, last_activity_date, streak_shields_remaining, last_streak_check_date, total_xp, level"
    )
    .eq("id", user.id)
    .single();
  if (readError || !profile) return { broken: false };

  const today = toDateString(new Date());

  if (profile.last_streak_check_date === today) {
    return { broken: false };
  }

  const lastActivity: string | null = profile.last_activity_date ?? null;
  const currentStreak: number = profile.current_streak ?? 0;
  const shields: number = profile.streak_shields_remaining ?? 0;
  const totalXp: number = profile.total_xp ?? 0;
  const oldLevel: number = profile.level ?? 1;

  if (!isStreakBroken(lastActivity, today) || currentStreak === 0) {
    await supabase
      .from("profiles")
      .update({ last_streak_check_date: today })
      .eq("id", user.id);
    return { broken: false };
  }

  if (shields > 0) {
    const { error } = await supabase
      .from("profiles")
      .update({
        streak_shields_remaining: shields - 1,
        last_activity_date: today,
        last_streak_check_date: today,
      })
      .eq("id", user.id);
    if (error) throw error;
    return { broken: true, shieldUsed: true, brokenStreak: currentStreak };
  }

  const penalty = getStreakPenalty(currentStreak);
  const newXp = Math.max(0, totalXp - penalty);
  const newLevel = getLevelInfo(newXp).level;

  const { error } = await supabase
    .from("profiles")
    .update({
      total_xp: newXp,
      level: newLevel,
      current_streak: 0,
      last_streak_check_date: today,
    })
    .eq("id", user.id);
  if (error) throw error;

  return {
    broken: true,
    shieldUsed: false,
    brokenStreak: currentStreak,
    penalty,
    oldLevel,
    newLevel,
  };
}
