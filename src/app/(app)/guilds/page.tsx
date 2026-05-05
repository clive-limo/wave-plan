"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getGuilds, createGuild } from "@/lib/supabase/queries/guilds";
import { Guild } from "@/lib/types";
import { GuildCard } from "@/components/guilds/guild-card";
import { Modal } from "@/components/ui/modal";
import { GuildForm } from "@/components/guilds/guild-form";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { Sticker } from "@/components/ui/sticker";
import { Icon } from "@/components/ui/icon";

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
        <SkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <h1
            className="font-[family-name:var(--font-heading)] font-bold m-0"
            style={{ fontSize: 32, letterSpacing: "-0.02em" }}
          >
            Your crews
          </h1>
          <p className="text-text-secondary mt-1.5 m-0">
            Group quests by the part of you that&apos;s doing them.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">
          <Icon name="plus" size={14} /> New guild
        </button>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {guilds.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="card-surface min-h-[220px] p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer"
          style={{
            background: "rgba(255,109,41,0.04)",
            boxShadow: "0 0 0 1.5px rgba(255,109,41,0.25) inset",
          }}
        >
          <Sticker shape="squircle" color="#FF6D29" size={64} expression="happy" />
          <div className="font-[family-name:var(--font-heading)] font-semibold text-base">
            Start a new crew
          </div>
          <div className="text-xs text-text-secondary max-w-[160px]">
            For that side project, hobby, or that thing you keep meaning to start.
          </div>
        </button>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Guild">
        <GuildForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
