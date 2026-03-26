"use client";

import { Button } from "@/components/ui/button";

type ViewMode = "day" | "week" | "month";

interface PlannerNavProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function PlannerNav({ view, onViewChange, title, onPrev, onNext, onToday }: PlannerNavProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPrev}>&larr;</Button>
        <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        <Button variant="ghost" size="sm" onClick={onNext}>&rarr;</Button>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] ml-2">
          {title}
        </h2>
      </div>

      <div className="flex bg-bg-card rounded-md border border-border overflow-hidden">
        {(["day", "week", "month"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`
              px-3 py-1.5 text-xs font-medium capitalize cursor-pointer transition-colors
              ${view === v ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"}
            `}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
