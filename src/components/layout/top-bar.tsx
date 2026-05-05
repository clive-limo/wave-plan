"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Catch the day before it catches you." },
  "/planner": { title: "Planner", subtitle: "Block the day. Ride the wave." },
  "/guilds": { title: "Guilds", subtitle: "The crews you ride with." },
  "/side-quests": { title: "Side Quests", subtitle: "Life beyond the laptop." },
  "/character": { title: "Character", subtitle: "Who you're becoming." },
  "/settings": { title: "Settings", subtitle: "Tune your wave." },
};

function getPageMeta(pathname: string) {
  for (const [path, meta] of Object.entries(PAGE_META)) {
    if (pathname.startsWith(path)) return meta;
  }
  return { title: "Wave Plan", subtitle: "" };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TopBar() {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.display_name ??
          user.user_metadata?.full_name ??
          user.email ??
          "?";
        setInitials(getInitials(name));
      }
    }
    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3.5 border-b border-border bg-bg-primary/85 backdrop-blur-xl">
      <div className="flex-1 min-w-0">
        <h1 className="text-[22px] font-bold tracking-tight font-[family-name:var(--font-heading)] truncate m-0">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-muted truncate mt-0.5 m-0">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] w-[240px] max-w-[40vw]">
          <Icon name="search" size={16} color="var(--color-text-muted)" />
          <input
            placeholder="Find a quest, crew, anything…"
            className="bg-transparent border-none outline-none text-text-primary text-[13px] flex-1 min-w-0 placeholder:text-text-faint"
          />
          <span className="font-[family-name:var(--font-mono)] text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-text-muted">
            ⌘K
          </span>
        </div>

        <button title="Notifications" className="btn-icon" aria-label="Notifications">
          <Icon name="bolt" size={16} color="var(--color-gold)" />
        </button>

        <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#FF8F4D,#FF3D2E)] flex items-center justify-center font-bold text-sm text-[#1A0A03] shadow-[0_0_0_2px_var(--color-bg-primary),0_0_0_3px_rgba(255,109,41,0.4)]">
          {initials || "?"}
        </div>
      </div>
    </header>
  );
}
