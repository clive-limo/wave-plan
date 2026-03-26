interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = "", lines = 3, widths }: SkeletonProps & { lines?: number; widths?: string[] }) {
  const defaultWidths = ["w-full", "w-4/5", "w-3/5"];
  const lineWidths = widths ?? defaultWidths;

  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${lineWidths[i % lineWidths.length]}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-lg border border-border bg-bg-card p-4 ${className}`} aria-hidden="true">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <SkeletonText lines={2} widths={["w-full", "w-2/3"]} />
    </div>
  );
}

export function SkeletonRow({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border ${className}`} aria-hidden="true">
      <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
      <Skeleton className="h-3 flex-1 max-w-[200px]" />
      <Skeleton className="h-5 w-14 rounded" />
      <Skeleton className="h-3 w-16 ml-auto" />
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = "" }: SkeletonProps & { count?: number }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDayRows({ count = 5 }: { count?: number }) {
  return (
    <div className="border border-border rounded-lg divide-y divide-border" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12 rounded ml-auto" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTimeGrid() {
  return (
    <div className="border border-border rounded-lg overflow-hidden" aria-hidden="true">
      {/* Header */}
      <div className="flex border-b border-border bg-bg-card">
        <div className="w-16 flex-shrink-0 border-r border-border h-12" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex-1 min-w-[100px] border-r border-border last:border-r-0 p-2.5 flex flex-col items-center gap-1">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
      {/* Grid rows */}
      <div className="flex">
        <div className="w-16 flex-shrink-0 border-r border-border">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-12 border-b border-border flex items-start justify-end pr-2 pt-1">
              <Skeleton className="h-2.5 w-8" />
            </div>
          ))}
        </div>
        {Array.from({ length: 7 }, (_, col) => (
          <div key={col} className="flex-1 min-w-[100px] border-r border-border last:border-r-0 relative" style={{ height: 8 * 48 }}>
            {col % 3 === 0 && <Skeleton className="absolute left-1 right-1 top-1 h-[92px] rounded-md" />}
            {col % 2 === 1 && <Skeleton className="absolute left-1 right-1 top-[97px] h-[44px] rounded-md" />}
          </div>
        ))}
      </div>
    </div>
  );
}
