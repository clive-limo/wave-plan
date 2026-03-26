"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getGuild, updateGuild, deleteGuild } from "@/lib/supabase/queries/guilds";
import { getTasksByGuild, createTask, updateTask, deleteTask } from "@/lib/supabase/queries/tasks";
import { calculateXp } from "@/lib/xp";
import { Guild, Task, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "@/components/tasks/task-form";
import { GuildForm } from "@/components/guilds/guild-form";
import { SkeletonRow } from "@/components/ui/skeleton";
import { getTaskProgress } from "@/lib/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { NavIcon } from "@/components/layout/nav-icon";
import { useCelebration } from "@/contexts/celebration-context";

export default function GuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [guild, setGuild] = useState<Guild | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [g, t] = await Promise.all([
      getGuild(supabase, id),
      getTasksByGuild(supabase, id),
    ]);
    setGuild(g);
    setTasks(t);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddTask(data: { title: string; description?: string; priority: Priority; start_date?: string; due_date?: string; total_hours?: number; daily_hours?: number }) {
    const supabase = createClient();
    const task = await createTask(supabase, { ...data, guild_id: id });
    setTasks((prev) => [task, ...prev]);
    setShowAddTask(false);
  }

  const { celebrate } = useCelebration();

  async function handleStatusChange(taskId: string, status: Task["status"], position?: { x: number; y: number }) {
    const supabase = createClient();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = { status };
    if (status === "done" && !task.xp_awarded) {
      const isOverdue = task.due_date ? new Date(task.due_date) < new Date() : false;
      const xp = calculateXp(task.priority, isOverdue, 0);
      updates.xp_awarded = xp;
      updates.completed_at = new Date().toISOString();

      const updated = await updateTask(supabase, taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      await celebrate({ xp, priority: task.priority, position });
      return;
    }
    if (status !== "done") {
      updates.xp_awarded = null;
      updates.completed_at = null;
    }

    const updated = await updateTask(supabase, taskId, updates);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }

  async function handleDeleteTask(taskId: string) {
    const supabase = createClient();
    await deleteTask(supabase, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function handleEditGuild(data: { name: string; color: string; icon: string }) {
    const supabase = createClient();
    const updated = await updateGuild(supabase, id, data);
    setGuild(updated);
    setShowEdit(false);
  }

  async function handleDeleteGuild() {
    if (!confirm("Delete this guild and all its tasks?")) return;
    const supabase = createClient();
    await deleteGuild(supabase, id);
    router.push("/guilds");
  }

  if (loading || !guild) {
    return (
      <div className="animate-fade-in">
        <div className="h-1 rounded-full bg-bg-elevated mb-6" />
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="h-7 w-40 animate-shimmer rounded" />
        </div>
        {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="animate-fade-in">
      {/* Color accent bar */}
      <div className="h-1 rounded-full mb-6" style={{ backgroundColor: guild.color }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: guild.color }}>
          {guild.name}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDeleteGuild}>Delete</Button>
          <Button size="sm" onClick={() => setShowAddTask(true)}>Add Task</Button>
        </div>
      </div>

      {/* Tasks as table-like rows */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<NavIcon name="calendar" size={24} />}
          title="No tasks yet"
          description={`Add tasks to ${guild.name} to start tracking your work and earning XP.`}
          action={<Button onClick={() => setShowAddTask(true)}>Add your first task</Button>}
        />
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider bg-bg-card">
            <span className="w-5" />
            <span className="flex-1">Task</span>
            <span className="w-16 text-center">Priority</span>
            <span className="w-20 text-right">Due</span>
            <span className="w-20 text-right">Progress</span>
            <span className="w-6" />
          </div>
          {active.map((task) => (
            <TaskTableRow
              key={task.id}
              task={task}
              guildColor={guild.color}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          ))}
          {done.length > 0 && (
            <>
              <div className="px-4 py-2 bg-bg-card">
                <span className="text-xs text-text-muted">Completed ({done.length})</span>
              </div>
              {done.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  guildColor={guild.color}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </>
          )}
        </div>
      )}

      <Modal open={showAddTask} onClose={() => setShowAddTask(false)} title="New Task">
        <TaskForm onSubmit={handleAddTask} onCancel={() => setShowAddTask(false)} />
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Guild">
        <GuildForm
          initial={{ name: guild.name, color: guild.color, icon: guild.icon }}
          onSubmit={handleEditGuild}
          onCancel={() => setShowEdit(false)}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}

function TaskTableRow({
  task,
  guildColor,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  guildColor: string;
  onStatusChange: (id: string, status: Task["status"], position?: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
}) {
  const isDone = task.status === "done";

  function formatDate(date: string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-elevated/50 transition-colors ${isDone ? "opacity-50" : ""}`}>
      <button
        onClick={(e) => onStatusChange(task.id, isDone ? "todo" : "done", { x: e.clientX, y: e.clientY })}
        className={`
          w-4 h-4 rounded-full border-2 flex-shrink-0 cursor-pointer transition-colors
          ${isDone ? "bg-hp-high border-hp-high" : "border-border-light hover:border-text-secondary"}
        `}
        style={!isDone ? { borderColor: `${guildColor}60` } : {}}
      />
      <span className={`flex-1 truncate ${isDone ? "line-through text-text-muted" : ""}`}>
        {task.title}
      </span>
      <span className="w-16 text-center">
        <Badge variant={task.priority}>{task.priority}</Badge>
      </span>
      <span className="w-20 text-right text-xs text-text-muted">{formatDate(task.due_date)}</span>
      <span className="w-20 text-right flex-shrink-0">
        {task.total_hours ? (
          <span className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-text-muted">{task.actual_hours ?? 0}/{task.total_hours}h</span>
            <span className="w-full h-[3px] bg-bg-primary rounded-full overflow-hidden">
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${(getTaskProgress(task) ?? 0) * 100}%`, backgroundColor: guildColor }}
              />
            </span>
          </span>
        ) : (
          <span className="text-xs text-text-muted">-</span>
        )}
      </span>
      {onDelete && !isDone ? (
        <button
          onClick={() => onDelete(task.id)}
          className="w-6 text-center text-text-muted hover:text-hp-low cursor-pointer transition-colors"
        >
          &times;
        </button>
      ) : (
        <span className="w-6" />
      )}
    </div>
  );
}
