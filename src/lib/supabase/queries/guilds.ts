import { SupabaseClient } from "@supabase/supabase-js";
import { Guild } from "@/lib/types";

export async function getGuilds(supabase: SupabaseClient): Promise<Guild[]> {
  const { data, error } = await supabase
    .from("guilds")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getGuild(supabase: SupabaseClient, id: string): Promise<Guild | null> {
  const { data, error } = await supabase
    .from("guilds")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createGuild(
  supabase: SupabaseClient,
  guild: { name: string; color: string; icon: string }
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("guilds")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("guilds")
    .insert({
      user_id: user.user.id,
      name: guild.name,
      color: guild.color,
      icon: guild.icon,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Guild;
}

export async function updateGuild(
  supabase: SupabaseClient,
  id: string,
  updates: { name?: string; color?: string; icon?: string }
) {
  const { data, error } = await supabase
    .from("guilds")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Guild;
}

export async function deleteGuild(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("guilds").delete().eq("id", id);
  if (error) throw error;
}
