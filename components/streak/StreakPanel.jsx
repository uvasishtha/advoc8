"use client";

import { NotebookPen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StreakHeart } from "@/components/streak/StreakHeart";
import { STREAK_NOTE } from "@/lib/streak";

/**
 * The standing streak summary on the dashboard: a quiet record of consistency,
 * not a celebration. Shown only while a streak is running, so a user with no
 * entries is never told they have "0 day streak".
 */
export function StreakPanel({ streak }) {
  if (!streak?.hasStreak) return null;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <StreakHeart size={52} animated={false} sparkles={false} />

        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-semibold leading-tight text-accent-strong">
            {streak.label}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-foreground">{streak.headline}</p>
          <p className="hint mt-0.5">{streak.detail}</p>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
          {streak.isTodayLogged ? (
            <span className="text-xs text-muted">
              {streak.daysLogged} {streak.daysLogged === 1 ? "day" : "days"} logged
            </span>
          ) : (
            <Button href="/track" size="sm">
              <NotebookPen size={15} aria-hidden="true" />
              Log today
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-2.5 text-xs leading-relaxed text-muted">
        {STREAK_NOTE}
      </p>
    </Card>
  );
}