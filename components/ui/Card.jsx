import { cn } from "@/lib/utils";

export function Card({ children, className, tone = "surface", ...rest }) {
  return (
    <div
      className={cn(
        "rounded-xl border",
        tone === "surface" && "border-border bg-surface",
        tone === "soft" && "border-accent-muted bg-accent-soft",
        tone === "quiet" && "border-transparent bg-secondary-bg",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? <p className="hint mt-1 max-w-prose">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}