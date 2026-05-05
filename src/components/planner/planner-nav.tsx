"use client";

import { Icon } from "@/components/ui/icon";

type ViewMode = "day" | "week" | "month";

interface PlannerNavProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function PlannerNav({
  view,
  onViewChange,
  title,
  onPrev,
  onNext,
  onToday,
}: PlannerNavProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Segmented view toggle */}
      <div
        className="inline-flex rounded-full p-1"
        style={{
          background: "rgba(255,246,236,0.04)",
          boxShadow: "0 0 0 1px rgba(255,246,236,0.10) inset",
        }}
      >
        {(["day", "week", "month"] as ViewMode[]).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`
                px-4 py-2 rounded-full text-[13px] font-semibold capitalize
                transition-colors
                ${active
                  ? "bg-sun text-[#1A0A03]"
                  : "text-text-secondary hover:text-text-primary"
                }
              `}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button onClick={onPrev} className="btn-icon" aria-label="Previous">
          <Icon name="chevron-left" size={16} />
        </button>
        <div
          className="font-[family-name:var(--font-heading)] font-semibold text-center min-w-[180px]"
          style={{ fontSize: 18 }}
        >
          {title}
        </div>
        <button onClick={onNext} className="btn-icon" aria-label="Next">
          <Icon name="chevron-right" size={16} />
        </button>
        <button onClick={onToday} className="btn btn-ghost ml-2">
          Today
        </button>
      </div>
    </div>
  );
}
