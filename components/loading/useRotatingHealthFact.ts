"use client";

import { useEffect, useRef, useState } from "react";
import { HEALTH_FACTS, LOADING_CONFIG, type HealthFact } from "@/data/healthFacts";

interface UseRotatingHealthFactOptions {
  /** How long each fact stays on screen before moving to the next. */
  rotationMs?: number;
  /** Length of the fade between facts. */
  fadeMs?: number;
  /** Stops rotation entirely when the user prefers reduced motion. */
  reducedMotion?: boolean;
  /** Fact bank to draw from. */
  facts?: HealthFact[];
}

/** Fisher-Yates shuffle. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks a fact at random the first time the loading screen appears, then cycles
 * through the rest of the bank in that shuffled order — so no fact repeats until
 * every one has been shown. Changes are driven through a fade so the text stays
 * readable while it swaps.
 *
 * The order is chosen in an effect rather than during render, so the
 * server-rendered markup and the first client render always match.
 */
export function useRotatingHealthFact({
  rotationMs = LOADING_CONFIG.factRotationMs,
  fadeMs = LOADING_CONFIG.factFadeMs,
  reducedMotion = false,
  facts = HEALTH_FACTS,
}: UseRotatingHealthFactOptions = {}) {
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queue, setQueue] = useState<HealthFact[]>([]);
  const [position, setPosition] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // The order is picked in a deferred task rather than during render, so the
    // server-rendered markup and the first client render always match and the
    // first fact can fade in. Re-running with the same bank keeps the order.
    const pick = setTimeout(() => {
      setQueue((current) => (current.length > 0 ? current : shuffle(facts)));
    }, 0);

    return () => clearTimeout(pick);
  }, [facts]);

  useEffect(() => {
    if (reducedMotion || rotationMs <= 0 || queue.length < 2) return;

    // Hold the current fact, fade it out, swap, then fade the next one in.
    const swap = setTimeout(() => {
      setVisible(false);
      fadeTimer.current = setTimeout(() => {
        setPosition((current) => (current + 1) % queue.length);
        setVisible(true);
      }, fadeMs);
    }, rotationMs);

    return () => {
      clearTimeout(swap);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [queue, position, reducedMotion, rotationMs, fadeMs]);

  return {
    fact: queue[position],
    visible,
    /** False until the first fact has been chosen after mount. */
    ready: queue.length > 0,
    fadeMs: reducedMotion ? 0 : fadeMs,
  };
}
