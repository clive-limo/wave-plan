"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "@/lib/navigation";
import { NavIcon } from "./nav-icon";
import { useSidebar } from "@/lib/hooks/use-sidebar";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, expanded, toggle, setHovered, mounted } = useSidebar();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        hidden md:flex flex-col h-screen sticky top-0
        border-r border-border bg-bg-card
        transition-[width] duration-200 ease-in-out overflow-hidden
        ${isOpen ? "w-[220px]" : "w-[56px]"}
      `}
    >
      {/* Logo */}
      <div className="h-12 flex items-center border-b border-border px-4 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
            W
          </span>
          <span
            className={`
              text-sm font-bold tracking-tight font-[family-name:var(--font-heading)] whitespace-nowrap
              transition-opacity duration-200
              ${isOpen ? "opacity-100" : "opacity-0"}
            `}
          >
            Wave Plan
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={!isOpen ? item.label : undefined}
                  className={`
                    flex items-center gap-3 h-9 px-3 rounded-md text-sm transition-colors whitespace-nowrap
                    ${isActive
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    }
                  `}
                >
                  <NavIcon name={item.icon} size={16} />
                  <span
                    className={`
                      transition-opacity duration-200
                      ${isOpen ? "opacity-100" : "opacity-0 w-0"}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: toggle + logout */}
      <div className="border-t border-border py-2 px-2 flex flex-col gap-0.5">
        <button
          onClick={handleLogout}
          title={!isOpen ? "Log out" : undefined}
          className="flex items-center gap-3 h-9 px-3 w-full rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer whitespace-nowrap"
        >
          <NavIcon name="logout" size={16} />
          <span className={`transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
            Log out
          </span>
        </button>

        {mounted && (
          <button
            onClick={toggle}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center gap-3 h-9 px-3 w-full rounded-md text-sm text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors cursor-pointer whitespace-nowrap"
          >
            <NavIcon name={expanded ? "chevron-left" : "chevron-right"} size={16} />
            <span className={`transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
              {expanded ? "Collapse" : "Pin sidebar"}
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
