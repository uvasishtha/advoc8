"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { buildReport } from "@/lib/analytics";
import { todayIso } from "@/lib/format";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import {
  EMPTY_ONBOARDING,
  SAMPLE_ONBOARDING,
  SETUP_STATUS,
  buildAccess,
  buildProfile,
  normaliseSurvey,
} from "@/lib/onboarding";
import {
  MOCK_CONTEXT_ENTRIES,
  MOCK_SYMPTOM_ENTRIES,
  SAMPLE_APPOINTMENT_GOAL,
  SAMPLE_GOAL_IDS,
} from "@/lib/seed/maya";
import { draftStore, resetBriefDraft, seedBriefDraft } from "@/lib/use-brief-draft";

const EMPTY_ENTRIES = Object.freeze({ symptomEntries: [], contextEntries: [] });
const LOCAL_USER_ID = "user-local";

const entriesStore = createLocalStore("advoc8.entries.v1", EMPTY_ENTRIES);
const onboardingStore = createLocalStore("advoc8.onboarding.v1", EMPTY_ONBOARDING);

const DataContext = createContext(null);

/**
 * The single source of truth for the prototype.
 *
 * Everything the app shows is derived here, in one place, from three stored
 * records: the setup answers, the tracking rows, and the words the user wrote
 * for themselves.
 *
 *   onboarding answers -> profile -> access (what is unlocked) + brief header
 *   tracking rows      -> report  -> what you've experienced, noticed, missing
 *   the brief draft    -> statement, goal and questions, which are editable
 *
 * Nothing below recomputes a number or keeps its own copy. The analytics run
 * over exactly the rows the user has logged; no model is asked for a statistic.
 * The statement is passed into the report because a brief that already says what
 * the user wants does not need to flag it as missing.
 *
 * Persistence is localStorage for the prototype. When Supabase is wired in,
 * only the store definitions change: point them at route handlers and every
 * downstream component keeps working unchanged.
 */
