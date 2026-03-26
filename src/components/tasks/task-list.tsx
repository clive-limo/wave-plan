"use client";

import { Task } from "@/lib/types";
import { TaskCard } from "./task-card";

interface TaskListProps {
  tasks: Task[];
  guildColor?: string;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  guildColor,
  onStatusChange,
  onDelete,
  emptyMessage = "No tasks yet",
}: TaskListProps) {
  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  if (tasks.length === 0) {
    return (
      <p className="text-center text-text-muted text-sm py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {active.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          guildColor={guildColor}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
      {done.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Completed ({done.length})
          </p>
          {done.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              guildColor={guildColor}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
