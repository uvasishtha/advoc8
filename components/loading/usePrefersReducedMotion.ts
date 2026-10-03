"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's motion preference so JavaScript-driven effects (such as
 * rotating health facts) can stop when the user has asked for less motion.
 * CSS animations are handled separately by the reduced-motion media query.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}
