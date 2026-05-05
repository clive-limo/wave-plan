export interface NavItem {
  label: string;
  sublabel: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", sublabel: "Today's wave", href: "/dashboard", icon: "dashboard" },
  { label: "Planner", sublabel: "Block your day", href: "/planner", icon: "planner" },
  { label: "Guilds", sublabel: "Your work crews", href: "/guilds", icon: "guild" },
  { label: "Side Quests", sublabel: "Life beyond work", href: "/side-quests", icon: "quest" },
  { label: "Character", sublabel: "Who you're becoming", href: "/character", icon: "character" },
  { label: "Settings", sublabel: "Tune your wave", href: "/settings", icon: "settings" },
];
