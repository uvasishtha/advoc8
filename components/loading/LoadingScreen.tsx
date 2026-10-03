"use client";

import { LOADING_CONFIG } from "@/data/healthFacts";
import { EightLoader } from "./EightLoader";
import { HealthFact } from "./HealthFact";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useRotatingHealthFact } from "./useRotatingHealthFact";

interface LoadingScreenProps {
  /** Status line shown under the 8 and announced to screen readers. */
  message?: string;
  /** Length of one 8 animation cycle in milliseconds. Lower = faster. */
  animationDurationMs?: number;
  /** How long each health fact stays on screen before rotating. */
  factRotationMs?: number;
  /** Renders the ADVOC8 wordmark above the 8. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * The ADVOC8 loading experience: an animated "8" over a status line, with a
 * rotating, sourced women's health fact along the bottom.
 *
 * It covers the viewport, so it works both as a route-level loading screen and as
 * an overlay while a form finishes submitting. It never holds the app back — it
 * only reflects work that is already happening.
 */
export function LoadingScreen({
  message = "Preparing your health story...",
  animationDurationMs = LOADING_CONFIG.eightDurationMs,
  factRotationMs = LOADING_CONFIG.factRotationMs,
  showWordmark = true,
  className = "",
}: LoadingScreenProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { fact, visible, fadeMs } = useRotatingHealthFact({
    rotationMs: factRotationMs,
    reducedMotion: prefersReducedMotion,
  });

  return (
    <div
      aria-busy="true"
      className={`fixed inset-0 z-50 flex min-h-dvh w-full flex-col overflow-y-auto bg-background ${className}`}
    >
      {showWordmark && (
        <header className="shrink-0 px-6 pt-8 text-center sm:pt-12">
          <p className="font-serif text-sm font-semibold uppercase tracking-[0.4em] text-foreground sm:text-base">
            Advoc8
          </p>
        </header>
      )}

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center sm:gap-8 sm:py-10">
        <EightLoader durationMs={animationDurationMs} />

        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="max-w-xs font-serif text-xl font-semibold leading-snug text-foreground sm:text-2xl"
        >
          {message}
        </p>
      </main>

      <footer className="shrink-0 px-4 pb-6 sm:px-6 sm:pb-10">
        {/* Reserved height keeps the layout still while facts fade between. */}
        <div className="min-h-[15rem] sm:min-h-[12rem]">
          {fact && <HealthFact fact={fact} visible={visible} fadeMs={fadeMs} />}
        </div>
        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-muted">
          General health information, not medical advice. Advoc8 does not diagnose
          conditions.
        </p>
      </footer>
    </div>
  );
}