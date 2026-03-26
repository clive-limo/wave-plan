import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "urgent" | "normal" | "low" | "gold" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary",
  urgent: "bg-priority-urgent/15 text-priority-urgent",
  normal: "bg-priority-normal/15 text-priority-normal",
  low: "bg-bg-elevated text-text-muted",
  gold: "bg-gold/15 text-gold",
  success: "bg-hp-high/15 text-hp-high",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
