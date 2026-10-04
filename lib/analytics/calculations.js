// Deterministic analytics over the user's own tracking data.
//
// Rules for this file:
//   - No I/O. No network. No model calls. No `Date.now()`.
//   - Every number the Evidence Brief shows comes from here.
//   - The same input must always produce the same output.
//
// Nothing in this file may describe a cause. It reports what appeared
// alongside what. Wording for those statements lives in ./language.js, and the
// two callers that turn numbers into sentences — ./observations.js and
// ./gaps.js — sit on top of what this file computes.

export const LOW_SLEEP_THRESHOLD = 6;
export const HIGH_STRESS_THRESHOLD = 4;
export const TREND_DELTA_THRESHOLD = 0.75;
export const RATE_DELTA_THRESHOLD = 0.15;

// A comparison between two groups of days is only worth reporting once each
// group has enough days behind it, otherwise a single bad afternoon reads as a
// pattern.
export const MIN_COMPARISON_DAYS = 3;

// Below this share of entries carrying a field, the brief treats the field as
// something the person has not really been documenting yet.
export const COVERAGE_THRESHOLD = 0.4;

import { daysBetween } from "@/lib/format";

function uniqueSortedDates(entries) {
  return [...new Set(entries.map((entry) => entry.date))].sort();
}

function mean(values) {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/** How many distinct calendar weeks the given ISO dates fall in. */
export function weeksSpanned(dates) {
  if (dates.length === 0) return 0;

  // Thursday of the ISO week is the fixed point that makes these buckets line
  // up with how a calendar week is actually counted.
  const weeks = new Set(
    dates.map((iso) => {
      const date = new Date(`${iso}T00:00:00Z`);
      const thursday = new Date(date);
      thursday.setUTCDate(date.getUTCDate() + (4 - (date.getUTCDay() || 7)));
      return thursday.toISOString().slice(0, 10);
    }),
  );

  return weeks.size;
}

// ---------------------------------------------------------------------------
// Symptom frequency
// ---------------------------------------------------------------------------

export function symptomFrequency(entriesForSymptom, totalDays) {
  const reportedDays = new Set(entriesForSymptom.map((entry) => entry.date)).size;
  return {
    reportedDays,
    totalDays,
    rate: totalDays > 0 ? reportedDays / totalDays : 0,
  };
}

// ---------------------------------------------------------------------------
// Average and maximum severity
// ---------------------------------------------------------------------------

export function averageSeverity(entries) {
  return mean(entries.map((entry) => entry.severity));
}

export function maximumSeverity(entries) {
  if (entries.length === 0) return null;
  return entries.reduce((highest, entry) => Math.max(highest, entry.severity), -Infinity);
}

// ---------------------------------------------------------------------------
// Longest run of consecutive days
// ---------------------------------------------------------------------------

/**
 * The longest stretch of consecutive calendar days a symptom was logged on.
 *
 * "It has been going on for three weeks straight" is a different claim from
 * "it appeared on eight days", and it is the one a clinician acts on, so it is
 * measured directly rather than inferred from the frequency count.
 */
export function longestRun(dates) {
  if (dates.length < 2) return { days: dates.length, startDate: dates[0] ?? null, endDate: dates[0] ?? null };

  let best = { days: 1, startDate: dates[0], endDate: dates[0] };
  let runStart = dates[0];
  let previous = dates[0];

  for (const date of dates.slice(1)) {
    const continued = daysBetween(previous, date) === 1;

    if (!continued) runStart = date;

    const length = daysBetween(runStart, date) + 1;
    if (length > best.days) best = { days: length, startDate: runStart, endDate: date };

    previous = date;
  }

  return best;
}

// ---------------------------------------------------------------------------
// First half vs second half
// ---------------------------------------------------------------------------

export function compareHalves(entriesForSymptom, rangeDays) {
  const midpoint = Math.ceil(rangeDays.length / 2);
  const firstDays = new Set(rangeDays.slice(0, midpoint));
  const secondDays = new Set(rangeDays.slice(midpoint));

  const firstEntries = entriesForSymptom.filter((entry) => firstDays.has(entry.date));
  const secondEntries = entriesForSymptom.filter((entry) => secondDays.has(entry.date));

  const firstAverage = mean(firstEntries.map((entry) => entry.severity));
  const secondAverage = mean(secondEntries.map((entry) => entry.severity));
  const delta =
    firstAverage == null || secondAverage == null ? null : secondAverage - firstAverage;

  return {
    firstHalf: {
      label: "First half",
      startDate: rangeDays[0],
      endDate: rangeDays[midpoint - 1],
      days: firstDays.size,
      entries: firstEntries.length,
      reportedDays: new Set(firstEntries.map((entry) => entry.date)).size,
      averageSeverity: firstAverage,
    },
    secondHalf: {
      label: "Second half",
      startDate: rangeDays[midpoint],
      endDate: rangeDays[rangeDays.length - 1],
      days: secondDays.size,
      entries: secondEntries.length,
      reportedDays: new Set(secondEntries.map((entry) => entry.date)).size,
      averageSeverity: secondAverage,
    },
    delta,
  };
}

// ---------------------------------------------------------------------------
// Trend direction
// ---------------------------------------------------------------------------

export function trendDirection(delta) {
  if (delta == null) return "not enough data";
  if (delta > TREND_DELTA_THRESHOLD) return "increasing";
  if (delta < -TREND_DELTA_THRESHOLD) return "decreasing";
  return "steady";
}

// ---------------------------------------------------------------------------
// Co-occurrence between symptoms
// ---------------------------------------------------------------------------

/** How many days two different symptoms were logged on the same day. */
export function symptomCoOccurrence(symptomEntries, symptomNames) {
  const datesBySymptom = new Map(
    symptomNames.map((name) => [name, new Set(symptomEntries.filter((entry) => entry.symptom === name).map((entry) => entry.date))]),
  );

  const pairs = [];

  for (let i = 0; i < symptomNames.length; i += 1) {
    for (let j = i + 1; j < symptomNames.length; j += 1) {
      const left = datesBySymptom.get(symptomNames[i]);
      const right = datesBySymptom.get(symptomNames[j]);
      if (!left || !right || left.size === 0 || right.size === 0) continue;

      const shared = [...left].filter((date) => right.has(date));
      if (shared.length === 0) continue;

      pairs.push({
        left: symptomNames[i],
        right: symptomNames[j],
        sharedDays: shared.length,
        leftDays: left.size,
        rightDays: right.size,
        dates: shared,
      });
    }
  }

  return pairs.sort((a, b) => b.sharedDays - a.sharedDays);
}

/**
 * Context summary statistics. Sleep and stress are only ever reported as
 * background to a co-occurrence, never as their own finding.
 */
export function summarizeContext(contextEntries) {
  const sleepValues = contextEntries.map((entry) => entry.sleep_hours).filter((value) => value != null);
  const stressValues = contextEntries.map((entry) => entry.stress_level).filter((value) => value != null);

  return {
    daysLogged: new Set(contextEntries.map((entry) => entry.date)).size,
    averageSleep: mean(sleepValues),
    medianSleep: median(sleepValues),
    minimumSleep: sleepValues.length ? Math.min(...sleepValues) : null,
    lowSleepDays: sleepValues.filter((value) => value < LOW_SLEEP_THRESHOLD).length,
    averageStress: mean(stressValues),
    highStressDays: stressValues.filter((value) => value >= HIGH_STRESS_THRESHOLD).length,
  };
}

// ---------------------------------------------------------------------------
// How much of the story the entries actually carry
// ---------------------------------------------------------------------------

function share(count, total) {
  return total > 0 ? count / total : 0;
}

/**
 * What share of the logged entries carry each of the details a clinician asks
 * about: how long it lasted, what it felt like, what it stopped them doing.
 *
 * This is the raw material for "Make sure I mention…". It measures the record,
 * not the person — a low number means the field is being skipped, not that
 * anything is wrong with it.
 */
export function storyCoverage(entries) {
  const total = entries.length;

  const durations = entries.filter((entry) => entry.duration_minutes != null);
  const notes = entries.filter((entry) => typeof entry.notes === "string" && entry.notes.trim());
  const impacts = entries.filter((entry) => typeof entry.impact === "string" && entry.impact.trim());

  return {
    total,
    durations: durations.length,
    durationRate: share(durations.length, total),
    notes: notes.length,
    noteRate: share(notes.length, total),
    impacts: impacts.length,
    impactRate: share(impacts.length, total),
  };
}

export { uniqueSortedDates, mean };