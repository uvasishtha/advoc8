"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "warning" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-secondary-bg text-foreground border-border",
    accent: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    muted: "bg-secondary-bg text-muted border-border",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-full text-xs font-medium border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
