"use client";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  className = "",
}: ProgressIndicatorProps) {
  const progress = (current / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">
          {String(current).padStart(2, "0")} / {total}
        </span>
      </div>
      <div className="h-1 bg-secondary-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
