"use client";

import { LOADING_CONFIG } from "@/data/healthFacts";

interface EightLoaderProps {
  /** Largest width of the 8 in pixels. It shrinks to fit narrow or short screens. */
  size?: number;
  /** Length of one full animation cycle in milliseconds. Lower = faster. */
  durationMs?: number;
  className?: string;
}

/** Upper loop of the 8, drawn as a full ellipse in a 120 x 164 viewBox. */
const TOP_LOOP = "M60 12a27 34 0 1 1 0 68a27 34 0 1 1 0-68";

/** Lower loop of the 8 — wider, so the figure sits on a wider base. */
const BOTTOM_LOOP = "M60 76a31 38 0 1 1 0 76a31 38 0 1 1 0-76";

/**
 * The ADVOC8 loading mark: an "8" that breathes, tilts, and shifts weight
 * between its two loops.
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
      <svg viewBox="0 0 120 164" className="eight-glow absolute inset-0 h-full w-full overflow-visible">
        <path d={TOP_LOOP} className="eight-loop" />
        <path d={BOTTOM_LOOP} className="eight-loop" />
      </svg>
      <svg viewBox="0 0 120 164" className="relative h-full w-full overflow-visible">
        <g className="eight-figure">
          <path d={TOP_LOOP} className="eight-loop eight-loop-top" />
          <path d={BOTTOM_LOOP} className="eight-loop eight-loop-bottom" />
        </g>
      </svg>
    </div>
  );
}