export function DataProvider({ children }) {
  const [entries, setEntries, entriesReady] = useLocalStore(entriesStore);
  const [onboarding, setOnboarding, onboardingReady] = useLocalStore(onboardingStore);
  const [draft, setDraft, draftReady] = useLocalStore(draftStore);

  // Transient UI state: which lock was clicked, and whether the setup reminder
  // was dismissed for this visit. Neither is worth persisting.
  const [lockedFeatureId, setLockedFeatureId] = useState(null);
  const [isReminderDismissed, setIsReminderDismissed] = useState(false);

  const isReady = entriesReady && onboardingReady && draftReady;
  const { symptomEntries, contextEntries } = entries;

  const profile = useMemo(() => buildProfile(onboarding), [onboarding]);

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries, profile, statement: draft.statement }),
    [symptomEntries, contextEntries, profile, draft.statement],
  );

  const access = useMemo(
    () => buildAccess({ onboarding, symptomEntries }),
    [onboarding, symptomEntries],
  );

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

  /** Ticking a goal is a toggle, so the whole list is written each time. */
  const toggleGoal = useCallback(
    (goalId) =>
      setDraft((current) => ({
        ...current,
        goalIds: current.goalIds.includes(goalId)
          ? current.goalIds.filter((id) => id !== goalId)
          : [...current.goalIds, goalId],
      })),
    [setDraft],
  );

  const lockedFeature = lockedFeatureId ? access.features[lockedFeatureId] ?? null : null;

  const addSymptomEntry = useCallback(
    (entry) => {
      const row = {
        user_id: LOCAL_USER_ID,
        ...entry,
        id: entry.id ?? `sym-${entry.date}-${entry.symptom}-${Date.now()}`,
      };
      setEntries((current) => ({ ...current, symptomEntries: [row, ...current.symptomEntries] }));
    },
    [setEntries],
  );

  const removeSymptomEntry = useCallback(
    (id) => {
      setEntries((current) => ({
        ...current,
        symptomEntries: current.symptomEntries.filter((entry) => entry.id !== id),
      }));
    },
    [setEntries],
  );

  const upsertContextEntry = useCallback(
    (entry) => {
      setEntries((current) => {
        const index = current.contextEntries.findIndex((item) => item.date === entry.date);

        if (index === -1) {
          return {
            ...current,
            contextEntries: [
              ...current.contextEntries,
              { ...entry, id: `ctx-${entry.date}`, user_id: LOCAL_USER_ID },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          };
        }

        const next = [...current.contextEntries];
        next[index] = { ...next[index], ...entry };
        return { ...current, contextEntries: next };
      });
    },
    [setEntries],
  );

  /** Finishing the survey also writes the first version of the brief's own words. */
  const completeOnboarding = useCallback(
    (answers) => {
      const clean = normaliseSurvey(answers);

      setOnboarding((current) => ({
        ...EMPTY_ONBOARDING,
        ...current,
        ...clean,
        status: SETUP_STATUS.COMPLETED,
        completedAt: new Date().toISOString(),
        skippedAt: null,
        source: "local",
      }));

      seedBriefDraft({ statement: clean.doctorNote });
    },
    [setOnboarding],
  );

  const skipOnboarding = useCallback(() => {
    setOnboarding((current) => ({
      ...EMPTY_ONBOARDING,
      ...current,
      status: SETUP_STATUS.SKIPPED,
      skippedAt: new Date().toISOString(),
    }));
  }, [setOnboarding]);

  /**
   * Loads Maya's sample data. This is the developer override behind the landing
   * page.
   *
   * `unlock: true` — the finished app: sample profile included, so every
   * feature is open and a dev can see all of it at once.
   *
   * `unlock: false` — the same tracking rows behind a first-run profile: the
   * survey still asks its questions, and until they are answered the
   * personalised features stay locked. Resets the profile rather than trusting
   * whatever state this browser was already in, so the button always lands the
   * same way.
   */
  const resetToSampleData = useCallback(
    ({ unlock = true } = {}) => {
      setEntries({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: MOCK_CONTEXT_ENTRIES });

      if (unlock) {
        setOnboarding({ ...SAMPLE_ONBOARDING });
        seedBriefDraft({
          statement: SAMPLE_ONBOARDING.doctorNote,
          appointmentGoal: SAMPLE_APPOINTMENT_GOAL,
          goalIds: SAMPLE_GOAL_IDS,
        });
        return;
      }

      // No sample words here: these are a stranger's records, not this person's
      // profile. The survey supplies the statement once it is answered.
      setOnboarding({ ...EMPTY_ONBOARDING });
      resetBriefDraft();
    },
    [setEntries, setOnboarding],
  );

  const clearAllEntries = useCallback(() => {
    setEntries(EMPTY_ENTRIES);
  }, [setEntries]);

  /** Back to a brand new user: no answers, no entries, no draft. */
  const startFresh = useCallback(() => {
    setEntries(EMPTY_ENTRIES);
    setOnboarding({ ...EMPTY_ONBOARDING });
    resetBriefDraft();
    setIsReminderDismissed(false);
  }, [setEntries, setOnboarding]);

  /**
   * Called by anything that wants to open a gated feature. Returns false when
   * the feature is locked, in which case the caller shows the explanation modal
   * instead of navigating. A locked button is never a dead button.
   */
  const requestFeature = useCallback(
    (featureId) => {
      const feature = access.features[featureId];
      if (!feature || feature.unlocked) return true;
      setLockedFeatureId(featureId);
      return false;
    },
    [access],
  );

  const closeFeaturePrompt = useCallback(() => setLockedFeatureId(null), []);

  const value = useMemo(
    () => ({
      user: profile,
      profile,
      onboarding,
      isReady,
      isLoading: !isReady,
      symptomEntries,
      contextEntries,
      report,
      access,
      lockedFeature,
      draft,
      setStatement,
      setAppointmentGoal,
setQuestions,
      toggleGoal,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      completeOnboarding,
      skipOnboarding,
      resetToSampleData,
      clearAllEntries,
      startFresh,
      requestFeature,
      closeFeaturePrompt,
      dismissReminder: () => setIsReminderDismissed(true),
      isReminderDismissed,
      today: todayIso(),
    ]),
    [
      profile,
      onboarding,
      isReady,
      symptomEntries,
      contextEntries,
      report,
      access,
      lockedFeature,
      draft,
      setStatement,
      setAppointmentGoal,
      setQuestions,
      toggleGoal,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      completeOnboarding,
      skipOnboarding,
      resetToSampleData,
      clearAllEntries,
      startFresh,
      requestFeature,
      closeFeaturePrompt,
      isReminderDismissed,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAdvoc8() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAdvoc8 must be used inside <DataProvider>");
  return context;
}