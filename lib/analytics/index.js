// Assembles the whole Evidence Brief from raw tracking rows.
//
// This is the only place that decides what the brief shows. The UI reads this
// object; it never recomputes a statistic. The LLM receives this object as
// input but never contributes to it.
//
// The report is organised around what a person can actually raise in a short
// appointment:
//
//   range + symptoms  -> 01 What I've Been Experiencing
//   observations      -> 02 What I've Noticed
//   gaps              -> 03 Make Sure I Mention
//
// Everything in sections 01 to 03 is computed here. Nothing is charted.

import { eachDayOfRange, formatDateRange, roundTo } from "@/lib/format";
import {
  averageSeverity,
  compareHalves,
  maximumSeverity,
  summarizeContext,
  symptomCoOccurrence,
  symptomFrequency,
  storyCoverage,
  trendDirection,
  uniqueSortedDates,
  weeksSpanned,
} from "./calculations";
import { buildObservations } from "./observations";
import { buildGaps } from "./gaps";
import { coverageStatement, experienceLine } from "./language";

const MIN_ENTRIES_FOR_STATEMENT = 3;
const MIN_SHARED_SYMPTOM_DAYS = 3;
const MAX_TRACKED_SYMPTOMS = 6;

function buildSymptomStats(name, entriesForSymptom, rangeDays) {
  const frequency = symptomFrequency(entriesForSymptom, rangeDays.length);
  const halves = compareHalves(entriesForSymptom, rangeDays);
  const dates = uniqueSortedDates(entriesForSymptom);
  const durations = entriesForSymptom
    .map((entry) => entry.duration_minutes)
    .filter((value) => value != null);

  return {
    name,
    entryCount: entriesForSymptom.length,
    daysReported: frequency.reportedDays,
    frequencyRate: frequency.rate,
    avgSeverity: averageSeverity(entriesForSymptom),
    maxSeverity: maximumSeverity(entriesForSymptom),
    minSeverity: entriesForSymptom.length
      ? entriesForSymptom.reduce((lowest, entry) => Math.min(lowest, entry.severity), Infinity)
      : null,
    avgDurationMinutes: durations.length
      ? roundTo(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : null,
    firstSeen: dates[0] ?? null,
    lastSeen: dates[dates.length - 1] ?? null,
    weeksLogged: weeksSpanned(dates),
    halves,
    trend: trendDirection(halves.delta),
    hasEnoughData: entriesForSymptom.length >= MIN_ENTRIES_FOR_STATEMENT,
  };
}

/**
 * How much a reader should trust the brief, expressed in terms the UI can say
 * out loud. A user with three entries still gets a real brief — the note just
 * tells them plainly that the comparisons will firm up with more logging.
 */
function buildReadiness(symptomEntries) {
  const entryCount = symptomEntries.length;
  const days = new Set(symptomEntries.map((entry) => entry.date)).size;
  const entriesLabel = `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`;

  if (entryCount === 0) {
    return { level: "none", entryCount, days, note: "No entries logged yet." };
  }

  if (entryCount < 5) {
    return {
      level: "starting",
      entryCount,
      days,
      note: `Built from ${entriesLabel}. Every number is accurate, and the observations firm up as you keep logging.`,
    };
  }

  if (entryCount < 15) {
    return {
      level: "building",
      entryCount,
      days,
      note: `Built from ${entriesLabel} across ${days} ${days === 1 ? "day" : "days"}. Patterns are starting to show.`,
    };
  }

  return {
    level: "rich",
    entryCount,
    days,
    note: `Built from ${entriesLabel} across ${days} days of tracking.`,
  };
}

/**
 * @param {object} input
 * @param {Array} input.symptomEntries
 * @param {Array} input.contextEntries
 * @param {object} [input.profile] Answers from the setup survey, so the brief
 *   can open with the person's own words instead of a placeholder.
 * @param {string} [input.statement] The user's own statement, if written, so a
 *   written statement can close its gap.
 */
export function buildReport({ symptomEntries = [], contextEntries = [], profile = null, statement = "" } = {}) {
  const allDates = uniqueSortedDates([...symptomEntries, ...contextEntries]);

  // Context rows set where the period starts and ends, but a brief with no
  // symptoms in it has nothing to report. Treating "sleep only" as a real
  // report produces a brief that says "0 entries logged on 0 of 1 days".
  if (allDates.length === 0 || symptomEntries.length === 0) {
    return {
      isEmpty: true,
      range: null,
      context: null,
      storyCoverage: null,
      profile,
      readiness: buildReadiness([]),
      symptoms: [],
      experience: [],
      observations: [],
      gaps: [],
      symptomPairs: [],
      headline: null,
      coverage: null,
    };
  }

  const start = allDates[0];
  const end = allDates[allDates.length - 1];
  const rangeDays = eachDayOfRange(start, end);

  const symptomNames = [...new Set(symptomEntries.map((entry) => entry.symptom))];
  const symptoms = symptomNames
    .map((name) =>
      buildSymptomStats(
        name,
        symptomEntries.filter((entry) => entry.symptom === name),
        rangeDays,
      ),
    )
    .sort((a, b) => b.daysReported - a.daysReported || b.entryCount - a.entryCount)
    .slice(0, MAX_TRACKED_SYMPTOMS);

  const context = summarizeContext(contextEntries);
  const story = storyCoverage(symptomEntries);

  // `daysLogged` counts days the person reported a symptom. Context coverage is
  // a separate number, because a day of sleep/stress data is not a day the
  // person reported anything, and conflating the two makes "days reported" mean
  // whatever the reporter happened to track that day.
  const daysLogged = new Set(symptomEntries.map((entry) => entry.date)).size;
  const daysWithContext = new Set(contextEntries.map((entry) => entry.date)).size;

  const range = {
    start,
    end,
    label: formatDateRange(start, end),
    totalDays: rangeDays.length,
    daysLogged,
    daysWithContext,
    entryCount: symptomEntries.length,
    weeksLogged: weeksSpanned(allDates),
  };

  const symptomPairs = symptomCoOccurrence(symptomEntries, symptomNames)
    .filter((pair) => pair.sharedDays >= MIN_SHARED_SYMPTOM_DAYS)
    .slice(0, 2);

  const observations = buildObservations({
    symptoms,
    symptomEntries,
    contextEntries,
    symptomPairs,
    totalDays: rangeDays.length,
  });

  const gaps = buildGaps({ symptomEntries, coverage: story, profile, range, statement });

  const lead = symptoms[0] ?? null;
  const severest = symptoms.reduce(
    (worst, symptom) =>
      worst == null || (symptom.maxSeverity ?? 0) > (worst.maxSeverity ?? 0) ? symptom : worst,
    null,
  );

  return {
    isEmpty: false,
    range,
    context,
    storyCoverage: story,
    profile,
    readiness: buildReadiness(symptomEntries),
    symptoms,
    experience: symptoms.map((symptom) => experienceLine({ ...symptom, totalDays: rangeDays.length })),
    observations,
    gaps,
    symptomPairs,
    headline: {
      leadSymptom: lead?.name ?? null,
      leadDays: lead?.daysReported ?? 0,
      leadAverageSeverity: lead?.avgSeverity ?? null,
      highestSeverity: severest?.maxSeverity ?? null,
      highestSeveritySymptom: severest?.name ?? null,
      daysWithSymptoms: daysLogged,
      daysWithContext,
    },
    coverage: coverageStatement(range),
  };
}

export * from "./calculations";
export * from "./language";
export { buildGaps } from "./gaps";
export { buildObservations, MAX_OBSERVATIONS } from "./observations";