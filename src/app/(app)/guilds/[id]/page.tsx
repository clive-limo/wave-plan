"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getGuild, updateGuild, deleteGuild } from "@/lib/supabase/queries/guilds";
import { getTasksByGuild, createTask, updateTask, deleteTask } from "@/lib/supabase/queries/tasks";
import { calculateXp } from "@/lib/xp";
import { Guild, Task, Priority } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/tasks/task-form";
import { GuildForm } from "@/components/guilds/guild-form";
import { SkeletonRow } from "@/components/ui/skeleton";
import { getTaskProgress } from "@/lib/progress";
import { Icon } from "@/components/ui/icon";
import { useCelebration } from "@/contexts/celebration-context";

const ICON_MAP: Record<string, string> = {
  briefcase: "💼", code: "💻", palette: "🎨", book: "📚", rocket: "🚀",
  star: "⭐", zap: "⚡", coffee: "☕", globe: "🌍", wrench: "🔧",
  music: "🎵", heart: "❤️",
};

const PRIORITY_PILL: Record<Priority, string> = {
  urgent: "pill-red",
  normal: "pill-sun",
  low: "pill-leaf",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  normal: "Normal",
  low: "Chill",
};

export default function GuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [guild, setGuild] = useState<Guild | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

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

  useEffect(() => { load(); }, [load]);

  async function handleAddTask(data: {
    title: string;
    description?: string;
    priority: Priority;
    start_date?: string;
    due_date?: string;
    total_hours?: number;
    daily_hours?: number;
  }) {
    const supabase = createClient();
    const task = await createTask(supabase, { ...data, guild_id: id });
    setTasks((prev) => [task, ...prev]);
    setShowAddTask(false);
  }

  const { celebrate } = useCelebration();

  async function handleStatusChange(
    taskId: string,
    status: Task["status"],
    position?: { x: number; y: number }
  ) {
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
        <div className="h-1.5 rounded-full bg-bg-elevated mb-6" />
        {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const emoji = ICON_MAP[guild.icon] ?? guild.icon ?? "💼";

  return (
    <div className="animate-fade-in -mx-4 lg:-mx-6 xl:-mx-10 -mt-6">
      {/* Color bar */}
      <div
        className="h-1.5"
        style={{
          background: guild.color,
          boxShadow: `0 0 20px ${guild.color}`,
        }}
      />

      <div className="px-4 lg:px-6 xl:px-10 py-6 flex flex-col gap-5">
        <button
          onClick={() => router.push("/guilds")}
          className="btn btn-ghost self-start text-[13px]"
        >
          <Icon name="chevron-left" size={14} /> All crews
        </button>

        <div className="flex items-center gap-[18px] flex-wrap">
          <div
            className="flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${guild.color}, ${guild.color}88)`,
              boxShadow: `0 0 30px ${guild.color}40`,
              fontSize: 40,
            }}
          >
            {emoji}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1
              className="font-[family-name:var(--font-heading)] font-bold m-0"
              style={{ fontSize: 36, letterSpacing: "-0.02em" }}
            >
              {guild.name}
            </h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="pill">{tasks.length} total</span>
              <span className="pill pill-leaf">{active.length} active</span>
              <span className="pill pill-gold">{done.length} cleared</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)} className="btn btn-ghost">
              <Icon name="edit" size={14} /> Edit
            </button>
            <button onClick={handleDeleteGuild} className="btn btn-ghost" aria-label="Delete">
              <Icon name="trash" size={14} />
            </button>
            <button onClick={() => setShowAddTask(true)} className="btn btn-primary">
              <Icon name="plus" size={14} /> Add quest
            </button>
          </div>
        </div>

        {/* Task table */}
        <div className="card-surface overflow-hidden">
          <div
            className="grid gap-3 px-5 py-3.5 border-b border-border items-center"
            style={{ gridTemplateColumns: "40px 1fr 100px 120px 200px 40px" }}
          >
            <div />
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Quest
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Priority
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Due
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-text-muted uppercase tracking-widest">
              Progress
            </div>
            <div />
          </div>

          {active.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              guildColor={guild.color}
              onComplete={(e) =>
                handleStatusChange(task.id, "done", { x: e.clientX, y: e.clientY })
              }
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))}

          {done.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors hover:bg-white/[0.02]"
                style={{ background: "rgba(78,221,142,0.04)" }}
              >
                <span className="text-[13px] text-text-secondary flex items-center gap-2">
                  <Icon
                    name={showCompleted ? "chevron-down" : "chevron-right"}
                    size={14}
                  />
                  Cleared ({done.length})
                </span>
              </button>
              {showCompleted &&
                done.map((task) => (
                  <div
                    key={task.id}
                    className="px-5 py-4 flex items-center gap-3 opacity-60 border-t border-border/50"
                  >
                    <div
                      className="w-[22px] h-[22px] rounded-lg flex items-center justify-center"
                      style={{ background: "#4EDD8E" }}
                    >
                      <Icon name="check" size={13} color="#0E0A07" strokeWidth={3} />
                    </div>
                    <span className="line-through">{task.title}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

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

function TaskRow({
  task,
  guildColor,
  onComplete,
  onDelete,
}: {
  task: Task;
  guildColor: string;
  onComplete: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const pct =
    task.total_hours && task.total_hours > 0
      ? Math.min(1, (task.actual_hours ?? 0) / task.total_hours)
      : (getTaskProgress(task) ?? 0);

  function formatDue(date: string | null): string {
    if (!date) return "—";
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1 && diff < 7)
      return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div
      className="grid gap-3 px-5 py-4 items-center border-b border-border/50 last:border-b-0"
      style={{ gridTemplateColumns: "40px 1fr 100px 120px 200px 40px" }}
    >
      <button
        onClick={onComplete}
        className="w-[22px] h-[22px] rounded-lg shadow-[0_0_0_1.5px_var(--color-text-faint)_inset] cursor-pointer transition-colors hover:shadow-[0_0_0_1.5px_var(--color-text-secondary)_inset]"
        aria-label="Complete"
      />
      <div className="text-sm font-medium truncate">{task.title}</div>
      <span className={`pill ${PRIORITY_PILL[task.priority]} self-start`}>
        {PRIORITY_LABEL[task.priority]}
      </span>
      <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary">
        {formatDue(task.due_date)}
      </div>
      <div>
        <div className="flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-text-muted mb-1">
          <span>
            {task.actual_hours ?? 0}h / {task.total_hours ?? "—"}h
          </span>
          <span>{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-[5px] rounded-full overflow-hidden bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct * 100}%`, background: guildColor }}
          />
        </div>
      </div>
      <button
        onClick={onDelete}
        className="btn-icon"
        style={{ width: 28, height: 28 }}
        aria-label="Delete"
      >
        <Icon name="trash" size={12} />
      </button>
    </div>
  );
}
