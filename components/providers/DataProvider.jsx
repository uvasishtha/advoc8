"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { buildReport } from "@/lib/analytics";
import { findSymptomConnections } from "@/lib/analytics/connections";
import { todayIso } from "@/lib/format";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import {
  EMPTY_ONBOARDING,
  SAMPLE_ONBOARDING,
  SETUP_STATUS,
  buildProfile,
  normaliseSurvey,
} from "@/lib/onboarding";
import {
  MOCK_CONTEXT_ENTRIES,
  MOCK_SYMPTOM_ENTRIES,
} from "@/lib/seed/maya";
import { draftStore, resetBriefDraft, seedBriefDraft } from "@/lib/brief-draft";

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
 *   onboarding answers -> profile -> brief header
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

  const isReady = entriesReady && onboardingReady && draftReady;
  const { symptomEntries, contextEntries } = entries;

  const profile = useMemo(() => buildProfile(onboarding), [onboarding]);

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries, profile, statement: draft.statement }),
    [symptomEntries, contextEntries, profile, draft.statement],
  );

  /**
   * The strongest relationships in the user's own records. Computed separately
   * from the report because it is a different question — it compares groups of
   * days and ranks them — and because it is consumed by the brief, the
   * appointment-prep page and the printed sheet, all from one source.
   */
  const connections = useMemo(
    () => findSymptomConnections({ symptomEntries, contextEntries }),
    [symptomEntries, contextEntries],
  );

  const setStatement = useCallback(
    (statement) => setDraft((current) => ({ ...current, statement })),
    [setDraft],
  );

  const setQuestions = useCallback(
    (questions) => setDraft((current) => ({ ...current, questions })),
    [setDraft],
  );

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
   * Loads Maya's sample data. Offered from Home when there is nothing tracked
   * yet, and from Settings at any other time.
   *
   * `unlock: true` — the finished app: sample profile included, so every
   * feature is open and the brief is immediately readable.
   *
   * `unlock: false` — the same tracking rows behind a blank profile: the survey
   * still asks its questions. Resets the profile rather than trusting whatever
   * state this browser was already in, so the button always lands the same way.
   */
  const resetToSampleData = useCallback(
    ({ unlock = true } = {}) => {
      setEntries({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: MOCK_CONTEXT_ENTRIES });

      if (unlock) {
        setOnboarding({ ...SAMPLE_ONBOARDING });
        seedBriefDraft({ statement: SAMPLE_ONBOARDING.doctorNote });
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
  }, [setEntries, setOnboarding]);

  const value = useMemo(
    () => ({
      user: profile,
      profile,
      onboarding,
      isReady,
      symptomEntries,
      contextEntries,
      report,
      connections,
      draft,
      setStatement,
      setQuestions,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      completeOnboarding,
      skipOnboarding,
      resetToSampleData,
      clearAllEntries,
      startFresh,
      today: todayIso(),
    }),
    [
      profile,
      onboarding,
      isReady,
      symptomEntries,
      contextEntries,
      report,
      connections,
      draft,
      setStatement,
      setQuestions,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      completeOnboarding,
      skipOnboarding,
      resetToSampleData,
      clearAllEntries,
      startFresh,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAdvoc8() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAdvoc8 must be used inside <DataProvider>");
  return context;
}