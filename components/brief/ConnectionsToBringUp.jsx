"use client";

import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Patterns to bring up — the strongest relationships in the user's own
 * records, formatted as appointment questions. Shown on the prepare page so
 * the person can read the evidence and the suggested question together, and
 * carried into the practice chat as context the clinician can ask about.
 */
export function ConnectionsToBringUp({ connections }) {
  if (!connections || connections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link2 size={18} className="text-accent-strong" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Patterns to bring up
        </h2>
      </div>

      <p className="hint -mt-3">
        The strongest relationships in your own records. Each one comes with the evidence
        behind it and a question you can ask your clinician.
      </p>

      {connections.map((connection) => (
        <Card key={connection.title} className="p-4 sm:p-5">
          <p className="text-sm font-medium text-accent-strong">{connection.title}</p>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-foreground">
            {connection.evidence}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{connection.caveat}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
            Ask: {connection.question}
          </p>
        </Card>
      ))}
    </div>
  );
}