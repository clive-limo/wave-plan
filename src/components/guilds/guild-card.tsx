import Link from "next/link";
import { Guild } from "@/lib/types";

const ICON_MAP: Record<string, string> = {
  briefcase: "\uD83D\uDCBC",
  code: "\uD83D\uDCBB",
  palette: "\uD83C\uDFA8",
  book: "\uD83D\uDCDA",
  rocket: "\uD83D\uDE80",
  star: "\u2B50",
  zap: "\u26A1",
  coffee: "\u2615",
  globe: "\uD83C\uDF0D",
  wrench: "\uD83D\uDD27",
  music: "\uD83C\uDFB5",
  heart: "\u2764\uFE0F",
};

interface GuildCardProps {
  guild: Guild;
  taskCount?: number;
}

export function GuildCard({ guild, taskCount = 0 }: GuildCardProps) {
  const emoji = ICON_MAP[guild.icon] ?? "\uD83D\uDCBC";

  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="block p-4 rounded-lg border border-border bg-bg-card hover:bg-bg-elevated transition-colors group"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: `${guild.color}20` }}
        >
          {emoji}
        </span>
        <div>
          <h3
            className="font-medium group-hover:text-text-primary transition-colors font-[family-name:var(--font-heading)]"
            style={{ color: guild.color }}
          >
            {guild.name}
          </h3>
          <p className="text-xs text-text-muted">
            {taskCount} active {taskCount === 1 ? "task" : "tasks"}
          </p>
        </div>
      </div>
      <div
        className="h-1 rounded-full"
        style={{ backgroundColor: `${guild.color}30` }}
      />
    </Link>
  );
}
