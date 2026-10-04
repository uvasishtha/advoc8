"use client";

import { MOCK_QUESTIONS } from "@/lib/seed/maya";
import { createLocalStore } from "@/lib/local-store";

const EMPTY_DRAFT = Object.freeze({
  statement: "",
  appointmentGoal: "",
  goalIds: [],
  questions: MOCK_QUESTIONS,
});

/**
 * Everything the user writes themselves: their statement, their appointment
 * goal, and their question list. Survives a reload.
 *
 * The draft is one record with one owner. `DataProvider` subscribes to it and
 * hands `draft`, `setStatement`, `setAppointmentGoal` and `setQuestions` down
 * through context, so there is no second way to read it and no way for the
 * brief and the rehearsal to disagree about what the user wrote.
 *
 * These start empty on purpose. The setup survey writes the first version of the
 * statement and the goal, so there is one place a user's own words live rather
 * than a sample default sitting behind them. Generated questions are drafts
 * like any other: edit, delete or add freely.
 */
export const draftStore = createLocalStore("advoc8.brief.draft.v1", EMPTY_DRAFT);

/**
 * Called when the survey is completed and when the sample data is restored.
 * Empty answers are ignored so finishing setup never blanks a statement the
 * user has since written by hand.
 */
export function seedBriefDraft({ statement, appointmentGoal, goalIds } = {}) {
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

    if (Array.isArray(goalIds) && goalIds.length > 0 && current.goalIds.length === 0) {
      next.goalIds = goalIds;
    }

    return next;
  });
}

export function resetBriefDraft() {
  draftStore.setSnapshot(EMPTY_DRAFT);
}