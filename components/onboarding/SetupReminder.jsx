"use client";

import { ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * The persistent nudge for anyone whose setup is not finished. A banner rather
 * than a modal, because it has to stay out of the way of logging symptoms —
 * which is the one thing an unfinished profile is still allowed to do.
 */
export function SetupReminder({ onDismiss }) {
  return (
    <div className="border-b border-accent-muted bg-accent-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-start gap-3 px-4 py-3 sm:items-center sm:px-6 lg:px-8">
        <ClipboardList size={18} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Finish setting up your Advoc8 profile
          </p>
          <p className="hint mt-0.5">
            Add your health concerns to unlock your personalized Evidence Brief and other
            preparation features.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" href="/setup">
            Complete Setup
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X size={14} aria-hidden="true" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}