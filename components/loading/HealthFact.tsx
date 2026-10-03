"use client";

import type { HealthFact } from "@/data/healthFacts";

interface HealthFactProps {
  fact: HealthFact;
  /** Drives the fade so the next fact can fade in without a hard cut. */
  visible?: boolean;
  /** Fade duration in milliseconds. Pass 0 for an instant swap. */
  fadeMs?: number;
  className?: string;
}

/**
 * A single women's health fact, shown at the bottom of the loading screen.
 * Deliberately quiet: small type, muted ink, and the source always visible so
 * the information stays attributable.
 */
export function HealthFact({
  fact,
  visible = true,
  fadeMs = 450,
  className = "",
}: HealthFactProps) {
  return (
    <aside
      aria-label="Did you know"
      className={`mx-auto w-full max-w-xl rounded-lg border border-border bg-white/70 px-5 py-4 text-left sm:px-6 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: fadeMs > 0 ? `opacity ${fadeMs}ms ease, transform ${fadeMs}ms ease` : "none",
      }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-dark">
        Did you know?
      </p>

      <p className="mt-2 font-serif text-base font-semibold leading-snug text-foreground sm:text-lg">
        {fact.question}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-muted">{fact.answer}</p>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>{fact.category}</span>
        <span aria-hidden="true" className="text-border">
          &middot;
        </span>
        <span>
          Source: {fact.source.organization}
          {fact.source.title ? ` — ${fact.source.title}` : ""}
        </span>
      </p>
    </aside>
  );
}
