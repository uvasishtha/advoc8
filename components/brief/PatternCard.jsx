"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * One co-occurrence finding.
 *
 * The card is deliberately split into three lines: the count, the observed
 * pattern, and the baseline comparison. The wording for all three comes from
 * lib/analytics/language.js so the phrasing can be audited in one place.
 */
export function PatternCard({ pattern, className }) {
  const rate = Math.round(pattern.factorRate * 100);
  const baseline = Math.round(pattern.overallRate * 100);
  const standout = pattern.differsFromBaseline;

  return (
    <Card className={cn("p-5", standout && "border-accent-muted bg-accent-soft/40", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{pattern.symptom}</Badge>
        <Badge tone="outline">{pattern.shortLabel}</Badge>
        {standout ? (
          <span className="flex items-center gap-1 text-xs font-medium text-accent-strong">
            <Eye size={13} aria-hidden="true" />
            Stands out
          </span>
        ) : null}
      </div>

      <p className="font-serif text-lg leading-snug text-foreground">{pattern.statement}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{pattern.observation}</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline justify-between text-xs text-muted">
            <span>On these days</span>
            <span className="font-semibold tabular-nums text-foreground">{rate}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary-bg">
            <div className="h-full rounded-full bg-accent-strong" style={{ width: `${rate}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between text-xs text-muted">
            <span>All tracked days</span>
            <span className="font-semibold tabular-nums text-foreground">{baseline}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary-bg">
            <div
              className="h-full rounded-full bg-accent-muted"
              style={{ width: `${baseline}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}