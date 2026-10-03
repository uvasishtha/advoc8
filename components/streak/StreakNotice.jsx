"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StreakEight } from "@/components/streak/StreakEight";
import { STREAK_NOTE } from "@/lib/streak";
import { formatDate } from "@/lib/format";

/**
 * Confirmation for a saved entry, with the streak when there is one to report.
 *
 * It is a compact card rather than a modal, so logging never turns into
 * something the user has to dismiss. It fades out on its own after
 * `autoDismissMs`, pauses while the pointer or keyboard focus is on it, and
 * can always be closed with either the button or the cross.
 *
 * A streak is only celebrated when one is actually running. Backdating an entry
 * for a day that is already past shows the plain confirmation instead of
 * claiming a streak the record does not support.
 */
export function StreakNotice({ entry, streak, onDismiss, autoDismissMs = 10000 }) {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isPaused, autoDismissMs, onDismiss]);

  const showStreak = Boolean(streak?.hasStreak) && streak.isTodayLogged;

  return (
    <Card
      tone="soft"
      className="p-4 sm:p-5"
      role="status"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-start gap-4">
        {showStreak ? (
          <StreakEight size={64} className="mt-0.5" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Check size={18} aria-hidden="true" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          {showStreak ? (
            <>
              <p className="font-serif text-xl font-semibold tracking-tight text-accent-strong">
                {streak.label}
              </p>
              <p className="mt-1 font-medium leading-snug text-foreground">{streak.headline}</p>
              <p className="hint mt-0.5">{streak.detail}</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Entry saved</p>
              <p className="hint mt-0.5">
                Your {entry.symptom.toLowerCase()} entry was added to your tracking history for{" "}
                {formatDate(entry.date)}. Your metrics and Evidence Brief are already updated.
              </p>
            </>
          )}

          <p className="mt-2.5 border-t border-accent-muted pt-2.5 text-xs leading-relaxed text-muted">
            {showStreak ? STREAK_NOTE : null}
            {showStreak && entry ? (
              <>
                {" "}
                {entry.symptom} logged for {formatDate(entry.date)}.
              </>
            ) : null}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Continue tracking
            </Button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
            >
              <X size={15} aria-hidden="true" />
              <span className="sr-only">Dismiss confirmation</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}