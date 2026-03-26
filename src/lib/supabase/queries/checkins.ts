import { SupabaseClient } from "@supabase/supabase-js";
import { DailyCheckin, Mood } from "@/lib/types";

export async function getTodayCheckin(
  supabase: SupabaseClient
): Promise<DailyCheckin | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRecentCheckins(
  supabase: SupabaseClient,
  days = 7
): Promise<DailyCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCheckin(
  supabase: SupabaseClient,
  checkin: {
    energy: number;
    mood: Mood;
    sleep_quality: number;
  }
): Promise<DailyCheckin> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_checkins")
    .upsert(
      {
        user_id: user.user.id,
        date: today,
        energy: checkin.energy,
        mood: checkin.mood,
        sleep_quality: checkin.sleep_quality,
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as DailyCheckin;
}

export async function getCheckinHistory(
  supabase: SupabaseClient,
  days = 30
): Promise<DailyCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
