"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { Icon } from "@/components/ui/icon";

export function MobileNav() {
  const pathname = usePathname();
  // Bottom bar shows the first 5 nav items (Settings is sidebar-only on mobile)
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(14,10,7,0.95)] backdrop-blur-xl border-t border-border pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <ul className="flex justify-around items-center max-w-[600px] mx-auto px-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]
                  transition-colors
                  ${isActive ? "text-sun" : "text-text-secondary"}
                `}
              >
                {isActive && (
                  <span className="absolute -top-2.5 w-6 h-[3px] rounded-full bg-sun shadow-[0_0_8px_var(--color-sun)]" />
                )}
                <Icon name={item.icon} size={20} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
