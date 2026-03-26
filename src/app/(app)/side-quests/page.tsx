"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSideQuests, createTask, updateTask, deleteTask } from "@/lib/supabase/queries/tasks";
import { calculateXp } from "@/lib/xp";
import { Task, Priority, QuestCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/tasks/task-form";
import { QuestCard } from "@/components/side-quests/quest-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NavIcon } from "@/components/layout/nav-icon";
import { useCelebration } from "@/contexts/celebration-context";

export default function SideQuestsPage() {
  const [quests, setQuests] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>("all");
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

  async function handleStatusChange(id: string, status: Task["status"], position?: { x: number; y: number }) {
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

  const filtered = filter === "all" ? quests : quests.filter((q) => q.category === filter);
  const active = filtered.filter((q) => q.status !== "done");
  const done = filtered.filter((q) => q.status === "done");
  const categories = ["all", "fun", "learning", "errands", "health", "other"];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Side Quests</h1>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Side Quests</h1>
        <Button onClick={() => setShowAdd(true)}>New Quest</Button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`
              px-3 py-1.5 text-xs rounded-md capitalize cursor-pointer transition-colors
              ${filter === cat
                ? "bg-gold/15 text-gold"
                : "bg-bg-card text-text-muted hover:text-text-secondary border border-border"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {active.length === 0 && done.length === 0 ? (
        <EmptyState
          icon={<NavIcon name="compass" size={24} />}
          title="No side quests yet"
          description="Side quests are for personal tasks, fun projects, learning goals, and things you need to remember outside of work."
          action={<Button onClick={() => setShowAdd(true)}>Start a quest</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {active.map((quest) => (
            <QuestCard key={quest.id} task={quest} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
          {done.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                Completed ({done.length})
              </p>
              <div className="flex flex-col gap-2">
                {done.map((quest) => (
                  <QuestCard key={quest.id} task={quest} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Side Quest">
        <TaskForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} showCategory />
      </Modal>
    </div>
  );
}
