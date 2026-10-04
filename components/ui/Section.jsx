import { cn } from "@/lib/utils";

/**
 * Numbered brief section, e.g. "03 — Make sure I mention".
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
