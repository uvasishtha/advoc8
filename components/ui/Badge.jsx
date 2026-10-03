import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-secondary-bg text-foreground border-border",
  accent: "bg-accent-soft text-accent-strong border-accent-muted",
  outline: "bg-transparent text-muted border-border-strong",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
};

export function Badge({ children, tone = "default", className, ...rest }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}