import { cn } from "@/lib/utils";
import { ProvenanceTag } from "@/components/brief/Provenance";

/**
 * Numbered brief section, e.g. "03 — Make sure I mention".
 * The number is decorative; the heading carries the meaning.
 *
 * `source` is not optional decoration either. Every section declares whether it
 * holds the person's own words or Advoc8's reading of their record, and the tag
 * sits beside the heading so the reader never has to guess which is which.
 */
export function Section({ number, title, description, source, children, className, actions }) {
  return (
    <section className={cn("scroll-mt-24", className)} aria-labelledby={`section-${number}`}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="flex items-center gap-2 font-serif text-sm font-semibold text-accent-strong">
            <span aria-hidden="true">{String(number).padStart(2, "0")}</span>
            <span aria-hidden="true" className="h-px w-6 bg-accent-muted" />
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 id={`section-${number}`} className="text-2xl font-semibold text-foreground">
              {title}
            </h2>
            {source ? <ProvenanceTag source={source} /> : null}
          </div>
          {description ? <p className="hint mt-1.5 max-w-prose">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
