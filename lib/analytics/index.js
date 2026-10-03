// Assembles the full Evidence Brief report from raw tracking rows.
//
// This is the only place that decides what the brief shows. The UI reads this
// object; it never recomputes a statistic. The LLM receives this object as
// input but never contributes to it.

import { eachDayOfRange, formatDateRange, roundTo } from "@/lib/format";
import {
  averageSeverity,
  compareFactorGroups,
  compareHalves,
  contextCoOccurrence,
  maximumSeverity,
  RATE_DELTA_THRESHOLD,
  severityOverTime,
  severitySpread,
  summarizeContext,
  symptomCoOccurrence,
  symptomFrequency,
  trendDirection,
  TREND_DELTA_THRESHOLD,
  uniqueSortedDates,
  weeklySeveritySeries,
} from "./calculations";
import {
  changeStatement,
  coOccurrenceStatement,
  COMPARISON_CAVEAT,
  comparisonStatement,
  coverageStatement,
  frequencyComparisonStatement,
  observationStatement,
  patternStatement,
  severityComparisonStatement,
} from "./language";

const MIN_ENTRIES_FOR_STATEMENT = 3;
const MIN_FACTOR_DAYS = 4;
const MIN_SHARED_SYMPTOM_DAYS = 3;
const MAX_COMPARISONS = 4;

function buildSymptomStats(name, entriesForSymptom, rangeDays, totalDays) {
  const frequency = symptomFrequency(entriesForSymptom, totalDays);
  const halves = compareHalves(entriesForSymptom, rangeDays);
  const trend = trendDirection(halves.delta);
  const dailySeries = severityOverTime(entriesForSymptom, rangeDays);
  const weeklySeries = weeklySeveritySeries(entriesForSymptom, rangeDays);
  const dates = uniqueSortedDates(entriesForSymptom);
  const durations = entriesForSymptom
    .map((entry) => entry.duration_minutes)
    .filter((value) => value != null);
  const spread = severitySpread(entriesForSymptom);
  const hasEnoughData = entriesForSymptom.length >= MIN_ENTRIES_FOR_STATEMENT;

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
    severitySpread: roundTo(spread.stdev),
    firstSeen: dates[0] ?? null,
    lastSeen: dates[dates.length - 1] ?? null,
    halves,
    trend,
    dailySeries,
    weeklySeries,
    hasEnoughData,
    changeSentence: hasEnoughData ? changeStatement(name, halves, trend) : null,
    caveat: hasEnoughData
      ? null
      : `Only ${entriesForSymptom.length} ${entriesForSymptom.length === 1 ? "entry" : "entries"} recorded, which is too few to draw a reliable comparison from.`,
  };
}

function buildPatterns(symptomNames, symptomEntries, contextEntries) {
  const patterns = [];

  for (const name of symptomNames) {
    const entriesForSymptom = symptomEntries.filter((entry) => entry.symptom === name);
    if (entriesForSymptom.length < MIN_ENTRIES_FOR_STATEMENT) continue;

    for (const result of contextCoOccurrence(entriesForSymptom, contextEntries)) {
      if (result.factorDays < MIN_FACTOR_DAYS) continue;
      if (result.symptomDaysInFactor < 2) continue;

      patterns.push({
        id: `${name}-${result.factorId}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        symptom: name,
        factorId: result.factorId,
        label: result.label,
        shortLabel: result.shortLabel,
        factorDays: result.factorDays,
        symptomDaysInFactor: result.symptomDaysInFactor,
        factorRate: result.factorRate,
        overallRate: result.overallRate,
        differsFromBaseline: Math.abs(result.factorRate - result.overallRate) >= RATE_DELTA_THRESHOLD,
        statement: patternStatement({ ...result, symptom: name }),
        observation: observationStatement({ ...result, symptom: name }),
        comparison: comparisonStatement(result),
      });
    }
  }

  return patterns
    .sort((a, b) => {
      if (a.differsFromBaseline !== b.differsFromBaseline) return a.differsFromBaseline ? -1 : 1;
      if (b.factorRate !== a.factorRate) return b.factorRate - a.factorRate;
      return b.factorDays - a.factorDays;
    })
    .slice(0, 6);
}

/**
 * Group comparisons: the same co-occurrence as buildPatterns, but expressed as
 * a measured gap rather than a count, so the reader can see how large it is.
 *
 * A severity gap is scaled to the 0-10 scale and a rate gap is already a
 * fraction, so the two are directly comparable when ranking. The strongest
 * differences win, and only a handful are shown — a page of small differences
 * is noise, not analysis.
 */
function buildComparisons(symptomNames, symptomEntries, contextEntries) {
  const comparisons = [];

  for (const name of symptomNames) {
    const entriesForSymptom = symptomEntries.filter((entry) => entry.symptom === name);
    if (entriesForSymptom.length < MIN_ENTRIES_FOR_STATEMENT) continue;

    for (const group of compareFactorGroups(entriesForSymptom, contextEntries)) {
      if (!group.hasSeverityData && !group.hasFrequencyData) continue;

      const severityDiffers =
        group.hasSeverityData && Math.abs(group.severityDelta) >= TREND_DELTA_THRESHOLD;
      const frequencyDiffers =
        group.hasFrequencyData && Math.abs(group.rateDelta) >= RATE_DELTA_THRESHOLD;
      const severitySentence = group.hasSeverityData
        ? severityComparisonStatement(group)
        : null;
      const frequencySentence = group.hasFrequencyData
        ? frequencyComparisonStatement(group)
        : null;

      comparisons.push({
        id: `${name}-${group.factorId}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        symptom: name,
        ...group,
        severityDiffers,
        frequencyDiffers,
        differsFromBaseline: severityDiffers || frequencyDiffers,
        strength: Math.max(
          group.hasSeverityData ? Math.abs(group.severityDelta) / 10 : 0,
          group.hasFrequencyData ? Math.abs(group.rateDelta) : 0,
        ),
        headline: severityDiffers || !frequencyDiffers ? severitySentence : frequencySentence,
        severitySentence,
        frequencySentence,
        caveat: COMPARISON_CAVEAT,
      });
    }
  }

  return comparisons
    .sort((a, b) => {
      if (a.differsFromBaseline !== b.differsFromBaseline) return a.differsFromBaseline ? -1 : 1;
      if (b.strength !== a.strength) return b.strength - a.strength;
      return b.symptomDaysWithFactor - a.symptomDaysWithFactor;
    })
    .slice(0, MAX_COMPARISONS);
}

