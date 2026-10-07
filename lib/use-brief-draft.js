"use client";

import { useCallback } from "react";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { MOCK_QUESTIONS } from "@/lib/seed/maya";

const DEFAULT_DRAFT = Object.freeze({
  statement:
    "These symptoms have been getting worse rather than better, and they are starting to affect my work. I would like to understand what is going on and get a plan for what to do next.",
  appointmentGoal:
    "I want to understand why my headaches and fatigue have been getting worse, and to get a plan for what to track next.",
  questions: MOCK_QUESTIONS,
});

const draftStore = createLocalStore("advoc8.brief.draft.v1", DEFAULT_DRAFT);

/**
 * Everything the user writes themselves: their statement, their appointment
 * goal, and their question list. Survives a reload.
 *
 * Generated questions are drafts like any other: edit, delete or add freely.
 * Their version is what gets printed and exported.
 */
export function useBriefDraft() {
  const [draft, setDraft, isReady] = useLocalStore(draftStore);

  const setStatement = useCallback(
    (statement) => setDraft((current) => ({ ...current, statement })),
    [setDraft],
  );

  const setAppointmentGoal = useCallback(
    (appointmentGoal) => setDraft((current) => ({ ...current, appointmentGoal })),
    [setDraft],
  );

  const setQuestions = useCallback(
    (questions) => setDraft((current) => ({ ...current, questions })),
    [setDraft],
  );

  return { draft, isReady, setStatement, setAppointmentGoal, setQuestions };
}