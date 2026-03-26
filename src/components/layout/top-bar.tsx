"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NavIcon } from "./nav-icon";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/planner": "Planner",
  "/guilds": "Guilds",
  "/side-quests": "Side Quests",
  "/character": "Character",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) return title;
  }
  return "Wave Plan";
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
  const title = getPageTitle(pathname);
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
    <header className="h-12 flex items-center justify-between px-5 border-b border-border bg-bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary font-[family-name:var(--font-heading)]">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors cursor-pointer">
          <NavIcon name="search" size={15} />
        </button>
        <div className="w-7 h-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-[10px] font-semibold text-text-secondary">
          {initials || "?"}
        </div>
      </div>
    </header>
  );
}