function buildTimeline(symptomEntries, rangeDays) {
  const byDate = new Map();

  for (const entry of symptomEntries) {
    const bucket = byDate.get(entry.date);
    if (bucket) bucket.push(entry);
    else byDate.set(entry.date, [entry]);
  }

  return rangeDays.map((date) => ({
    date,
    entries: (byDate.get(date) ?? []).sort((a, b) => b.severity - a.severity),
    context: null,
  }));
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
      note: `Built from ${entriesLabel}. Every number is accurate, and comparisons get more useful as you keep logging.`,
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
 */
export function buildReport({ symptomEntries = [], contextEntries = [], profile = null } = {}) {
  const allDates = uniqueSortedDates([...symptomEntries, ...contextEntries]);

  if (allDates.length === 0) {
    return {
      isEmpty: true,
      range: null,
      context: null,
      profile,
      readiness: buildReadiness([]),
      symptoms: [],
      patterns: [],
      comparisons: [],
      symptomPairs: [],
      timeline: [],
      headline: null,
      coverage: "No entries have been logged yet.",
    };
  }

  const start = allDates[0];
  const end = allDates[allDates.length - 1];
  const rangeDays = eachDayOfRange(start, end);
  const contextByDate = new Map(contextEntries.map((entry) => [entry.date, entry]));

  const symptomNames = [...new Set(symptomEntries.map((entry) => entry.symptom))];
  const symptoms = symptomNames
    .map((name) => buildSymptomStats(name, symptomEntries.filter((entry) => entry.symptom === name), rangeDays, rangeDays.length))
    .sort((a, b) => b.daysReported - a.daysReported || b.entryCount - a.entryCount);

  const timeline = buildTimeline(symptomEntries, rangeDays).map((day) => ({
    ...day,
    context: contextByDate.get(day.date) ?? null,
  }));

  // `daysLogged` counts days the person reported a symptom. Context coverage
  // is a separate number, because a day of sleep/stress data is not a day the
  // person reported anything, and conflating the two makes "days reported"
  // mean whatever the reporter happened to track that day.
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
  };

  const patterns = buildPatterns(symptomNames, symptomEntries, contextEntries);
  const comparisons = buildComparisons(symptomNames, symptomEntries, contextEntries);
  const symptomPairs = symptomCoOccurrence(symptomEntries, symptomNames)
    .filter((pair) => pair.sharedDays >= MIN_SHARED_SYMPTOM_DAYS)
    .slice(0, 4)
    .map((pair) => ({ ...pair, statement: coOccurrenceStatement(pair) }));

  const lead = symptoms[0] ?? null;
  const severest = symptoms.reduce(
    (worst, symptom) =>
      worst == null || (symptom.maxSeverity ?? 0) > (worst.maxSeverity ?? 0) ? symptom : worst,
    null,
  );

  return {
    isEmpty: false,
    range,
    context: summarizeContext(contextEntries),
    profile,
    readiness: buildReadiness(symptomEntries),
    symptoms,
    patterns,
    comparisons,
    symptomPairs,
    timeline,
    headline: {
      leadSymptom: lead?.name ?? null,
      leadDays: lead?.daysReported ?? 0,
      leadAverageSeverity: lead?.avgSeverity ?? null,
      highestSeverity: severest?.maxSeverity ?? null,
      highestSeveritySymptom: severest?.name ?? null,
      daysWithSymptoms: range.daysLogged,
      daysWithContext: range.daysWithContext,
    },
    coverage: coverageStatement(range),
  };
}

/** Small summary used by the dashboard cards. */
export function buildDashboardStats(report) {
  if (!report || report.isEmpty) return [];

  return report.symptoms.slice(0, 3).map((symptom) => ({
    id: symptom.name,
    label: symptom.name,
    value: symptom.daysReported,
    unit: "days",
    hint: `Average severity ${roundTo(symptom.avgSeverity)} / 10`,
  }));
}

export * from "./calculations";
export * from "./language";