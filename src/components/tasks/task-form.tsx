"use client";

import { useState, useEffect } from "react";
import { Priority, QuestCategory, RecurrenceRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RecurrencePicker } from "./recurrence-picker";

export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  category?: QuestCategory;
  start_date?: string;
  due_date?: string;
  total_hours?: number;
  daily_hours?: number;
  is_recurring?: boolean;
  recurrence_rule?: string;
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  showCategory?: boolean;
  initial?: Partial<TaskFormData>;
  submitLabel?: string;
}

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "low", label: "Low" },
];

const CATEGORY_OPTIONS = [
  { value: "fun", label: "Fun" },
  { value: "learning", label: "Learning" },
  { value: "errands", label: "Errands" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

export function TaskForm({ onSubmit, onCancel, showCategory, initial, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "normal");
  const [category, setCategory] = useState<QuestCategory>(initial?.category ?? "other");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [totalHours, setTotalHours] = useState(initial?.total_hours?.toString() ?? "");
  const [dailyHours, setDailyHours] = useState(initial?.daily_hours?.toString() ?? "");
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(() => {
    if (initial?.recurrence_rule) {
      try { return JSON.parse(initial.recurrence_rule); } catch { /* fallthrough */ }
    }
    return { frequency: "daily" };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setDescription(initial.description ?? "");
      setPriority(initial.priority ?? "normal");
      setCategory(initial.category ?? "other");
      setStartDate(initial.start_date ?? "");
      setDueDate(initial.due_date ?? "");
      setTotalHours(initial.total_hours?.toString() ?? "");
      setDailyHours(initial.daily_hours?.toString() ?? "");
      setIsRecurring(initial.is_recurring ?? false);
      if (initial.recurrence_rule) {
        try { setRecurrenceRule(JSON.parse(initial.recurrence_rule)); } catch { /* ignore */ }
      }
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        priority,
        category: showCategory ? category : undefined,
        start_date: isRecurring ? undefined : (startDate || undefined),
        due_date: isRecurring ? undefined : (dueDate || undefined),
        total_hours: isRecurring ? undefined : (totalHours ? parseFloat(totalHours) : undefined),
        daily_hours: dailyHours ? parseFloat(dailyHours) : undefined,
        is_recurring: isRecurring,
        recurrence_rule: isRecurring ? JSON.stringify(recurrenceRule) : undefined,
      });
      if (!initial) {
        setTitle("");
        setDescription("");
        setPriority("normal");
        setStartDate("");
        setDueDate("");
        setTotalHours("");
        setDailyHours("");
        setIsRecurring(false);
        setRecurrenceRule({ frequency: "daily" });
      }
    } finally {
      setLoading(false);
    }
  }

  const isEdit = !!initial;
  const label = submitLabel ?? (isEdit ? "Save" : "Add Task");
  const loadingLabel = isEdit ? "Saving..." : "Creating...";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required />
      <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details, notes, context..." />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={(e) => setPriority(e.target.value as Priority)} />
        {showCategory && (
          <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value as QuestCategory)} />
        )}
      </div>

      {/* Recurring toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-border accent-gold"
        />
        <span className="text-sm text-text-secondary">Repeat this task</span>
      </label>

      {isRecurring ? (
        <>
          <RecurrencePicker rule={recurrenceRule} onChange={setRecurrenceRule} />
          <Input label="Hours per occurrence" type="number" min="0" step="0.5" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} placeholder="e.g. 1" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total hours" type="number" min="0" step="0.5" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} placeholder="e.g. 14" />
            <Input label="Hours per day" type="number" min="0" step="0.5" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} placeholder="e.g. 2" />
          </div>
          {totalHours && dailyHours && parseFloat(dailyHours) > 0 && (
            <p className="text-xs text-text-muted">
              This task will span ~{Math.ceil(parseFloat(totalHours) / parseFloat(dailyHours))} days on your planner.
            </p>
          )}
        </>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {isEdit ? "Discard" : "Cancel"}
          </Button>
        )}
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? loadingLabel : label}
        </Button>
      </div>
    </form>
  );
}
