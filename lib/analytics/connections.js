// Ranks the strongest relationships in the user's own records: which context
// factors show up alongside which symptoms, and which symptoms show up on the
// same days.
//
// Pure, deterministic, no I/O — same rules as ./calculations.js. Nothing here
// describes a cause. It reports rates, counts and co-occurrence, and the UI
// layers the caveat and the suggested question on top.

import { symptomCoOccurrence, LOW_SLEEP_THRESHOLD, HIGH_STRESS_THRESHOLD, RATE_DELTA_THRESHOLD } from "./calculations";

// A comparison between two groups of days is only worth reporting once each
// group has enough days behind it, otherwise a single bad afternoon reads as a
// pattern. These mirror the thresholds already used in ./observations.js.
const MIN_FACTOR_DAYS = 4;
const MIN_COMPARISON_DAYS = 3;
const MIN_SYMPTOM_DAYS_WITH_FACTOR = 2;
const MIN_SHARED_SYMPTOM_DAYS = 3;

/** How many connections the brief and the printed sheet will show. */
export const MAX_CONNECTIONS = 3;

const FACTORS = [
  {
    id: "low_sleep",
    label: "fewer than 6 hours of sleep",
    shortLabel: "short sleep",
    measurable: (context) => context.sleep_hours != null,
    test: (context) => context.sleep_hours != null && context.sleep_hours < LOW_SLEEP_THRESHOLD,
  },
  {
    id: "high_stress",
    label: "a stress level of 4 or 5",
    shortLabel: "high stress",
    measurable: (context) => context.stress_level != null,
    test: (context) => context.stress_level != null && context.stress_level >= HIGH_STRESS_THRESHOLD,
  },
  {
    id: "menstrual_window",
    label: "the first 5 days of your cycle",
    shortLabel: "your period",
    measurable: (context) => context.cycle_day != null,
    test: (context) => context.cycle_day != null && context.cycle_day <= 5,
  },
  {
    id: "luteal_window",
    label: "the second half of your cycle",
    shortLabel: "the luteal phase",
    measurable: (context) => context.cycle_phase != null,
    test: (context) => context.cycle_phase === "Luteal",
  },
];

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

/**
 * One symptom × one context factor comparison. Returns null when the data does
 * not support a connection, so callers never have to guard an under-formed
 * object.
 */
function buildContextConnection(symptomName, symptomDates, contextEntries, factor) {
  const factorDays = contextEntries.filter(factor.test);
  if (factorDays.length < MIN_FACTOR_DAYS) return null;

  const measurableDays = contextEntries.filter(factor.measurable);
  const comparisonDays = measurableDays.filter((day) => !factor.test(day));
  if (comparisonDays.length < MIN_COMPARISON_DAYS) return null;

  const symptomDaysWithFactor = factorDays.filter((day) => symptomDates.has(day.date)).length;
  if (symptomDaysWithFactor < MIN_SYMPTOM_DAYS_WITH_FACTOR) return null;

  const factorRate = symptomDaysWithFactor / factorDays.length;
  const symptomDaysWithoutFactor = comparisonDays.filter((day) => symptomDates.has(day.date)).length;
  const comparisonRate = symptomDaysWithoutFactor / comparisonDays.length;
  const difference = factorRate - comparisonRate;

  if (Math.abs(difference) < RATE_DELTA_THRESHOLD) return null;

  const symptomLower = symptomName.toLowerCase();
  const evidence = `${symptomDaysWithFactor} of ${factorDays.length} ${factor.shortLabel} days included a ${symptomLower}, compared with ${symptomDaysWithoutFactor} of ${comparisonDays.length} other tracked days.`;

  return {
    type: "context",
    symptom: symptomName,
    factor: factor.shortLabel,
    factorId: factor.id,
    factorDays: factorDays.length,
    symptomDaysWithFactor,
    factorRate,
    comparisonDays: comparisonDays.length,
    symptomDaysWithoutFactor,
    comparisonRate,
    difference,
    evidence,
    title: `${symptomName} showed up more often on ${factor.shortLabel} days`,
    caveat: `This is an observation from your records, not proof that ${factor.shortLabel} caused your ${symptomLower}.`,
    question: `Could ${factor.shortLabel} be relevant to your ${symptomLower}?`,
  };
}

/** Two symptoms that keep landing on the same days. */
function buildOverlapConnection(pair) {
  const { left, right, sharedDays } = pair;
  const evidence = `${left} and ${right} were recorded together on ${sharedDays} ${plural(sharedDays, "day", "days")}.`;

  return {
    type: "symptom_overlap",
    symptoms: [left, right],
    sharedDays,
    evidence,
    title: `${left} and ${right} were recorded together on ${sharedDays} ${plural(sharedDays, "day", "days")}`,
    caveat: `This shows that ${left.toLowerCase()} and ${right.toLowerCase()} occurred together in your records, not that one caused the other.`,
    question: `Could these symptoms be related?`,
  };
}

/**
 * @param {object} input
 * @param {Array} input.symptomEntries Raw symptom tracking rows.
 * @param {Array} input.contextEntries Raw context rows (sleep, stress, cycle).
 * @returns {Array} Up to MAX_CONNECTIONS connections, strongest first. Each is
 *   either a `context` connection or a `symptom_overlap` connection. Empty when
 *   no relationship clears the thresholds.
 */
export function findSymptomConnections({ symptomEntries = [], contextEntries = [] } = {}) {
  if (symptomEntries.length === 0) return [];

  const symptomNames = [...new Set(symptomEntries.map((entry) => entry.symptom))];
  const contextConnections = [];
  const overlapConnections = [];

  // Context connections: every symptom × every factor that has enough data.
  for (const name of symptomNames) {
    const symptomDates = new Set(
      symptomEntries.filter((entry) => entry.symptom === name).map((entry) => entry.date),
    );
    for (const factor of FACTORS) {
      const connection = buildContextConnection(name, symptomDates, contextEntries, factor);
      if (connection) contextConnections.push(connection);
    }
  }

  // Strongest rate difference first.
  contextConnections.sort((a, b) => b.difference - a.difference);

  // Symptom overlap connections, using the existing co-occurrence logic.
  const pairs = symptomCoOccurrence(symptomEntries, symptomNames).filter(
    (pair) => pair.sharedDays >= MIN_SHARED_SYMPTOM_DAYS,
  );
  for (const pair of pairs) {
    overlapConnections.push(buildOverlapConnection(pair));
  }
  overlapConnections.sort((a, b) => b.sharedDays - a.sharedDays);

  // Merge the two ranked lists into one. Context connections carry a rate
  // difference (0–1), overlaps carry a day count; normalise the overlap score
  // so the two are comparable and the strongest relationship always wins.
  const combined = [];
  let ci = 0;
  let oi = 0;
  while (
    combined.length < MAX_CONNECTIONS &&
    (ci < contextConnections.length || oi < overlapConnections.length)
  ) {
    const contextScore = ci < contextConnections.length ? contextConnections[ci].difference : -1;
    const overlapScore = oi < overlapConnections.length ? overlapConnections[oi].sharedDays / 20 : -1;
    if (contextScore >= overlapScore) {
      combined.push(contextConnections[ci]);
      ci += 1;
    } else {
      combined.push(overlapConnections[oi]);
      oi += 1;
    }
  }

  return combined;
}