"use client";

import { LOADING_CONFIG } from "@/data/healthFacts";
import { EIGHT_BOTTOM_LOOP, EIGHT_TOP_LOOP, EIGHT_VIEWBOX } from "@/lib/eight-mark";

interface EightLoaderProps {
  /** Largest width of the 8 in pixels. It shrinks to fit narrow or short screens. */
  size?: number;
  /** Length of one full animation cycle in milliseconds. Lower = faster. */
  durationMs?: number;
  className?: string;
}

/**
 * The ADVOC8 loading mark: an "8" that breathes, tilts, and shifts weight
 * between its two loops.
 *
 * The geometry is shared with the streak mark in components/streak, so the
 * symbol a user watches while waiting is the same symbol they are rewarded
 * with later.
 *
 * Purely decorative — it is hidden from assistive technology, and all motion is
 * switched off under prefers-reduced-motion (see globals.css).
 */
export function EightLoader({
  size = 148,
  durationMs = LOADING_CONFIG.eightDurationMs,
  className = "",
}: EightLoaderProps) {
  const style = {
    width: `min(${size}px, 30vw, 26vh)`,
    "--eight-duration": `${durationMs}ms`,
  } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`relative shrink-0 aspect-[120/164] ${className}`}
    >
      <svg viewBox={EIGHT_VIEWBOX} className="eight-glow absolute inset-0 h-full w-full overflow-visible">
        <path d={EIGHT_TOP_LOOP} className="eight-loop" />
        <path d={EIGHT_BOTTOM_LOOP} className="eight-loop" />
      </svg>
      <svg viewBox={EIGHT_VIEWBOX} className="relative h-full w-full overflow-visible">
        <g className="eight-figure">
          <path d={EIGHT_TOP_LOOP} className="eight-loop eight-loop-top" />
          <path d={EIGHT_BOTTOM_LOOP} className="eight-loop eight-loop-bottom" />
        </g>
      </svg>
    </div>
  );
}