"use client";

import { useId } from "react";

/**
 * The ADVOC8 streak graphic: a small heart.
 *
 * This is the same mark the streak feature shipped with — same box, same soft
 * pink palette, same blurred halo, same settle-and-breathe motion, same four
 * sparkles. Only the symbol inside it changed. The loops of the old "8" read
 * as an eight to anyone glancing at it, which is the one thing a streak number
 * must never look like.
 *
 * The heart is decorative: it is hidden from assistive technology, and the
 * number of consecutive days is always written out beside it. Nothing about it
 * is a claim on the user's health — it stands for attention to their record.
 *
 * Every animation is switched off under prefers-reduced-motion (globals.css).
 */

/** Drawing surface, unchanged from the mark this replaced. */
const VIEWBOX = "0 0 120 164";

/**
 * A heart centred in that box: two lobes across the top, a point at the
 * bottom. Kept well inside the edges so the halo has room to bleed.
 */
const HEART =
  "M60 110C46 99 33 88 33 74c0-11 8-19 18-19 5 0 9 3 9 3s4-3 9-3c10 0 18 8 18 19 0 14-13 25-27 36Z";

const SPARKLES = [
  { x: "6%", y: "16%", size: 7, delay: 0 },
  { x: "86%", y: "26%", size: 5, delay: 260 },
  { x: "78%", y: "76%", size: 6, delay: 520 },
  { x: "16%", y: "70%", size: 4, delay: 780 },
];

export function StreakHeart({ size = 76, animated = true, sparkles = true, className = "" }) {
  const gradientId = useId();
  const height = Math.round(size * (164 / 120));

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
        viewBox={VIEWBOX}
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

        <g className={animated ? "streak-mark-glow" : undefined}>
          <path d={HEART} className="streak-mark-glow-shape" />
        </g>

        <g className={animated ? "streak-mark" : undefined}>
          <path d={HEART} className="streak-mark-shape" fill={`url(#${gradientId})`} />
        </g>
      </svg>
    </div>
  );
}