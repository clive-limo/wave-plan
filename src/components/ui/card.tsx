import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  flush?: boolean;
}

export function Card({ elevated, flush, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-border
        ${flush ? "p-0" : "p-4"}
        ${elevated ? "bg-bg-elevated" : "bg-bg-card"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-sm font-medium text-text-secondary uppercase tracking-wider font-[family-name:var(--font-heading)] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}
