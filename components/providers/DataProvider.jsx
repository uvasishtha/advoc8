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
import { todayIso } from "@/lib/format";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import {
  buildAccess,
  buildProfile,
  SAMPLE_ONBOARDING,
} from "@/lib/onboarding";
import {
  MOCK_CONTEXT_ENTRIES,
  MOCK_SYMPTOM_ENTRIES,
  SAMPLE_USER,
} from "@/lib/seed/maya";

const EMPTY_ENTRIES = {
  symptomEntries: [],
  contextEntries: [],
};

const DEFAULT_ENTRIES = {
  symptomEntries: MOCK_SYMPTOM_ENTRIES,
  contextEntries: MOCK_CONTEXT_ENTRIES,
};

const entriesStore = createLocalStore("advoc8.entries.v1", DEFAULT_ENTRIES);
const DataContext = createContext(null);

function copySampleEntries() {
  return {
    symptomEntries: MOCK_SYMPTOM_ENTRIES.map((entry) => ({ ...entry })),
    contextEntries: MOCK_CONTEXT_ENTRIES.map((entry) => ({ ...entry })),
  };
}

export function DataProvider({ children }) {
  const [entries, setEntries, isReady] = useLocalStore(entriesStore);
  const [lockedFeature, setLockedFeature] = useState(null);

  const symptomEntries = Array.isArray(entries?.symptomEntries)
    ? entries.symptomEntries
    : [];

  const contextEntries = Array.isArray(entries?.contextEntries)
    ? entries.contextEntries
    : [];

  // Load sample data once if an earlier version saved an empty demo record.
  // The marker prevents this from undoing a user's later choice to clear data.
  useEffect(() => {
    if (!isReady) return;

    try {
      const marker = "advoc8.demo.initialized.v1";

      if (window.localStorage.getItem(marker)) return;

      if (symptomEntries.length === 0 && contextEntries.length === 0) {
        setEntries(copySampleEntries());
      }

      window.localStorage.setItem(marker, "true");
    } catch {
      // The demo remains usable if browser storage is unavailable.
    }
  }, [isReady, symptomEntries.length, contextEntries.length, setEntries]);

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries }),
    [symptomEntries, contextEntries],
  );

  // Use a fixed sample profile for demo mode; no account or Supabase session
  // is required.
  const user = useMemo(
    () => ({
      ...SAMPLE_USER,
      ...buildProfile(SAMPLE_ONBOARDING, SAMPLE_USER.id),
      appointmentGoal: SAMPLE_USER.appointmentGoal,
      appointmentDate: SAMPLE_USER.appointmentDate,
      appointmentType: SAMPLE_USER.appointmentType,
    }),
    [],
  );

  const access = useMemo(
    () =>
      buildAccess({
        onboarding: SAMPLE_ONBOARDING,
        symptomEntries,
      }),
    [symptomEntries],
  );

  const addSymptomEntry = useCallback(
    (entry) => {
      const row = {
        ...entry,
        user_id: SAMPLE_USER.id,
        id: entry.id ?? `sym-${entry.date}-${entry.symptom}-${Date.now()}`,
      };

      setEntries((current) => ({
        ...current,
        symptomEntries: [row, ...(current.symptomEntries ?? [])],
      }));
    },
    [setEntries],
  );

  const removeSymptomEntry = useCallback(
    (id) => {
      setEntries((current) => ({
        ...current,
        symptomEntries: (current.symptomEntries ?? []).filter(
          (entry) => entry.id !== id,
        ),
      }));
    },
    [setEntries],
  );

  const upsertContextEntry = useCallback(
    (entry) => {
      setEntries((current) => {
        const currentEntries = current.contextEntries ?? [];
        const index = currentEntries.findIndex(
          (item) => item.date === entry.date,
        );

        if (index === -1) {
          return {
            ...current,
            contextEntries: [
              ...currentEntries,
              {
                ...entry,
                id: entry.id ?? `ctx-${entry.date}`,
                user_id: SAMPLE_USER.id,
              },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          };
        }

        const next = [...currentEntries];
        next[index] = {
          ...next[index],
          ...entry,
          user_id: SAMPLE_USER.id,
        };

        return { ...current, contextEntries: next };
      });
    },
    [setEntries],
  );

  const resetToSampleData = useCallback(() => {
    setEntries(copySampleEntries());
    setLockedFeature(null);

    try {
      window.localStorage.setItem("advoc8.demo.initialized.v1", "true");
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [setEntries]);

  const clearAllEntries = useCallback(() => {
    setEntries({
      symptomEntries: [],
      contextEntries: [],
    });
    setLockedFeature(null);

    try {
      window.localStorage.setItem("advoc8.demo.initialized.v1", "true");
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [setEntries]);

  // In demo mode, starting fresh clears the tracking record.
  const startFresh = clearAllEntries;

  // Skipping setup opens the sample demo instead of requiring an account.
  const skipOnboarding = resetToSampleData;

  const closeFeaturePrompt = useCallback(() => {
    setLockedFeature(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      access,
      isReady,
      isLoading: !isReady,
      symptomEntries,
      contextEntries,
      report,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      resetToSampleData,
      clearAllEntries,
      startFresh,
      skipOnboarding,
      lockedFeature,
      closeFeaturePrompt,
      today: todayIso(),
    }),
    [
      user,
      access,
      isReady,
      symptomEntries,
      contextEntries,
      report,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      resetToSampleData,
      clearAllEntries,
      startFresh,
      skipOnboarding,
      lockedFeature,
      closeFeaturePrompt,
    ],
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useAdvoc8() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useAdvoc8 must be used inside <DataProvider>");
  }

  return context;
}
