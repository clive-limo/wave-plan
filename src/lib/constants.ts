export const GUILD_COLORS = [
  { value: "#5b8def", label: "Blue" },
  { value: "#a78bfa", label: "Violet" },
  { value: "#f472b6", label: "Pink" },
  { value: "#4abe7a", label: "Green" },
  { value: "#d4a843", label: "Amber" },
  { value: "#e05252", label: "Red" },
  { value: "#38bdf8", label: "Sky" },
  { value: "#fb923c", label: "Orange" },
  { value: "#94a3b8", label: "Slate" },
  { value: "#c084fc", label: "Purple" },
];

export const GUILD_ICONS = [
  "briefcase", "code", "palette", "music", "book",
  "rocket", "heart", "star", "zap", "coffee",
  "globe", "camera", "wrench", "truck", "headphones",
];

export const QUEST_CATEGORIES = [
  { value: "fun", label: "Fun", icon: "sparkle" },
  { value: "learning", label: "Learning", icon: "book" },
  { value: "errands", label: "Errands", icon: "check" },
  { value: "health", label: "Health", icon: "heart" },
  { value: "other", label: "Other", icon: "star" },
] as const;
