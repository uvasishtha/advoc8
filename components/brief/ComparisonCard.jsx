"use client";

import { GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { roundTo } from "@/lib/format";

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dayCount(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/** One group in the comparison: the label, the day count behind it, the value. */
function GroupRow({ label, days, value, ratio, emphasis }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn("min-w-0 text-sm", emphasis ? "text-foreground" : "text-muted")}>
          {sentenceCase(label)}
          <span className="ml-1.5 whitespace-nowrap text-xs text-muted/70">{dayCount(days)}</span>
        </span>
        <span
          className={cn(
            "shrink-0 text-sm tabular-nums",
            emphasis ? "font-semibold text-accent-strong" : "font-medium text-foreground",
          )}
        >
          {value}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary-bg">
        <div
          className={cn("h-full rounded-full", emphasis ? "bg-accent-strong" : "bg-accent-muted")}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** The gap, stated as a number with its direction. */
function GapRow({ direction, gap, unit, noun }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg bg-accent-soft px-3 py-2">
      <span className="text-sm font-medium text-foreground">Difference</span>
      <span className="text-sm font-semibold tabular-nums text-accent-strong">
        {direction === "higher" ? "+" : "−"}
        {gap} {unit} {noun}
      </span>
    </div>
  );
}

/**
 * One measured difference between two groups of the reader's own days.
 *
 * Both groups are shown with the number of days behind them, then the gap
 * between them, so the reader can judge the comparison instead of taking it on
 * trust. Wording comes from lib/analytics/language.js.
 */
export function ComparisonCard({ comparison, className }) {
  const {
    symptom,
    shortLabel,
    severityWithFactor,
    severityOutsideFactor,
    severityDelta,
    severityDiffers,
    hasSeverityData,
    daysWithFactor,
    daysOutsideFactor,
    factorRate,
    outsideRate,
    rateDelta,
    frequencyDiffers,
    hasFrequencyData,
    headline,
    caveat,
  } = comparison;

  const standout = severityDiffers || frequencyDiffers;

  return (
    <Card className={cn("p-5", standout && "border-accent-muted bg-accent-soft/40", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{symptom}</Badge>
        <Badge tone="outline">{shortLabel}</Badge>
        {standout ? (
          <span className="flex items-center gap-1 text-xs font-medium text-accent-strong">
            <GitCompareArrows size={13} aria-hidden="true" />
            Stands out
          </span>
        ) : null}
      </div>

      <p className="font-serif text-lg leading-snug text-foreground">{headline}</p>

      <div className="mt-4 space-y-2.5">
        {hasSeverityData ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Average severity
            </p>
            <GroupRow
              emphasis
              label={comparison.label}
              days={severityWithFactor.days}
              value={`${roundTo(severityWithFactor.average)} / 10`}
              ratio={severityWithFactor.average / 10}
            />
            <GroupRow
              label={comparison.complementLabel}
              days={severityOutsideFactor.days}
              value={`${roundTo(severityOutsideFactor.average)} / 10`}
              ratio={severityOutsideFactor.average / 10}
            />
            <GapRow
              direction={severityDelta > 0 ? "higher" : "lower"}
              gap={roundTo(Math.abs(severityDelta))}
              unit="points"
              noun="difference"
            />
          </>
        ) : null}

        {hasFrequencyData ? (
          <div className={hasSeverityData ? "mt-5 space-y-2.5" : "space-y-2.5"}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Days the symptom was logged
            </p>
            <GroupRow
              emphasis={frequencyDiffers}
              label={comparison.label}
              days={daysWithFactor}
              value={`${Math.round(factorRate * 100)}%`}
              ratio={factorRate}
            />
            <GroupRow
              label={comparison.complementLabel}
              days={daysOutsideFactor}
              value={`${Math.round(outsideRate * 100)}%`}
              ratio={outsideRate}
            />
            {frequencyDiffers ? (
              <GapRow
                direction={rateDelta > 0 ? "higher" : "lower"}
                gap={`${Math.round(Math.abs(rateDelta) * 100)}`}
                unit="points"
                noun="difference"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        Both groups come from days you recorded the symptom and this factor on, so the counts stay
        comparable.
      </p>

      <p className="hint mt-3 border-t border-border pt-3">{caveat}</p>
    </Card>
  );
}