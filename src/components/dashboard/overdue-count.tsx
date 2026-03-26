"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { Card, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  tasks: Task[];
}

export function OverdueCount({ tasks }: Props) {
  const today = toDateString(new Date());
  const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done");
  const count = overdue.length;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <Card className={`flex flex-col h-full bg-bg-card border-border/60 transition-colors duration-300 relative overflow-hidden group ${count > 0 ? "bg-amber-500/[0.03] border-amber-500/20" : ""}`}>
      <AlertTriangle size={80} strokeWidth={1} className={`absolute -bottom-6 -right-4 pointer-events-none ${count > 0 ? "text-amber-500/[0.08]" : "text-text-muted/[0.06]"}`} />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Attention Needed
          </CardTitle>
        </div>

        <div className="flex items-baseline gap-1.5 mb-6">
          <span className={`text-4xl font-semibold tracking-tight ${count > 0 ? "text-amber-400" : "text-text-primary"}`}>
            {count}
          </span>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
            Overdue
          </span>
        </div>

        <div className="mt-auto space-y-4">
          <div className="relative h-1.5 w-full bg-bg-primary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${count > 0 ? "bg-amber-400" : "bg-text-muted opacity-20"}`}
              style={{ width: mounted && count > 0 ? "100%" : "0%" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-tight">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? "bg-amber-400 animate-pulse" : "bg-text-muted"}`} />
              {count > 0 ? "Action Required" : "Tasks Healthy"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
