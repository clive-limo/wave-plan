"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Task, Guild, TaskDayLog } from "@/lib/types";
import { toDateString, isToday, formatDayShort } from "@/lib/date-utils";
import { getTaskProgress } from "@/lib/progress";

const START_HOUR = 4;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 48;

interface WeekViewProps {
  dates: Date[];
  tasks: Task[];
  guilds: Map<string, Guild>;
  dayLogs: TaskDayLog[];
  onTaskClick?: (task: Task, date: string, scheduledHour: number | null) => void;
  onSlotClick?: (date: string, hour: number) => void;
  onDropTask?: (taskId: string, date: string, hour: number) => void;
  onCompleteDayBlock?: (taskId: string, date: string) => void;
}

interface PositionedTask {
  task: Task;
  hours: number;
  topPx: number;
  heightPx: number;
  guildColor: string;
  guildName: string;
  scheduledHour: number | null;
  isDayCompleted: boolean;
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function getTasksForDay(tasks: Task[], dateStr: string) {
  return tasks.filter((task) => {
    if (!task.start_date && !task.due_date) return false;
    const start = task.start_date ?? task.due_date!;
    const end = task.due_date ?? start;
    return dateStr >= start && dateStr <= end;
  });
}

function positionTasks(
  dayTasks: Task[],
  guilds: Map<string, Guild>,
  dayLogs: TaskDayLog[],
  dateStr: string
): PositionedTask[] {
  const logMap = new Map<string, TaskDayLog>();
  for (const log of dayLogs) {
    if (log.date === dateStr) logMap.set(log.task_id, log);
  }

  const scheduled: { task: Task; hour: number }[] = [];
  const unscheduled: Task[] = [];

  // Also track completed status per task
  const completedMap = new Map<string, boolean>();

  for (const task of dayTasks) {
    const realId = task.id.includes("__") ? task.id.split("__")[0] : task.id;
    const log = logMap.get(realId);
    completedMap.set(task.id, log?.completed ?? false);
    if (log?.scheduled_hour != null) {
      scheduled.push({ task, hour: log.scheduled_hour });
    } else {
      unscheduled.push(task);
    }
  }

  scheduled.sort((a, b) => a.hour - b.hour);

  const positioned: PositionedTask[] = [];
  const occupiedRanges: [number, number][] = [];

  for (const { task, hour } of scheduled) {
    const hours = task.daily_hours ?? 1;
    const guild = task.guild_id ? guilds.get(task.guild_id) : null;
    positioned.push({
      task, hours,
      topPx: (hour - START_HOUR) * HOUR_HEIGHT,
      heightPx: Math.max(hours * HOUR_HEIGHT - 4, 24),
      guildColor: guild?.color ?? "#c9a84c",
      guildName: guild?.name ?? "Side Quest",
      scheduledHour: hour,
      isDayCompleted: completedMap.get(task.id) ?? false,
    });
    occupiedRanges.push([hour, hour + hours]);
  }

  let cursor = START_HOUR;
  for (const task of unscheduled) {
    const hours = task.daily_hours ?? 1;
    while (cursor + hours <= END_HOUR) {
      const overlaps = occupiedRanges.some(([s, e]) => cursor < e && cursor + hours > s);
      if (!overlaps) break;
      cursor += 0.5;
    }
    if (cursor + hours > END_HOUR) break;

    const guild = task.guild_id ? guilds.get(task.guild_id) : null;
    positioned.push({
      task, hours,
      topPx: (cursor - START_HOUR) * HOUR_HEIGHT,
      heightPx: Math.max(hours * HOUR_HEIGHT - 4, 24),
      guildColor: guild?.color ?? "#c9a84c",
      guildName: guild?.name ?? "Side Quest",
      scheduledHour: null,
      isDayCompleted: completedMap.get(task.id) ?? false,
    });
    occupiedRanges.push([cursor, cursor + hours]);
    cursor += hours;
  }

  return positioned;
}

function getCurrentTimePosition(): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  return (hour - START_HOUR) * HOUR_HEIGHT;
}

const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

