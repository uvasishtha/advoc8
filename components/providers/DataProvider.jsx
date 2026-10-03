"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { buildReport } from "@/lib/analytics";
import { todayIso } from "@/lib/format";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES, SAMPLE_USER } from "@/lib/seed/maya";

const EMPTY = Object.freeze({ symptomEntries: [], contextEntries: [] });

const entriesStore = createLocalStore("advoc8.entries.v1", EMPTY);

const DataContext = createContext(null);

/**
 * Holds the user's tracking rows and derives the report from them.
 *
 * The analytics run here over exactly the rows the user has logged. Nothing in
 * this provider asks a model for a statistic.
 *
 * Persistence is localStorage for the prototype. When Supabase is wired in,
 * only the store definition changes: point it at the route handlers and every
 * downstream component keeps working unchanged.
 */
export function DataProvider({ children }) {
  const [entries, setEntries, isReady] = useLocalStore(entriesStore);

  const { symptomEntries, contextEntries } = entries;

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries }),
    [symptomEntries, contextEntries],
  );

  const addSymptomEntry = useCallback(
    (entry) => {
      const row = {
        user_id: SAMPLE_USER.id,
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
              { ...entry, id: `ctx-${entry.date}`, user_id: SAMPLE_USER.id },
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

  const resetToSampleData = useCallback(() => {
    setEntries({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: MOCK_CONTEXT_ENTRIES });
  }, [setEntries]);

  const clearAllEntries = useCallback(() => {
    setEntries(EMPTY);
  }, [setEntries]);

  const value = useMemo(
    () => ({
      user: SAMPLE_USER,
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
      today: todayIso(),
    }),
    [
      isReady,
      symptomEntries,
      contextEntries,
      report,
      addSymptomEntry,
      removeSymptomEntry,
      upsertContextEntry,
      resetToSampleData,
      clearAllEntries,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAdvoc8() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAdvoc8 must be used inside <DataProvider>");
  return context;
}