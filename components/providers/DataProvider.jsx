"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildReport } from "@/lib/analytics";
import { todayIso } from "@/lib/format";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES, SAMPLE_USER } from "@/lib/seed/maya";

const STORAGE_KEY = "advoc8.entries.v1";

const DataContext = createContext(null);

/**
 * Holds the user's tracking rows and derives the report from them.
 *
 * The analytics run here, in the browser, over exactly the rows the user has
 * logged. Nothing in this provider asks a model for a statistic.
 *
 * Persistence is localStorage for the prototype. When Supabase is wired in,
 * this provider is the only file that changes: swap the load/save helpers for
 * the route handlers and everything downstream keeps working.
 */
export function DataProvider({ children }) {
  const [symptomEntries, setSymptomEntries] = useState([]);
  const [contextEntries, setContextEntries] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSymptomEntries(parsed.symptomEntries ?? []);
        setContextEntries(parsed.contextEntries ?? []);
        setIsReady(true);
        return;
      }
    } catch {
      // Corrupt or unavailable storage falls through to the sample data.
    }

    setSymptomEntries(MOCK_SYMPTOM_ENTRIES);
    setContextEntries(MOCK_CONTEXT_ENTRIES);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ symptomEntries, contextEntries }),
      );
    } catch {
      // Storage full or blocked: the app still works for this session.
    }
  }, [symptomEntries, contextEntries, isReady]);

  const report = useMemo(
    () => buildReport({ symptomEntries, contextEntries }),
    [symptomEntries, contextEntries],
  );

  const addSymptomEntry = useCallback((entry) => {
    setSymptomEntries((previous) => [
      { ...entry, id: entry.id ?? `sym-${entry.date}-${entry.symptom}-${Date.now()}` },
      ...previous,
    ]);
  }, []);

  const removeSymptomEntry = useCallback((id) => {
    setSymptomEntries((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const upsertContextEntry = useCallback((entry) => {
    setContextEntries((previous) => {
      const existing = previous.findIndex((item) => item.date === entry.date);
      if (existing === -1) return [...previous, { ...entry, id: `ctx-${entry.date}` }].sort((a, b) => a.date.localeCompare(b.date));
      const copy = [...previous];
      copy[existing] = { ...copy[existing], ...entry };
      return copy;
    });
  }, []);

  const resetToSampleData = useCallback(() => {
    setSymptomEntries(MOCK_SYMPTOM_ENTRIES);
    setContextEntries(MOCK_CONTEXT_ENTRIES);
  }, []);

  const clearAllEntries = useCallback(() => {
    setSymptomEntries([]);
    setContextEntries([]);
  }, []);

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