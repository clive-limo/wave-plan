import { Task } from "@/lib/types";

interface TimeBlockProps {
  task: Task;
  hours: number;
  guildColor?: string;
  guildName?: string;
  /** Height in pixels — for time-grid positioning */
  height?: number;
  /** Top offset in pixels — for time-grid positioning */
  top?: number;
}

export function TimeBlock({
  task,
  hours,
  guildColor = "#5b8def",
  guildName,
  height,
  top,
}: TimeBlockProps) {
  const isPositioned = height !== undefined && top !== undefined;

  return (
    <div
      className={`
        px-2.5 py-1.5 rounded-md text-xs border-l-2 bg-bg-elevated
        transition-colors hover:bg-bg-hover overflow-hidden
        ${isPositioned ? "absolute left-0 right-0 mx-1" : "mb-1"}
      `}
      style={{
        borderLeftColor: guildColor,
        ...(isPositioned ? { height: `${height}px`, top: `${top}px` } : {}),
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-text-primary">{task.title}</span>
        <span className="text-text-muted flex-shrink-0">{hours}h</span>
      </div>
      {guildName && (
        <span className="text-text-muted" style={{ color: `${guildColor}aa` }}>
          {guildName}
        </span>
      )}
    </div>
  );
}
