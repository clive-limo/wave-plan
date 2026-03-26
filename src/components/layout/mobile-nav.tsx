"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { NavIcon } from "./nav-icon";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card border-t border-border">
      <ul className="flex justify-around py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors relative
                  ${isActive ? "text-text-primary" : "text-text-muted"}
                `}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-5 h-0.5 rounded-full bg-text-primary" />
                )}
                <NavIcon name={item.icon} size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
