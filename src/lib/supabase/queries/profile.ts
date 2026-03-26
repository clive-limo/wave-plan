import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/lib/types";

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
