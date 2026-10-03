"use client";

import { useCallback } from "react";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { MOCK_QUESTIONS } from "@/lib/seed/maya";

const EMPTY_DRAFT = Object.freeze({
  statement: "",
  appointmentGoal: "",
  questions: MOCK_QUESTIONS,
});

const draftStore = createLocalStore("advoc8.brief.draft.v1", EMPTY_DRAFT);

/**
 * Everything the user writes themselves: their statement, their appointment
 * goal, and their question list. Survives a reload.
 *
 * These start empty on purpose. The setup survey writes the first version of the
 * statement and the goal, so there is one place a user's own words live rather
 * than a sample default sitting behind them. Generated questions are drafts
 * like any other: edit, delete or add freely. Their version is what gets
 * printed and exported.
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

/**
 * Called when the survey is completed and when the sample data is restored.
 * Empty answers are ignored so finishing setup never blanks a statement the
 * user has since written by hand.
 */
export function seedBriefDraft({ statement, appointmentGoal } = {}) {
  draftStore.setSnapshot((current) => {
    const next = { ...current };

    if (typeof statement === "string" && statement.trim() && !current.statement.trim()) {
      next.statement = statement.trim();
    }

    if (
      typeof appointmentGoal === "string" &&
      appointmentGoal.trim() &&
      !current.appointmentGoal.trim()
    ) {
      next.appointmentGoal = appointmentGoal.trim();
    }

    return next;
  });
}

export function resetBriefDraft() {
  draftStore.setSnapshot(EMPTY_DRAFT);
}