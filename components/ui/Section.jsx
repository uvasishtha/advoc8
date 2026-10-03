import { cn } from "@/lib/utils";

/**
 * Numbered brief section, e.g. "03 — Quantitative Trends".
 * The number is decorative; the heading carries the meaning.
 */
export function Section({ number, title, description, children, className, actions }) {
  return (
    <section className={cn("scroll-mt-24", className)} aria-labelledby={`section-${number}`}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="flex items-center gap-2 font-serif text-sm font-semibold text-accent-strong">
            <span aria-hidden="true">{String(number).padStart(2, "0")}</span>
            <span aria-hidden="true" className="h-px w-6 bg-accent-muted" />
          </p>
          <h2 id={`section-${number}`} className="mt-1 text-2xl font-semibold text-foreground">
            {title}
          </h2>
          {description ? <p className="hint mt-1.5 max-w-prose">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function StatGrid({ children, className, columns = 4 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={cn("grid grid-cols-1 gap-3", map[columns], className)}>{children}</div>;
}

export function Stat({ value, label, hint, unit, tone = "default", className }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "accent" ? "border-accent-muted bg-accent-soft" : "border-border bg-surface",
        className,
      )}
    >
      <p className="font-serif text-3xl font-semibold leading-none text-foreground">
        {value}
        {unit ? <span className="ml-1 font-sans text-sm font-medium text-muted">{unit}</span> : null}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
      {hint ? <p className="hint mt-0.5">{hint}</p> : null}
    </div>
  );
}