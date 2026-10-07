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
  MOCK_QUESTIONS,
} from "@/lib/seed/maya";
import { resetBriefDraft, seedBriefDraft, useDraftStore } from "@/lib/brief-draft";

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
 * Supabase is the single persistence layer. All writes go to Supabase; React
 * state is the in-memory view consumed by the UI and analytics.
 */
export function DataProvider({ children }) {
  const [symptomEntries, setSymptomEntries] = useState([]);
  const [contextEntries, setContextEntries] = useState([]);
  const [onboarding, setOnboarding] = useState(EMPTY_ONBOARDING);
  const [draft, setDraft] = useDraftStore();

  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Transient UI state: which lock was clicked. Not worth persisting.
  const [lockedFeatureId, setLockedFeatureId] = useState(null);

  const loadUserData = useCallback(async (user) => {
    const [symptomsRes, contextRes, profileRes, briefRes] = await Promise.all([
      supabase
        .from("symptoms")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("context_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("brief_drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (symptomsRes.error) {
      console.error("Failed to load symptoms:", symptomsRes.error);
    } else if (symptomsRes.data?.length) {
      setSymptomEntries(
        symptomsRes.data.map((row) => ({
          ...row,
          duration_minutes: row.duration ?? null,
        })),
      );
    }

    if (contextRes.error) {
      console.error("Failed to load context:", contextRes.error);
    } else if (contextRes.data?.length) {
      setContextEntries(
        contextRes.data.map((row) => ({
          ...row,
          sleep_hours: row.sleep ?? null,
          stress_level: row.stress ?? null,
        })),
      );
    }

    if (profileRes.error) {
      console.error("Failed to load profile:", profileRes.error);
    } else if (profileRes.data) {
      const data = profileRes.data.onboarding_data ?? {};
      setOnboarding((current) => ({
        ...current,
        ...data,
        status: profileRes.data.onboarding_status ?? SETUP_STATUS.COMPLETED,
        completedAt: profileRes.data.completed_at ?? current.completedAt,
        skippedAt: profileRes.data.skipped_at ?? current.skippedAt,
        source: profileRes.data.source ?? current.source,
      }));
    }

    if (briefRes.error) {
      console.error("Failed to load brief:", briefRes.error);
    } else if (briefRes.data) {
      setDraft({
        statement: briefRes.data.statement ?? "",
        questions: Array.isArray(briefRes.data.questions) ? briefRes.data.questions : [],
      });
    }
  }, [setDraft, setSymptomEntries, setContextEntries, setOnboarding]);

  useEffect(() => {
    async function initializeUser() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;

      if (user) {
        await loadUserData(user);
      }

      setSupabaseReady(true);
    }

    initializeUser();
  }, [setDraft, loadUserData]);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setSupabaseUser(session.user);
          await loadUserData(session.user);
          setSupabaseReady(true);
        } else if (event === "SIGNED_OUT") {
          setSupabaseUser(null);
          setSymptomEntries([]);
          setContextEntries([]);
          setOnboarding({ ...EMPTY_ONBOARDING });
          resetBriefDraft();
          setSupabaseReady(true);
        }
      },
    );

    return () => {
      subscription.subscription?.unsubscribe?.();
    };
  }, [loadUserData, setContextEntries, setOnboarding, setSupabaseReady, setSupabaseUser, setSymptomEntries]);

  const isReady = supabaseReady;

  const profile = useMemo(() => buildProfile(onboarding, supabaseUser?.id), [onboarding, supabaseUser]);

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries, profile, statement: draft.statement }),
    [symptomEntries, contextEntries, profile, draft.statement],
  );

  const connections = useMemo(
    () => findSymptomConnections({ symptomEntries, contextEntries }),
    [symptomEntries, contextEntries],
  );

  const access = useMemo(
    () => buildAccess({ onboarding, symptomEntries }),
    [onboarding, symptomEntries],
  );

  const lockedFeature = lockedFeatureId ? access.features[lockedFeatureId] ?? null : null;

  const addSymptomEntry = useCallback(
    async (entry) => {
      const tempRow = {
        user_id: supabaseUser.id,
        symptom: entry.symptom,
        date: entry.date,
        severity: entry.severity ?? null,
        duration_minutes: entry.duration_minutes ?? null,
        notes: entry.notes ?? null,
        impact: entry.impact ?? null,
        id: `sym-${entry.date}-${entry.symptom}-${Date.now()}`,
      };

      setSymptomEntries((current) => [tempRow, ...current]);

      const { data, error } = await supabase
        .from("symptoms")
        .insert({
          user_id: supabaseUser.id,
          symptom: entry.symptom,
          date: entry.date,
          severity: entry.severity ?? null,
          duration: entry.duration_minutes ?? null,
          notes: entry.notes ?? null,
          impact: entry.impact ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to save symptom:", error);
        return;
      }

      setSymptomEntries((current) =>
        current.map((row) => (row.id === tempRow.id ? { ...data, duration_minutes: data.duration ?? null } : row)),
      );
    },
    [supabaseUser],
  );

  const removeSymptomEntry = useCallback(
    async (id) => {
      const entry = symptomEntries.find((item) => item.id === id);

      setSymptomEntries((current) =>
        current.filter((entry) => entry.id !== id),
      );

      if (entry?.user_id === supabaseUser.id) {
        const { error } = await supabase
          .from("symptoms")
          .delete()
          .eq("id", id);

        if (error) console.error("Failed to delete symptom:", error);
      }
    },
    [supabaseUser, symptomEntries],
  );

  const upsertContextEntry = useCallback(
    async (entry) => {
      const row = {
        user_id: supabaseUser.id,
        date: entry.date,
        sleep: entry.sleep_hours ?? null,
        stress: entry.stress_level ?? null,
        cycle_phase: entry.cycle_phase ?? null,
        notes: entry.notes ?? null,
      };

      const { data, error } = await supabase
        .from("context_entries")
        .upsert(row, { onConflict: "user_id,date" })
        .select()
        .single();

      if (error) {
        console.error("Failed to save context:", error);
        return;
      }

      setContextEntries((current) => {
        const index = current.findIndex((item) => item.date === entry.date);
        if (index === -1) {
          return [data, ...current].sort((a, b) => a.date.localeCompare(b.date));
        }
        const next = [...current];
        next[index] = data;
        return next;
      });
    },
    [supabaseUser],
  );

  const saveEvidenceBrief = useCallback(
    async (reportSnapshot, statement, questions) => {
      if (!supabaseUser) return;

      const { error } = await supabase
        .from("brief_drafts")
        .upsert(
          {
            user_id: supabaseUser.id,
            statement,
            questions: Array.isArray(questions) ? questions : [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (error) {
        console.error("Failed to save brief:", error);
      }
    },
    [supabaseUser],
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

      setDraft((current) => ({
        ...current,
        statement: clean.doctorNote || current.statement,
      }));

      if (supabaseUser) {
        const profile = {
          id: supabaseUser.id,
          name: clean.firstName,
          onboarding_data: clean,
          onboarding_status: SETUP_STATUS.COMPLETED,
          completed_at: new Date().toISOString(),
          skipped_at: null,
          source: "local",
          updated_at: new Date().toISOString(),
        };

        void supabase
          .from("profiles")
          .upsert(profile)
          .then(({ error }) => {
            if (error) console.error("Failed to save profile:", error);
          });
      }
    },
    [supabaseUser, setDraft],
  );

  /** Maya's sample month: the tracking rows, and the words her brief is built on. */
  const loadSampleRecords = useCallback(() => {
    setSymptomEntries(MOCK_SYMPTOM_ENTRIES);
    setContextEntries(MOCK_CONTEXT_ENTRIES);
    seedBriefDraft({ statement: SAMPLE_ONBOARDING.doctorNote });
  }, []);

  const skipOnboarding = useCallback(() => {
    loadSampleRecords();

    setOnboarding({
      ...SAMPLE_ONBOARDING,
      status: SETUP_STATUS.SKIPPED,
      completedAt: null,
      skippedAt: new Date().toISOString(),
    });
  }, [loadSampleRecords]);

  const resetToSampleData = useCallback(
    ({ unlock = true } = {}) => {
      if (unlock) {
        setSymptomEntries(MOCK_SYMPTOM_ENTRIES);
        setContextEntries(MOCK_CONTEXT_ENTRIES);
        setOnboarding({ ...SAMPLE_ONBOARDING });
        setDraft({ statement: SAMPLE_ONBOARDING.doctorNote, questions: MOCK_QUESTIONS });
        return;
      }

      setSymptomEntries(MOCK_SYMPTOM_ENTRIES);
      setContextEntries(MOCK_CONTEXT_ENTRIES);
      setOnboarding({ ...EMPTY_ONBOARDING });
      resetBriefDraft();
    },
    [setSymptomEntries, setContextEntries, setOnboarding, setDraft],
  );

  const clearAllEntries = useCallback(async () => {
    if (supabaseUser) {
      await Promise.all([
        supabase.from("symptoms").delete().eq("user_id", supabaseUser.id),
        supabase.from("context_entries").delete().eq("user_id", supabaseUser.id),
      ]).catch((err) => console.error("Failed to clear entries:", err));
    }
    setSymptomEntries([]);
    setContextEntries([]);
  }, [supabaseUser]);

  const startFresh = useCallback(async () => {
    if (supabaseUser) {
      await Promise.all([
        supabase.from("symptoms").delete().eq("user_id", supabaseUser.id),
        supabase.from("context_entries").delete().eq("user_id", supabaseUser.id),
        supabase.from("profiles").delete().eq("id", supabaseUser.id),
        supabase.from("brief_drafts").delete().eq("user_id", supabaseUser.id),
      ]).catch((err) => console.error("Failed to start fresh:", err));
    }
    setSymptomEntries([]);
    setContextEntries([]);
    setOnboarding({ ...EMPTY_ONBOARDING });
    resetBriefDraft();
  }, [supabaseUser]);

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

  const setStatement = useCallback(
    (statement) => setDraft((current) => ({ ...current, statement })),
    [setDraft],
  );

  const setQuestions = useCallback(
    (questions) => setDraft((current) => ({ ...current, questions })),
    [setDraft],
  );

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
      saveEvidenceBrief,
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
      saveEvidenceBrief,
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
