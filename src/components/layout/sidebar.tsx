"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "@/lib/navigation";
import { Icon } from "@/components/ui/icon";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { Logo } from "@/components/ui/logo";
import { Sticker } from "@/components/ui/sticker";
import { getLevelInfo, getXpProgress } from "@/lib/levels";
import { Profile } from "@/lib/types";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, expanded, toggle, setHovered, mounted } = useSidebar();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as Profile);
    })();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const xpProgress = getXpProgress(totalXp);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        hidden md:flex flex-col h-screen sticky top-0 z-10
        border-r border-border overflow-hidden flex-shrink-0
        transition-[width] duration-200 ease-in-out
        bg-[linear-gradient(180deg,#14100A_0%,#0E0A07_100%)]
        ${isOpen ? "w-[248px]" : "w-[76px]"}
      `}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex-shrink-0">
        {isOpen ? <Logo size={28} /> : <Logo size={32} withText={false} />}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={!isOpen ? item.label : undefined}
                  className={`
                    relative flex items-center gap-3 rounded-2xl whitespace-nowrap
                    transition-colors
                    ${isOpen ? "px-3.5 py-3" : "p-3 justify-center"}
                    ${isActive
                      ? "text-text-primary bg-[linear-gradient(90deg,rgba(255,109,41,0.20)_0%,rgba(255,109,41,0.06)_100%)] shadow-[0_0_0_1px_rgba(255,109,41,0.35)_inset]"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }
                  `}
                >
                  {isActive && isOpen && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sun shadow-[0_0_12px_var(--color-sun)]" />
                  )}
                  <Icon
                    name={item.icon}
                    size={20}
                    color={isActive ? "var(--color-sun)" : "currentColor"}
                  />
                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-text-faint truncate leading-tight mt-0.5">
                        {item.sublabel}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* XP mini-card */}
      {isOpen && profile && (
        <div className="mx-3 mb-2 p-3.5 rounded-2xl bg-[linear-gradient(180deg,rgba(255,109,41,0.10)_0%,rgba(255,109,41,0.02)_100%)] shadow-[0_0_0_1px_rgba(255,109,41,0.2)_inset]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Sticker shape="star" color="#FFC857" size={32} expression="happy" />
            <div className="flex-1 min-w-0">
              <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-wider">
                Level {levelInfo.level}
              </div>
              <div className="text-[13px] font-semibold truncate">
                {levelInfo.title}
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#FFC857,#FF6D29)] shadow-[0_0_10px_var(--color-sun)] transition-[width] duration-700"
              style={{ width: `${xpProgress * 100}%` }}
            />
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted mt-1.5 flex justify-between tabular-nums">
            <span>{totalXp} XP</span>
            <span>
              {Math.max(0, levelInfo.xpForNext - totalXp)} to lvl {levelInfo.level + 1}
            </span>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="px-3 pb-4 flex flex-col gap-1">
        <button
          onClick={handleLogout}
          title={!isOpen ? "Log out" : undefined}
          className={`
            flex items-center gap-3 rounded-xl text-sm
            text-text-secondary hover:text-text-primary hover:bg-white/5
            transition-colors cursor-pointer whitespace-nowrap
            ${isOpen ? "px-3 py-2.5" : "p-2.5 justify-center"}
          `}
        >
          <Icon name="logout" size={16} />
          {isOpen && <span>Sign out</span>}
        </button>

        {mounted && (
          <button
            onClick={toggle}
            title={expanded ? "Collapse" : "Pin sidebar"}
            className={`
              flex items-center gap-3 rounded-xl text-sm
              text-text-muted hover:text-text-secondary hover:bg-white/5
              transition-colors cursor-pointer whitespace-nowrap
              ${isOpen ? "px-3 py-2.5" : "p-2.5 justify-center"}
            `}
          >
            <Icon name={expanded ? "collapse" : "expand"} size={16} />
            {isOpen && <span>{expanded ? "Collapse" : "Pin sidebar"}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