export function WeekView({ dates, tasks, guilds, dayLogs, onTaskClick, onSlotClick, onDropTask, onCompleteDayBlock }: WeekViewProps) {
  const [dragOverInfo, setDragOverInfo] = useState<{ date: string; hour: number } | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ date: string; hour: number } | null>(null);
  const [timeLineTop, setTimeLineTop] = useState(getCurrentTimePosition);
  const dragSourceDate = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);

  // Update time line every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLineTop(getCurrentTimePosition());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (didScroll.current || !scrollRef.current) return;
    const scrollTarget = Math.max(0, getCurrentTimePosition() - 100);
    scrollRef.current.scrollTop = scrollTarget;
    didScroll.current = true;
  }, []);

  const calcDropHour = useCallback((e: React.DragEvent, colEl: HTMLElement) => {
    const rect = colEl.getBoundingClientRect();
    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0);
    const rawHour = START_HOUR + Math.floor(y / HOUR_HEIGHT * 2) / 2;
    return Math.max(START_HOUR, Math.min(rawHour, END_HOUR - 0.5));
  }, []);

  function handleDragStart(e: React.DragEvent, taskId: string, date: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    dragSourceDate.current = date;
    setDraggingTaskId(taskId);
  }

  function handleDragOver(e: React.DragEvent, date: string) {
    if (dragSourceDate.current !== date) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const hour = calcDropHour(e, e.currentTarget as HTMLElement);
    setDragOverInfo({ date, hour });
  }

  function handleDrop(e: React.DragEvent, date: string) {
    e.preventDefault();
    if (dragSourceDate.current !== date) return;
    const taskId = e.dataTransfer.getData("text/plain");
    const hour = calcDropHour(e, e.currentTarget as HTMLElement);
    setDragOverInfo(null);
    setDraggingTaskId(null);
    dragSourceDate.current = null;
    onDropTask?.(taskId, date, hour);
  }

  function handleDragEnd() {
    setDragOverInfo(null);
    setDraggingTaskId(null);
    dragSourceDate.current = null;
  }

  const showTimeLine = timeLineTop >= 0 && timeLineTop <= TOTAL_HOURS * HOUR_HEIGHT;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-border bg-bg-card">
        <div className="w-16 flex-shrink-0 border-r border-border" />
        {dates.map((date) => {
          const today = isToday(date);
          return (
            <div
              key={toDateString(date)}
              className={`flex-1 min-w-[100px] text-center py-2.5 border-r border-border last:border-r-0 ${today ? "bg-bg-elevated/50" : ""}`}
            >
              <p className="text-xs text-text-muted">{formatDayShort(date)}</p>
              <p className={`text-sm font-medium ${today ? "text-text-primary" : "text-text-secondary"}`}>
                {date.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-auto"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <div className="flex" style={{ minHeight: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 border-r border-border relative">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="border-b border-border last:border-b-0 flex items-start justify-end pr-2 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-text-muted">{formatHourLabel(hour)}</span>
              </div>
            ))}
            {/* Time line dot in the label column */}
            {showTimeLine && (
              <div
                className="absolute right-0 z-30 pointer-events-none"
                style={{ top: timeLineTop }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-hp-low -translate-y-1/2 translate-x-1/2" />
              </div>
            )}
          </div>

          {/* Day columns */}
          {dates.map((date) => {
            const dateStr = toDateString(date);
            const dayTasks = getTasksForDay(tasks, dateStr);
            const positioned = positionTasks(dayTasks, guilds, dayLogs, dateStr);
            const today = isToday(date);
            const isDropTarget = dragOverInfo?.date === dateStr;

            return (
              <div
                key={dateStr}
                className={`flex-1 min-w-[100px] border-r border-border last:border-r-0 relative ${today ? "bg-bg-elevated/20" : ""}`}
                style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => { setDragOverInfo(null); setHoverInfo(null); }}
                onDrop={(e) => handleDrop(e, dateStr)}
                onMouseMove={(e) => {
                  if (draggingTaskId) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = START_HOUR + Math.floor(y / HOUR_HEIGHT);
                  if (hour >= START_HOUR && hour < END_HOUR) {
                    setHoverInfo({ date: dateStr, hour });
                  }
                }}
                onMouseLeave={() => setHoverInfo(null)}
                onClick={(e) => {
                  if (!onSlotClick) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = START_HOUR + Math.floor(y / HOUR_HEIGHT);
                  onSlotClick(dateStr, hour);
                }}
              >
                {/* Hour grid lines */}
                {timeSlots.map((hour, i) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-border"
                    style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT - 1 }}
                  />
                ))}

                {/* Current time line — today only */}
                {today && showTimeLine && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none"
                    style={{ top: timeLineTop }}
                  >
                    <div className="h-[2px] bg-hp-low w-full" />
                  </div>
                )}

                {/* Drop indicator */}
                {isDropTarget && dragOverInfo && (
                  <div
                    className="absolute left-1 right-1 border-2 border-dashed border-gold/40 rounded-md pointer-events-none z-10"
                    style={{
                      top: (dragOverInfo.hour - START_HOUR) * HOUR_HEIGHT,
                      height: HOUR_HEIGHT,
                    }}
                  />
                )}

                {/* Hover indicator */}
                {!draggingTaskId && hoverInfo?.date === dateStr && !isDropTarget && (
                  <div
                    className="absolute left-1 right-1 rounded-md pointer-events-none z-10 border border-dashed border-border-light bg-white/[0.03] flex items-center justify-center"
                    style={{
                      top: (hoverInfo.hour - START_HOUR) * HOUR_HEIGHT + 1,
                      height: HOUR_HEIGHT - 2,
                    }}
                  >
                    <span className="text-[10px] text-text-muted">+ New</span>
                  </div>
                )}

                {/* Task blocks */}
                {positioned.map(({ task, hours, topPx, heightPx, guildColor, guildName, scheduledHour, isDayCompleted }) => {
                  const progress = getTaskProgress(task);
                  return (
                  <div
                    key={task.id}
                    draggable={!isDayCompleted}
                    onDragStart={(e) => handleDragStart(e, task.id, dateStr)}
                    onDragEnd={handleDragEnd}
                    onMouseMove={(e) => { e.stopPropagation(); setHoverInfo(null); }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task, dateStr, scheduledHour);
                    }}
                    className={`
                      absolute left-1 right-1 rounded-md border-l-2 bg-bg-elevated
                      hover:bg-bg-hover transition-colors overflow-hidden px-2 py-1
                      select-none z-20 group/block
                      ${isDayCompleted ? "opacity-50" : "cursor-grab active:cursor-grabbing"}
                      ${draggingTaskId === task.id ? "opacity-40" : ""}
                    `}
                    style={{
                      top: topPx + 1,
                      height: heightPx,
                      borderLeftColor: guildColor,
                    }}
                  >
                    {/* Complete day button */}
                    {!isDayCompleted && onCompleteDayBlock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteDayBlock(task.id, dateStr);
                        }}
                        className="absolute top-1 right-1 w-4 h-4 rounded-sm border border-border-light text-transparent hover:border-hp-high hover:text-hp-high opacity-0 group-hover/block:opacity-100 transition-all cursor-pointer flex items-center justify-center text-[8px] z-30"
                        title="Mark today's block as complete"
                      >
                        &#10003;
                      </button>
                    )}
                    {isDayCompleted && (
                      <span className="absolute top-1 right-1 text-[10px] text-hp-high">&#10003;</span>
                    )}

                    <p className={`text-xs font-medium truncate pr-5 ${isDayCompleted ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.is_recurring && <span className="opacity-50 mr-0.5">&#8634;</span>}
                      {task.title}
                    </p>
                    {heightPx > 36 && (
                      <p className="text-[10px] text-text-muted truncate" style={{ color: `${guildColor}aa` }}>
                        {guildName} &middot; {hours}h
                      </p>
                    )}

                    {/* Mini progress bar for multi-day tasks */}
                    {progress !== null && heightPx > 48 && (
                      <div className="absolute bottom-1 left-2 right-2 h-[2px] bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress * 100}%`, backgroundColor: guildColor }}
                        />
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
