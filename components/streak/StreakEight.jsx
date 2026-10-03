"use client";

import { useId } from "react";
import {
  EIGHT_ASPECT,
  EIGHT_BOTTOM_LOOP,
  EIGHT_TOP_LOOP,
  EIGHT_VIEWBOX,
} from "@/lib/eight-mark";

const SPARKLES = [
  { x: "6%", y: "16%", size: 7, delay: 0 },
  { x: "86%", y: "26%", size: 5, delay: 260 },
  { x: "78%", y: "76%", size: 6, delay: 520 },
  { x: "16%", y: "70%", size: 4, delay: 780 },
];

/**
 * The ADVOC8 "8" as a reward mark — the same geometry as the loading symbol,
 * drawn filled rather than outlined so it can carry a celebratory moment.
 *
 * It arrives with a short scale-and-settle, then breathes slowly. Four small
 * sparkles twinkle on offset delays. Nothing here loops fast enough to pull
 * attention away from the words, and every animation is switched off under
 * prefers-reduced-motion (see globals.css).
 *
 * The graphic is decorative: it is hidden from assistive technology, and the
 * streak it accompanies always states the number of days in text.
 */
export function StreakEight({ size = 76, animated = true, sparkles = true, className = "" }) {
  const gradientId = useId();
  const height = Math.round(size / EIGHT_ASPECT);

  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height }}
    >
      {sparkles ? (
        <span className="pointer-events-none absolute inset-0">
          {SPARKLES.map((sparkle) => (
            <span
              key={sparkle.delay}
              className={animated ? "streak-sparkle absolute" : "absolute"}
              style={{
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: `${sparkle.delay}ms`,
              }}
            />
          ))}
        </span>
      ) : null}

      <svg
        viewBox={EIGHT_VIEWBOX}
        width={size}
        height={height}
        className="relative overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF91BD" />
            <stop offset="55%" stopColor="#C4307F" />
            <stop offset="100%" stopColor="#A8276B" />
          </linearGradient>
        </defs>

        <g className={animated ? "streak-eight-glow" : undefined}>
          <path d={EIGHT_TOP_LOOP} className="streak-eight-loop" />
          <path d={EIGHT_BOTTOM_LOOP} className="streak-eight-loop" />
        </g>

        <g className={animated ? "streak-eight" : undefined}>
          <path
            d={EIGHT_TOP_LOOP}
            className="streak-eight-loop streak-eight-loop-accent"
            stroke={`url(#${gradientId})`}
          />
          <path
            d={EIGHT_BOTTOM_LOOP}
            className="streak-eight-loop streak-eight-loop-accent"
            stroke={`url(#${gradientId})`}
          />
        </g>
      </svg>
    </div>
  );
}