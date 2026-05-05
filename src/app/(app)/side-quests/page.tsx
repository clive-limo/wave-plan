"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSideQuests, createTask, updateTask, deleteTask } from "@/lib/supabase/queries/tasks";
import { calculateXp } from "@/lib/xp";
import { Task, Priority, QuestCategory } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/tasks/task-form";
import { QuestCard } from "@/components/side-quests/quest-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Sticker } from "@/components/ui/sticker";
import { Icon } from "@/components/ui/icon";
import { useCelebration } from "@/contexts/celebration-context";

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🌊" },
  { id: "fun", label: "Fun", icon: "🎉" },
  { id: "learning", label: "Learning", icon: "📖" },
  { id: "errands", label: "Errands", icon: "🛒" },
  { id: "health", label: "Health", icon: "🌱" },
  { id: "other", label: "Other", icon: "✨" },
];

export default function SideQuestsPage() {
  const [quests, setQuests] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showDone, setShowDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  async function loadQuests() {
    const supabase = createClient();
    const data = await getSideQuests(supabase);
    setQuests(data);
    setLoading(false);
  }

  async function handleAdd(data: {
    title: string;
    description?: string;
    priority: Priority;
    category?: QuestCategory;
    start_date?: string;
    due_date?: string;
    total_hours?: number;
    daily_hours?: number;
  }) {
    const supabase = createClient();
    const quest = await createTask(supabase, { ...data, guild_id: null });
    setQuests((prev) => [quest, ...prev]);
    setShowAdd(false);
  }

  const { celebrate } = useCelebration();

  async function handleStatusChange(
    id: string,
    status: Task["status"],
    position?: { x: number; y: number }
  ) {
    const supabase = createClient();
    const task = quests.find((q) => q.id === id);
    if (!task) return;

    const updates: Partial<Task> = { status };
    if (status === "done" && !task.xp_awarded) {
      const isOverdue = task.due_date ? new Date(task.due_date) < new Date() : false;
      const xp = calculateXp(task.priority, isOverdue, 0);
      updates.xp_awarded = xp;
      updates.completed_at = new Date().toISOString();

      const updated = await updateTask(supabase, id, updates);
      setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
      await celebrate({ xp, priority: task.priority, position });
      return;
    }
    if (status !== "done") {
      updates.xp_awarded = null;
      updates.completed_at = null;
    }

    const updated = await updateTask(supabase, id, updates);
    setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await deleteTask(supabase, id);
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  const filtered =
    filter === "all" ? quests : quests.filter((q) => q.category === filter);
  const active = filtered.filter((q) => q.status !== "done");
  const done = filtered.filter((q) => q.status === "done");

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1
            className="font-[family-name:var(--font-heading)] font-bold m-0"
            style={{ fontSize: 32, letterSpacing: "-0.02em" }}
          >
            Side quests
          </h1>
          <p className="text-text-secondary mt-1.5 m-0">
            The you-stuff. The good-life stuff. Not for the boss.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Icon name="plus" size={14} /> New quest
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full
                text-[13px] font-semibold transition-colors
                ${active
                  ? "bg-[rgba(255,109,41,0.15)] text-sun-2 shadow-[0_0_0_1px_var(--color-sun)_inset]"
                  : "bg-white/[0.04] text-text-secondary shadow-[0_0_0_1px_rgba(255,246,236,0.10)_inset] hover:text-text-primary"
                }
              `}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          );
        })}
      </div>

      {/* Quest cards */}
      {active.length === 0 && done.length === 0 ? (
        <div className="card-surface flex flex-col items-center text-center p-10 gap-4">
          <Sticker shape="cloud" color="#FFC857" size={80} expression="happy" />
          <div>
            <p className="text-base font-semibold m-0">No quests in this category yet.</p>
            <p className="text-sm text-text-secondary mt-1">
              Drop a small one. The good-life stuff counts.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            Start a quest
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {active.map((quest) => (
                <QuestCard
                  key={quest.id}
                  task={quest}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div className="card-surface overflow-hidden">
              <button
                onClick={() => setShowDone(!showDone)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[13px] text-text-secondary flex items-center gap-2">
                  <Icon
                    name={showDone ? "chevron-down" : "chevron-right"}
                    size={14}
                  />
                  Cleared this week ({done.length})
                </span>
              </button>
              {showDone && (
                <div className="border-t border-border">
                  {done.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      task={quest}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Side Quest">
        <TaskForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} showCategory />
      </Modal>
    </div>
  );
}
