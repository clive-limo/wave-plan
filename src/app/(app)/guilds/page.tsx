"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getGuilds, createGuild } from "@/lib/supabase/queries/guilds";
import { Guild } from "@/lib/types";
import { GuildCard } from "@/components/guilds/guild-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GuildForm } from "@/components/guilds/guild-form";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NavIcon } from "@/components/layout/nav-icon";

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadGuilds();
  }, []);

  async function loadGuilds() {
    const supabase = createClient();
    try {
      const data = await getGuilds(supabase);
      setGuilds(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: { name: string; color: string; icon: string }) {
    const supabase = createClient();
    const guild = await createGuild(supabase, data);
    setGuilds((prev) => [...prev, guild]);
    setShowCreate(false);
    router.push(`/guilds/${guild.id}`);
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Guilds</h1>
        </div>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Guilds</h1>
        <Button onClick={() => setShowCreate(true)}>New Guild</Button>
      </div>

      {guilds.length === 0 ? (
        <EmptyState
          icon={<NavIcon name="shield" size={24} />}
          title="No guilds yet"
          description="Guilds represent your jobs, roles, or areas of responsibility. Create your first guild to start organizing your tasks."
          action={
            <Button onClick={() => setShowCreate(true)}>Create your first guild</Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Guild">
        <GuildForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
