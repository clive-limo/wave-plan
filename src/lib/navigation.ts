export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Planner", href: "/planner", icon: "calendar" },
  { label: "Guilds", href: "/guilds", icon: "shield" },
  { label: "Side Quests", href: "/side-quests", icon: "compass" },
  { label: "Character", href: "/character", icon: "user" },
];
