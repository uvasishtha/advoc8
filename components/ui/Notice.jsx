import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Standing note that Advoc8 describes records and does not interpret them. */
export function Disclaimer({ children, className, tone = "quiet" }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        tone === "quiet" && "border-border bg-secondary-bg text-muted",
        tone === "accent" && "border-accent-muted bg-accent-soft text-foreground",
        className,
      )}
    >
      <Info size={18} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
          <Icon size={20} className="text-accent-strong" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
        {description ? <p className="hint mx-auto mt-1 max-w-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}