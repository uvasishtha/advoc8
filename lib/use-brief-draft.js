"use client";

import { useCallback, useEffect, useState } from "react";

const DRAFT_KEY = "advoc8.brief.draft.v1";

const DEFAULT_DRAFT = {
  statement:
    "These symptoms have been getting worse rather than better, and they are starting to affect my work. I would like to understand what is going on and get a plan for what to do next.",
  appointmentGoal:
    "I want to understand why my headaches and fatigue have been getting worse, and to get a plan for what to track next.",
  questions: [],
};

/**
 * Everything the user writes themselves lives here and survives a reload.
 *
 * Generated questions are drafts too: the user can edit, delete or add any of
 * them, and their version is what gets printed and exported.
 */
export function useBriefDraft() {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (stored) setDraft((current) => ({ ...current, ...JSON.parse(stored) }));
    } catch {
      // Ignore unreadable storage and fall back to the defaults.
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Draft stays in memory for this session only.
    }
  }, [draft, isReady]);

  const setStatement = useCallback((statement) => {
    setDraft((current) => ({ ...current, statement }));
  }, []);

  const setAppointmentGoal = useCallback((appointmentGoal) => {
    setDraft((current) => ({ ...current, appointmentGoal }));
  }, []);

  const setQuestions = useCallback((questions) => {
    setDraft((current) => ({ ...current, questions }));
  }, []);

  return { draft, isReady, setStatement, setAppointmentGoal, setQuestions };
}