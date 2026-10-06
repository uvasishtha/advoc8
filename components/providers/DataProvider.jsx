"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { buildReport } from "@/lib/analytics";
import { findSymptomConnections } from "@/lib/analytics/connections";
import { todayIso } from "@/lib/format";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
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
} from "@/lib/seed/maya";
import { draftStore, resetBriefDraft, seedBriefDraft } from "@/lib/brief-draft";

const EMPTY_ENTRIES = Object.freeze({ symptomEntries: [], contextEntries: [] });

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

  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Transient UI state: which lock was clicked. Not worth persisting.
  const [lockedFeatureId, setLockedFeatureId] = useState(null);

  useEffect(() => {
    async function initializeUser() {
      let user = null;

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        user = sessionData.session.user;
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error("Supabase anonymous auth failed:", error);
        } else {
          user = data.user;
        }
      }

      if (!user) {
        setSupabaseReady(true);
        return;
      }

      setSupabaseUser(user);

      const { error: usersError } = await supabase
        .from("users")
        .upsert({ id: user.id, email: user.email ?? "" });

      if (usersError) {
        console.error("Failed to upsert user:", usersError);
      }

      const { data: rows, error: loadError } = await supabase
        .from("symptom_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (loadError) {
        console.error("Failed to load symptoms:", loadError);
      } else if (rows?.length) {
        setEntries((current) => ({ ...current, symptomEntries: rows }));
      }

      setSupabaseReady(true);
    }

    initializeUser();
  }, []);

  const isReady =
    entriesReady && onboardingReady && draftReady && supabaseReady;
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

  const access = useMemo(
    () => buildAccess({ onboarding, symptomEntries }),
    [onboarding, symptomEntries],
  );

  const setStatement = useCallback(
    (statement) => setDraft((current) => ({ ...current, statement })),
    [setDraft],
  );

  const setQuestions = useCallback(
    (questions) => setDraft((current) => ({ ...current, questions })),
    [setDraft],
  );

  const lockedFeature = lockedFeatureId ? access.features[lockedFeatureId] ?? null : null;

  const addSymptomEntry = useCallback(
    async (entry) => {
      if (supabaseUser) {
        const row = {
          user_id: supabaseUser.id,
          symptom: entry.symptom,
          date: entry.date,
          severity: entry.severity ?? null,
          duration_minutes: entry.duration_minutes ?? null,
          notes: entry.notes ?? null,
          impact: entry.impact ?? null,
        };

        const { data, error } = await supabase
          .from("symptom_entries")
          .insert(row)
          .select()
          .single();

        if (error) {
          console.error("Failed to save symptom:", error);
        } else if (data) {
          setEntries((current) => ({
            ...current,
            symptomEntries: [data, ...current.symptomEntries],
          }));
          return;
        }
      }

      const row = {
        user_id: supabaseUser?.id ?? "user-local",
        ...entry,
        id: entry.id ?? `sym-${entry.date}-${entry.symptom}-${Date.now()}`,
      };

      setEntries((current) => ({
        ...current,
        symptomEntries: [row, ...current.symptomEntries],
      }));
    },
    [supabaseUser, setEntries],
  );

  const removeSymptomEntry = useCallback(
    (id) => {
      setEntries((current) => ({
        ...current,
        symptomEntries: current.symptomEntries.filter((entry) => entry.id !== id),
      }));

      if (supabaseUser) {
        const entry = symptomEntries.find((item) => item.id === id);

        if (entry?.user_id === supabaseUser.id) {
          void supabase
            .from("symptom_entries")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Failed to delete symptom:", error);
            });
        }
      }
    },
    [supabaseUser, symptomEntries, setEntries],
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
            { ...entry, id: `ctx-${entry.date}`, user_id: supabaseUser?.id },
            ].sort((a, b) => a.date.localeCompare(b.date)),
           };
         }

         const next = [...current.contextEntries];
         next[index] = { ...next[index], ...entry };
         return { ...current, contextEntries: next };
       });
     },
     [setEntries, supabaseUser],
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

  /** Maya's sample month: the tracking rows, and the words her brief is built on. */
  const loadSampleRecords = useCallback(() => {
    setEntries({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: MOCK_CONTEXT_ENTRIES });
    seedBriefDraft({ statement: SAMPLE_ONBOARDING.doctorNote });
  }, [setEntries]);

  /**
   * Skipping is not an empty profile. It hands over the sample month in full, so
   * the app has something to show on the other side of the survey instead of an
   * empty dashboard and two locked features.
   *
   * The status stays "skipped" rather than "completed": nothing was answered, so
   * the reminder that setup is unfinished keeps its honesty, and Settings still
   * offers to redo it.
   */
  const skipOnboarding = useCallback(() => {
    loadSampleRecords();

    setOnboarding({
      ...SAMPLE_ONBOARDING,
      status: SETUP_STATUS.SKIPPED,
      completedAt: null,
      skippedAt: new Date().toISOString(),
    });
  }, [loadSampleRecords, setOnboarding]);

  /**
   * Loads Maya's sample data. Offered from Home when there is nothing tracked
   * yet, and from Settings at any other time.
   *
   * `unlock: true` — the finished app: sample profile included, so every
   * feature is open and the brief is immediately readable.
   *
   * `unlock: false` — the same tracking rows behind a first-run profile: the
   * survey still asks its questions, and until they are answered the
   * personalised features stay locked. Resets the profile rather than trusting
   * whatever state this browser was already in, so the button always lands the
   * same way.
   */
  const resetToSampleData = useCallback(
    ({ unlock = true } = {}) => {
      if (unlock) {
        loadSampleRecords();
        setOnboarding({ ...SAMPLE_ONBOARDING });
        return;
      }

      // The same tracking rows behind a blank profile, and none of Maya's words:
      // these are a stranger's records, and the survey supplies the statement
      // once it is answered.
      setEntries({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: MOCK_CONTEXT_ENTRIES });
      setOnboarding({ ...EMPTY_ONBOARDING });
      resetBriefDraft();
    },
    [loadSampleRecords, setEntries, setOnboarding],
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
      symptomEntries,
      contextEntries,
      report,
      access,
      connections,
      lockedFeature,
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
      requestFeature,
      closeFeaturePrompt,
      today: todayIso(),
    }),
    [
      profile,
      onboarding,
      isReady,
      symptomEntries,
      contextEntries,
      report,
      access,
      connections,
      lockedFeature,
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
      requestFeature,
      closeFeaturePrompt,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAdvoc8() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAdvoc8 must be used inside <DataProvider>");
  return context;
}