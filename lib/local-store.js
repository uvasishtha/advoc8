"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal localStorage-backed store with a proper external-store interface.
 *
 * This exists so components can read persisted state with
 * `useSyncExternalStore` instead of setting state inside an effect. That
 * matters for two reasons: it avoids the cascading render React warns about,
 * and `getServerSnapshot` lets the server and the first client render agree,
 * so there is no hydration mismatch.
 *
 * A store is a module-level singleton, so its functions have a stable identity
 * for the lifetime of the page and need no memoisation.
 *
 * When Supabase is wired in, swap `createLocalStore` for the route handlers.
 * Callers keep the same shape: read a snapshot, write a new one.
 */
export function createLocalStore(key, defaults) {
  const listeners = new Set();

  // Cached so getSnapshot returns a stable reference between writes, which
  // useSyncExternalStore requires.
  let cached = defaults;
  let hasLoaded = false;

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot() {
    if (!hasLoaded) {
      hasLoaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        cached = raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
      } catch {
        cached = defaults;
      }
    }
    return cached;
  }

  // Stable reference on the server and during hydration.
  function getServerSnapshot() {
    return defaults;
  }

  function setSnapshot(next) {
    const value = typeof next === "function" ? next(cached) : next;
    cached = { ...value };
    hasLoaded = true;

    try {
      window.localStorage.setItem(key, JSON.stringify(cached));
    } catch {
      // Storage blocked or full. The value stays in memory for this session.
    }

    for (const listener of listeners) listener();
  }

  return { subscribe, getSnapshot, getServerSnapshot, setSnapshot };
}

/**
 * @returns `[value, write, hasHydrated]`
 * `hasHydrated` is false during server rendering and the first client render,
 * which is the signal to show a loading state.
 */
export function useLocalStore(store) {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const hasHydrated = useSyncExternalStore(store.subscribe, () => true, () => false);

  return [value, store.setSnapshot, hasHydrated];
}