"use client";

import { useSyncExternalStore } from "react";
import { MOCK_QUESTIONS } from "@/lib/seed/maya";

const EMPTY_DRAFT = Object.freeze({
  statement: "",
  questions: MOCK_QUESTIONS,
});

let draft = { ...EMPTY_DRAFT };
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return draft;
}

function getServerSnapshot() {
  return EMPTY_DRAFT;
}

function setSnapshot(next) {
  draft = typeof next === "function" ? next(draft) : { ...next };
  for (const listener of listeners) listener();
}

export const draftStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setSnapshot,
};

export function useDraftStore() {
  const value = useSyncExternalStore(draftStore.subscribe, draftStore.getSnapshot, draftStore.getServerSnapshot);
  return [value, draftStore.setSnapshot];
}

export function resetBriefDraft() {
  draftStore.setSnapshot(EMPTY_DRAFT);
}

export function seedBriefDraft({ statement } = {}) {
  draftStore.setSnapshot((current) => {
    const next = { ...current };
    if (typeof statement === "string" && statement.trim() && !current.statement.trim()) {
      next.statement = statement.trim();
    }
    return next;
  });
}
