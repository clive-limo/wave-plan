"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGuilds } from "@/lib/supabase/queries/guilds";
import { getActiveTasks, updateTask, createTask } from "@/lib/supabase/queries/tasks";
import { getDayLogs, updateDayLogHour, completeDayLog } from "@/lib/supabase/queries/planner";
import { Guild, Task, TaskDayLog } from "@/lib/types";
import { getWeekDates, toDateString, formatWeekRange, formatMonthYear } from "@/lib/date-utils";
import { PlannerNav } from "@/components/planner/planner-nav";
import { WeekView } from "@/components/planner/week-view";
import { DayView } from "@/components/planner/day-view";
import { MonthView } from "@/components/planner/month-view";
import { TaskEditPanel } from "@/components/planner/task-edit-panel";
import { SkeletonDayRows, SkeletonTimeGrid } from "@/components/ui/skeleton";
import { expandRecurringTasks } from "@/lib/recurrence";
import { useCelebration } from "@/contexts/celebration-context";
import { calculateDayBlockXp } from "@/lib/xp";

type ViewMode = "day" | "week" | "month";

export default function PlannerPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [guilds, setGuilds] = useState<Map<string, Guild>>(new Map());
  const [dayLogs, setDayLogs] = useState<TaskDayLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit panel state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelHour, setPanelHour] = useState<number | null>(null);
  const [panelDate, setPanelDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const weekDates = getWeekDates(currentDate);
    const startStr = toDateString(weekDates[0]);
    const endStr = toDateString(weekDates[6]);

    const [guildList, taskList, logs] = await Promise.all([
      getGuilds(supabase),
      getActiveTasks(supabase),
      getDayLogs(supabase, startStr, endStr),
    ]);
    setGuilds(new Map(guildList.map((g) => [g.id, g])));
    setTasks(taskList);
    setDayLogs(logs);
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    load();
  }, [load]);

  function navigate(delta: number) {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  }

  function getTitle(): string {
    if (view === "day") return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (view === "week") return formatWeekRange(getWeekDates(currentDate));
    return formatMonthYear(currentDate);
  }

  function handleDayClick(date: Date) {
    setCurrentDate(date);
    setView("day");
  }

  function handleTaskClick(task: Task, date: string, scheduledHour: number | null) {
    // For recurring virtual tasks, find the original task for editing
    const realId = task.id.includes("__") ? task.id.split("__")[0] : task.id;
    const realTask = tasks.find((t) => t.id === realId) ?? task;
    setSelectedTask(realTask);
    setPanelDate(date);
    setPanelHour(scheduledHour);
    setPanelOpen(true);
  }

  function handleSlotClick(date: string, hour: number) {
    setSelectedTask(null);
    setPanelDate(date);
    setPanelHour(hour);
    setPanelOpen(true);
  }

  async function handleCreateTask(data: {
    guild_id: string | null;
    title: string;
    description?: string;
    priority: import("@/lib/types").Priority;
    category?: import("@/lib/types").QuestCategory;
    start_date?: string;
    due_date?: string;
    total_hours?: number;
    daily_hours?: number;
  }) {
    const supabase = createClient();
    const newTask = await createTask(supabase, data);
    setTasks((prev) => [newTask, ...prev]);

    // If a time slot was selected, schedule the task there
    if (panelHour != null && panelDate) {
      const log = await updateDayLogHour(
        supabase,
        newTask.id,
        panelDate,
        panelHour,
        newTask.daily_hours ?? 1
      );
      setDayLogs((prev) => [...prev, log]);
    }
  }

  async function handleSaveTask(taskId: string, updates: Partial<Task>) {
    const realId = taskId.includes("__") ? taskId.split("__")[0] : taskId;
    const supabase = createClient();
    const updated = await updateTask(supabase, realId, updates);
    setTasks((prev) => prev.map((t) => (t.id === realId ? updated : t)));
  }

  async function handleDropTask(virtualId: string, date: string, hour: number) {
    // Virtual IDs for recurring tasks are "realId__date" — extract the real ID
    const realId = virtualId.includes("__") ? virtualId.split("__")[0] : virtualId;
    const task = tasks.find((t) => t.id === realId);
    if (!task) return;

    const dailyHours = task.daily_hours ?? 1;
    if (hour + dailyHours > 22) return;

    const supabase = createClient();
    const log = await updateDayLogHour(supabase, realId, date, hour, dailyHours);

    setDayLogs((prev) => {
      const filtered = prev.filter((l) => !(l.task_id === realId && l.date === date));
      return [...filtered, log];
    });
  }

  function handleClosePanel() {
    setPanelOpen(false);
    setSelectedTask(null);
    setPanelHour(null);
    setPanelDate(null);
  }

  const { celebrate, celebratePerfectDay } = useCelebration();

  async function handleCompleteDayBlock(virtualId: string, date: string) {
    const realId = virtualId.includes("__") ? virtualId.split("__")[0] : virtualId;
    const task = tasks.find((t) => t.id === realId);
    if (!task) return;

    const dailyHours = task.daily_hours ?? 1;
    const supabase = createClient();

    // Mark day log as complete
    const log = await completeDayLog(supabase, realId, date, dailyHours);
    const updatedLogs = [...dayLogs.filter((l) => !(l.task_id === realId && l.date === date)), log];
    setDayLogs(updatedLogs);

    // Increment actual_hours on the parent task
    const newActual = (task.actual_hours ?? 0) + dailyHours;
    const updated = await updateTask(supabase, realId, { actual_hours: newActual });
    setTasks((prev) => prev.map((t) => (t.id === realId ? updated : t)));

    // Celebrate with day block XP
    const xp = calculateDayBlockXp(task.priority);
    await celebrate({ xp, priority: task.priority });

    // Check for Perfect Day: all today's blocks completed
    const today = toDateString(new Date());
    if (date === today) {
      const todayLogs = updatedLogs.filter((l) => l.date === today);
      const allComplete = todayLogs.length > 0 && todayLogs.every((l) => l.completed);
      if (allComplete) {
        const totalXp = todayLogs.length * xp;
        celebratePerfectDay({ blocksCompleted: todayLogs.length, totalXp });
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 pb-4 border-b border-border">
        <PlannerNav
          view={view}
          onViewChange={setView}
          title={getTitle()}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          onToday={() => setCurrentDate(new Date())}
        />
      </div>

      {(() => {
        if (loading) {
          return view === "week" ? <SkeletonTimeGrid /> : <SkeletonDayRows count={view === "day" ? 1 : 5} />;
        }

        const weekDates = getWeekDates(currentDate);
        const startStr = toDateString(weekDates[0]);
        const endStr = toDateString(weekDates[6]);
        const expandedTasks = expandRecurringTasks(tasks, startStr, endStr);

        return (
          <>
            {view === "week" && (
              <WeekView
                dates={weekDates}
                tasks={expandedTasks}
                guilds={guilds}
                dayLogs={dayLogs}
                onTaskClick={handleTaskClick}
                onSlotClick={handleSlotClick}
                onDropTask={handleDropTask}
                onCompleteDayBlock={handleCompleteDayBlock}
              />
            )}
            {view === "day" && (
              <DayView date={currentDate} tasks={expandedTasks} guilds={guilds} />
            )}
            {view === "month" && (
              <MonthView
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                tasks={expandedTasks}
                onDayClick={handleDayClick}
              />
            )}
          </>
        );
      })()}

      <TaskEditPanel
        task={selectedTask}
        open={panelOpen}
        onClose={handleClosePanel}
        onSave={handleSaveTask}
        onCreate={handleCreateTask}
        guilds={Array.from(guilds.values())}
        scheduledHour={panelHour}
        scheduledDate={panelDate}
      />
    </div>
  );
}
