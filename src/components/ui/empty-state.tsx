import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-4 ${className}`}>
      <div className="w-14 h-14 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-2xl mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-6">
        {description}
      </p>
      {action && <div className="mb-6">{action}</div>}
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function FeatureCard({ icon, title, description, action }: FeatureCardProps) {
  return (
    <div className="flex flex-col p-5 rounded-lg border border-border bg-bg-card hover:bg-bg-elevated transition-colors">
      <div className="text-xl mb-3">{icon}</div>
      <h4 className="text-sm font-semibold mb-1">{title}</h4>
      <p className="text-xs text-text-secondary flex-1 mb-3">{description}</p>
      {action}
    </div>
  );
}

export function FeatureGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-3xl">
      {children}
    </div>
  );
}
