"use client";

interface DisclaimerProps {
  children: React.ReactNode;
  className?: string;
}

export function Disclaimer({ children, className = "" }: DisclaimerProps) {
  return (
    <div
      className={`
        flex gap-3 p-4
        bg-secondary-bg border border-border rounded-lg
        text-sm text-muted
        ${className}
      `}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="flex-shrink-0 mt-0.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{children}</p>
    </div>
  );
}
