"use client";

import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Notice";

/**
 * 06 — Patterns Worth Discussing.
 *
 * The strongest relationships in the user's own records, each carrying its own
 * evidence line, its own disclaimer, and the question it suggests asking. This
 * is the one section of the brief that is a comparison between two groups of
 * days rather than a description of one symptom, so it gets its own heading
 * and its own disclaimer rather than being folded into "What I've noticed".
 */
export function ConnectionsSection({ connections }) {
  if (!connections || connections.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No recurring connections yet"
        description="Patterns worth discussing appear once you have tracked a symptom alongside sleep, stress or cycle data on enough days. Keep logging and this section fills in on its own."
      />
    );
  }

  return (
    <div className="space-y-5">
      {connections.map((connection) => (
        <Card key={connection.title} className="p-5 sm:p-6">
          <p className="eyebrow">Patterns worth discussing</p>
          <h3 className="mt-1.5 font-serif text-lg font-semibold leading-relaxed text-foreground">
            {connection.title}
          </h3>

          <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground">{connection.evidence}</p>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <p className="text-sm leading-relaxed text-muted">{connection.caveat}</p>
            <p className="text-sm font-medium leading-relaxed text-accent-strong">{connection.question}</p>
          </div>
        </Card>
      ))}

      <p className="hint">
        Each of these is a description of what you logged. None of them says what caused
        anything — that is what the appointment is for.
      </p>
    </div>
  );
}