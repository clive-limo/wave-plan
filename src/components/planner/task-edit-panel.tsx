"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Guild, Priority, TaskStatus, QuestCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NavIcon } from "@/components/layout/nav-icon";

interface CreateTaskData {
  guild_id: string | null;
  title: string;
  description?: string;
  priority: Priority;
  category?: QuestCategory;
  start_date?: string;
  due_date?: string;
  total_hours?: number;
  daily_hours?: number;
}

interface TaskEditPanelProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onCreate?: (data: CreateTaskData) => Promise<void>;
  onDelete?: (taskId: string) => void;
  guilds: Guild[];
  scheduledHour?: number | null;
  scheduledDate?: string | null;
}

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const CATEGORY_OPTIONS = [
  { value: "fun", label: "Fun" },
  { value: "learning", label: "Learning" },
  { value: "errands", label: "Errands" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

function generateTimeOptions() {
  const options = [];
  for (let h = 4; h <= 22; h++) {
    options.push({ value: String(h), label: formatHour(h) });
    if (h < 22) {
      options.push({ value: String(h + 0.5), label: formatHour(h + 0.5) });
    }
  }
  return options;
}

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = h % 1 === 0.5 ? "30" : "00";
  if (hour === 0) return `12:${min} AM`;
  if (hour < 12) return `${hour}:${min} AM`;
  if (hour === 12) return `12:${min} PM`;
  return `${hour - 12}:${min} PM`;
}

const TIME_OPTIONS = generateTimeOptions();

export function TaskEditPanel({
  task,
  open,
  onClose,
  onSave,
  onCreate,
  onDelete,
  guilds,
  scheduledHour,
  scheduledDate,
}: TaskEditPanelProps) {
  const isCreate = !task;

  const [guildId, setGuildId] = useState<string>("side-quest");
  const [category, setCategory] = useState<QuestCategory>("other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const isSideQuest = guildId === "side-quest";

  const resetForm = useCallback(() => {
    if (task) {
      setGuildId(task.guild_id ?? "side-quest");
      setCategory((task.category as QuestCategory) ?? "other");
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setStartDate(task.start_date ?? "");
      setDueDate(task.due_date ?? "");
      setTotalHours(task.total_hours?.toString() ?? "");
      setDailyHours(task.daily_hours?.toString() ?? "");
      setTimeSlot(scheduledHour != null ? String(scheduledHour) : "");
    } else {
      setGuildId(guilds.length > 0 ? guilds[0].id : "side-quest");
      setCategory("other");
      setTitle("");
      setDescription("");
      setPriority("normal");
      setStatus("todo");
      setStartDate(scheduledDate ?? "");
      setDueDate(scheduledDate ?? "");
      setTotalHours("");
      setDailyHours("1");
      setTimeSlot(scheduledHour != null ? String(scheduledHour) : "");
    }
  }, [task, scheduledHour, scheduledDate, guilds]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (isCreate && onCreate) {
        await onCreate({
          guild_id: isSideQuest ? null : guildId,
          title,
          description: description || undefined,
          priority,
          category: isSideQuest ? category : undefined,
          start_date: startDate || undefined,
          due_date: dueDate || undefined,
          total_hours: totalHours ? parseFloat(totalHours) : undefined,
          daily_hours: dailyHours ? parseFloat(dailyHours) : undefined,
        });
      } else if (task) {
        await onSave(task.id, {
          guild_id: isSideQuest ? null : guildId,
          title,
          description: description || null,
          priority,
          status,
          start_date: startDate || null,
          due_date: dueDate || null,
          total_hours: totalHours ? parseFloat(totalHours) : null,
          daily_hours: dailyHours ? parseFloat(dailyHours) : null,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const guildOptions = [
    ...guilds.map((g) => ({ value: g.id, label: g.name })),
    { value: "side-quest", label: "Side Quest" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] bg-bg-card border-l border-border flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold font-[family-name:var(--font-heading)] truncate">
            {isCreate ? "New Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <NavIcon name="chevron-right" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {/* Guild / Side Quest selector */}
            <Select
              label="Assign to"
              options={guildOptions}
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
            />

            {isSideQuest && (
              <Select
                label="Category"
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
              />
            )}

            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes, context..." />

            <div className="grid grid-cols-2 gap-3">
              <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={(e) => setPriority(e.target.value as Priority)} />
              {!isCreate && (
                <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Total hours" type="number" min="0" step="0.5" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
              <Input label="Hours per day" type="number" min="0" step="0.5" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} />
            </div>

            <Select
              label="Scheduled time"
              options={[{ value: "", label: "Auto (stack)" }, ...TIME_OPTIONS]}
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            />

            {scheduledDate && (
              <p className="text-xs text-text-muted">
                Scheduling for {new Date(scheduledDate + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0">
          <div>
            {!isCreate && onDelete && task && (
              <Button variant="danger" size="sm" onClick={() => { onDelete(task.id); onClose(); }}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { resetForm(); onClose(); }}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading || !title.trim()}>
              {loading ? (isCreate ? "Creating..." : "Saving...") : (isCreate ? "Create" : "Save")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
