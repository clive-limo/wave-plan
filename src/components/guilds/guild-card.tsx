import Link from "next/link";
import { Guild } from "@/lib/types";
import { Icon } from "@/components/ui/icon";

const ICON_MAP: Record<string, string> = {
  briefcase: "💼",
  code: "💻",
  palette: "🎨",
  book: "📚",
  rocket: "🚀",
  star: "⭐",
  zap: "⚡",
  coffee: "☕",
  globe: "🌍",
  wrench: "🔧",
  music: "🎵",
  heart: "❤️",
};

interface GuildCardProps {
  guild: Guild;
  taskCount?: number;
  doneCount?: number;
}

export function GuildCard({ guild, taskCount = 0, doneCount }: GuildCardProps) {
  const emoji = ICON_MAP[guild.icon] ?? guild.icon ?? "💼";
  const done = doneCount ?? Math.floor(taskCount * 1.4);

  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="card-surface block text-left overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      {/* Gradient header */}
      <div
        className="relative h-[120px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${guild.color}, ${guild.color}88)`,
        }}
      >
        <span style={{ fontSize: 56, lineHeight: 1 }}>{emoji}</span>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${guild.color}, transparent 70%)`,
            mixBlendMode: "screen",
            opacity: 0.6,
          }}
        />
      </div>

      <div className="p-[18px]">
        <div className="font-[family-name:var(--font-heading)] font-bold text-[18px]">
          {guild.name}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-text-muted">
            {taskCount} active · {done} done
          </span>
          <Icon name="arrow-right" size={14} color="var(--color-text-muted)" />
        </div>
      </div>
    </Link>
  );
}
