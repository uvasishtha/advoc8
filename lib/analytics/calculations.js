// Deterministic analytics over the user's own tracking data.
//
// Rules for this file:
//   - No I/O. No network. No model calls. No `Date.now()`.
//   - Every number the Evidence Brief shows comes from here.
//   - The same input must always produce the same output.
//
// Nothing in this file may describe a cause. It reports what appeared
// alongside what. Wording for those statements lives in ./language.js.

export const LOW_SLEEP_THRESHOLD = 6;
export const HIGH_STRESS_THRESHOLD = 4;
export const TREND_DELTA_THRESHOLD = 0.75;

const CONTEXT_FACTORS = [
  {
    id: "low_sleep",
    label: "fewer than 6 hours of sleep",
    shortLabel: "short sleep",
    test: (context) => context.sleep_hours != null && context.sleep_hours < LOW_SLEEP_THRESHOLD,
  },
  {
    id: "high_stress",
    label: "a stress level of 4 or 5",
    shortLabel: "high stress",
    test: (context) => context.stress_level >= HIGH_STRESS_THRESHOLD,
  },
  {
    id: "menstrual_window",
    label: "the first 5 days of your cycle",
    shortLabel: "your period",
    test: (context) => context.cycle_day != null && context.cycle_day <= 5,
  },
  {
    id: "luteal_window",
    label: "the second half of your cycle",
    shortLabel: "the luteal phase",
    test: (context) => context.cycle_phase === "Luteal",
  },
];

export function listContextFactors() {
  return CONTEXT_FACTORS.map(({ id, label, shortLabel }) => ({ id, label, shortLabel }));
}

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

function stdev(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Linear regression slope of severity against day index. */
function slope(values) {
  if (values.length < 2) return 0;
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = mean(values);
  let numerator = 0;
  let denominator = 0;

  for (let index = 0; index < n; index += 1) {
    numerator += (index - meanX) * (values[index] - meanY);
    denominator += (index - meanX) ** 2;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

// ---------------------------------------------------------------------------
// 1. Symptom frequency
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
// 2 & 3. Average and maximum severity
// ---------------------------------------------------------------------------

export function averageSeverity(entries) {
  return mean(entries.map((entry) => entry.severity));
}

export function maximumSeverity(entries) {
  if (entries.length === 0) return null;
  return entries.reduce((highest, entry) => Math.max(highest, entry.severity), -Infinity);
}

// ---------------------------------------------------------------------------
// 4. Severity over time
// ---------------------------------------------------------------------------

/**
 * Severity per calendar day. Days with no entry for the symptom are present
 * with a null value so charts can show a genuine gap instead of interpolating
 * across days the user never recorded.
 */
export function severityOverTime(entriesForSymptom, rangeDays) {
  const byDate = new Map();

  for (const entry of entriesForSymptom) {
    const bucket = byDate.get(entry.date);
    if (bucket) {
      bucket.severity = Math.max(bucket.severity, entry.severity);
      bucket.entries.push(entry);
    } else {
      byDate.set(entry.date, { date: entry.date, severity: entry.severity, entries: [entry] });
    }
  }

  return rangeDays.map((date) => byDate.get(date) ?? { date, severity: null, entries: [] });
}

/** Seven-day averages, used by the brief's change-over-time chart. */
export function weeklySeveritySeries(entriesForSymptom, rangeDays, bucketSize = 7) {
  const perDay = severityOverTime(entriesForSymptom, rangeDays);
  const buckets = [];

  for (let start = 0; start < perDay.length; start += bucketSize) {
    const slice = perDay.slice(start, start + bucketSize);
    const recorded = slice.filter((day) => day.severity != null);
    const values = recorded.map((day) => day.severity);

    buckets.push({
      startDate: slice[0].date,
      endDate: slice[slice.length - 1].date,
      average: mean(values),
      daysReported: recorded.length,
      daysInBucket: slice.length,
    });
  }

  return buckets;
}

// ---------------------------------------------------------------------------
// 5. First half vs second half
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
// 7. Trend direction
// ---------------------------------------------------------------------------

export function trendDirection(delta) {
  if (delta == null) return "not enough data";
  if (delta > TREND_DELTA_THRESHOLD) return "increasing";
  if (delta < -TREND_DELTA_THRESHOLD) return "decreasing";
  return "steady";
}

// ---------------------------------------------------------------------------
// 6. Co-occurrence
// ---------------------------------------------------------------------------

/**
 * Counts how often a symptom was logged on days that matched a context factor,
 * and how often it was logged overall. Returns both numbers for every pair so
 * the UI can show the comparison rather than asserting a relationship.
 */
export function contextCoOccurrence(symptomEntries, contextEntries) {
  const contextByDate = new Map(contextEntries.map((entry) => [entry.date, entry]));
  const symptomDates = new Set(symptomEntries.map((entry) => entry.date));
  const allLoggedDays = new Set([...symptomDates, ...contextByDate.keys()]);

  const results = [];

  for (const factor of CONTEXT_FACTORS) {
    const matchingDays = [...contextByDate.values()].filter((context) => factor.test(context));

    if (matchingDays.length === 0) continue;

    const withSymptom = matchingDays.filter((context) => symptomDates.has(context.date));

    results.push({
      factorId: factor.id,
      label: factor.label,
      shortLabel: factor.shortLabel,
      factorDays: matchingDays.length,
      symptomDaysInFactor: withSymptom.length,
      factorRate: withSymptom.length / matchingDays.length,
      overallRate: allLoggedDays.size > 0 ? symptomDates.size / allLoggedDays.size : 0,
      dates: matchingDays.map((context) => context.date),
    });
  }

  return results;
}

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
 * Context summary statistics. Kept separate from co-occurrence because the
 * dashboard shows these as plain numbers.
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

/**
 * Dispersion for a symptom. A symptom whose severity swings wildly is worth
 * flagging as "inconsistent" rather than "changing".
 */
export function severitySpread(entriesForSymptom) {
  const values = entriesForSymptom.map((entry) => entry.severity);
  return { stdev: stdev(values), mean: mean(values) };
}

export { uniqueSortedDates, mean, slope };