// "What I've Noticed" — the short list of observations worth raising.
//
// The analytics layer produces a lot of correct numbers. A person in a
// ten-minute appointment can use about four of them. This file is the editor:
// it picks the four that carry the most weight, ranks them, and drops
// everything else.
//
// Rules, same spirit as ./calculations.js:
//   - Pure. No I/O, no `Date.now()`, no model calls.
//   - Deterministic: the same entries always yield the same four lines.
//   - An observation the data does not support is never written. Every
//     candidate has a threshold it has to clear before it becomes a sentence.
//
// Each observation carries up to three parts, because all three are needed for
// it to be usable: what the record shows (`statement`), what that does not mean
// (`caveat`, where there is something to disclaim), and what the reader could
// do with it (`ask`).

import {
  MIN_COMPARISON_DAYS,
  RATE_DELTA_THRESHOLD,
  longestRun,
  severitySpread,
  trendDirection,
} from "./calculations";
import {
  changeStatement,
  coOccurrenceStatement,
  contextStatement,
  durationStatement,
  persistenceStatement,
  recurrenceStatement,
  variabilityStatement,
} from "./language";

/** How many observations the brief is willing to show. */
export const MAX_OBSERVATIONS = 4;

const MIN_FACTOR_DAYS = 4;
const MIN_SHARED_DAYS = 3;
const MIN_RUN_DAYS = 3;

// Weight per observation kind. Higher wins a slot.
const RANK = {
  persistence: 100,
  change: 90,
  context: 70,
  recurrence: 60,
  duration: 50,
  variability: 40,
  overlap: 30,
};

/**
 * Context a brief can compare against, with the same thresholds
 * ./calculations.js uses. Kept here rather than imported because the choice is
 * made per observation — a person's records may line up with stress rather than
 * sleep — and because the winner is the factor the reader will recognise from
 * their own entries.
 */
const FACTORS = [
  {
    id: "low_sleep",
    label: "fewer than 6 hours of sleep",
    shortLabel: "short sleep",
    measurable: (context) => context.sleep_hours != null,
    test: (context) => context.sleep_hours != null && context.sleep_hours < 6,
  },
  {
    id: "high_stress",
    label: "a stress level of 4 or 5",
    shortLabel: "high stress",
    measurable: (context) => context.stress_level != null,
    test: (context) => context.stress_level >= 4,
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

function observe(kind, title, sentence) {
  return {
    kind,
    title,
    rank: RANK[kind],
    statement: typeof sentence === "string" ? sentence : sentence.statement,
    caveat: typeof sentence === "string" ? null : (sentence.caveat ?? null),
    ask: typeof sentence === "string" ? null : (sentence.ask ?? null),
  };
}

/**
 * The factor a set of symptom entries lines up with most strongly, or null.
 *
 * Ranked by how much more often the symptom appears on factor days than on the
 * days the factor was measurable and absent, so the observation describes a gap
 * the reader can see rather than the first factor that happened to be logged.
 */
function pickFactor(entries, contextEntries) {
  const contextByDate = new Map(contextEntries.map((entry) => [entry.date, entry]));
  const symptomDates = new Set(entries.map((entry) => entry.date));
  const context = [...contextByDate.values()];
  let best = null;

  for (const factor of FACTORS) {
    const matching = context.filter(factor.test);
    if (matching.length < MIN_FACTOR_DAYS) continue;

    const hits = matching.filter((day) => symptomDates.has(day.date)).length;
    if (hits < 2) continue;

    const factorRate = hits / matching.length;
    const others = context.filter((day) => factor.measurable(day) && !factor.test(day));
    if (others.length < MIN_COMPARISON_DAYS) continue;

    const outsideRate = others.filter((day) => symptomDates.has(day.date)).length / others.length;
    if (Math.abs(factorRate - outsideRate) < RATE_DELTA_THRESHOLD) continue;

    if (!best || factorRate - outsideRate > best.gap) {
      best = { factor, factorDays: matching.length, symptomDays: hits, outsideRate, gap: factorRate - outsideRate };
    }
  }

  return best;
}

/**
 * The longest unbroken run of days a symptom was logged on.
 *
 * A run is a much stronger thing to raise in an appointment than a scattered
 * count, so when the record contains one it outranks everything else.
 */
function buildPersistence(symptoms, byName) {
  let best = null;

  for (const symptom of symptoms) {
    if (!symptom.hasEnoughData) continue;

    const dates = [...new Set(byName(symptom.name).map((entry) => entry.date))].sort();
    const run = longestRun(dates);
    if (run.days < MIN_RUN_DAYS) continue;

    const statement = persistenceStatement({ name: symptom.name, run });
    if (!statement) continue;

    if (!best || run.days > best.days) {
      best = { days: run.days, observation: observe("persistence", "It has not stopped", statement) };
    }
  }

  return best?.observation ?? null;
}

/** Symptoms whose severity moved in one direction across the period. */
function buildChange(symptoms) {
  const candidates = [];

  for (const symptom of symptoms) {
    if (!symptom.hasEnoughData) continue;

    const trend = trendDirection(symptom.halves.delta);
    if (trend === "steady" || trend === "not enough data") continue;

    candidates.push(
      observe("change", trend === "increasing" ? "It has been getting worse" : "It has been easing", {
        statement: changeStatement({ name: symptom.name, halves: symptom.halves, trend }),
      }),
    );
  }

  return candidates.sort((a, b) => b.rank - a.rank).slice(0, 1);
}

/** Context co-occurrence, with the disclaimer and the suggested question. */
function buildContext(symptoms, byName, contextEntries) {
  const candidates = [];

  for (const symptom of symptoms) {
    if (!symptom.hasEnoughData) continue;

    const match = pickFactor(byName(symptom.name), contextEntries);
    if (!match) continue;

    const sentence = contextStatement({
      name: symptom.name,
      label: match.factor.label,
      shortLabel: match.factor.shortLabel,
      factorDays: match.factorDays,
      symptomDaysInFactor: match.symptomDays,
      outsideRate: match.outsideRate,
    });

    candidates.push(
      observe("context", `Something to mention about ${match.factor.shortLabel}`, sentence),
    );
  }

  return candidates.sort((a, b) => b.rank - a.rank).slice(0, 2);
}

function buildRecurrence(symptoms, totalDays) {
  const lead = symptoms[0];
  if (!lead) return [];

  return [
    observe("recurrence", "It keeps coming back", {
      statement: recurrenceStatement({
        name: lead.name,
        daysReported: lead.daysReported,
        totalDays,
        firstSeen: lead.firstSeen,
        lastSeen: lead.lastSeen,
      }),
    }),
  ];
}

function buildDuration(symptoms, byName) {
  const lead = symptoms[0];
  if (!lead || lead.avgDurationMinutes == null) return [];

  const entries = byName(lead.name);
  const durations = entries.map((entry) => entry.duration_minutes).filter((value) => value != null);

  const statement = durationStatement({
    name: lead.name,
    avgDurationMinutes: lead.avgDurationMinutes,
    maxDurationMinutes: durations.length ? Math.max(...durations) : null,
    loggedCount: durations.length,
    totalCount: entries.length,
  });

  return statement ? [observe("duration", "How long it lasts", { statement })] : [];
}

function buildVariability(symptoms, byName) {
  const candidates = [];

  for (const symptom of symptoms.slice(0, 2)) {
    if (!symptom.hasEnoughData) continue;

    const statement = variabilityStatement({
      name: symptom.name,
      minSeverity: symptom.minSeverity,
      maxSeverity: symptom.maxSeverity,
      spread: severitySpread(byName(symptom.name)).stdev,
    });

    if (statement) candidates.push(observe("variability", "Some days are much worse", { statement }));
  }

  return candidates.slice(0, 1);
}

function buildOverlap(symptomPairs) {
  return symptomPairs
    .filter((pair) => pair.sharedDays >= MIN_SHARED_DAYS)
    .slice(0, 1)
    .map((pair) => observe("overlap", "These tend to arrive together", { statement: coOccurrenceStatement(pair) }));
}

/**
 * @param {object} input
 * @param {Array} input.symptoms        Per-symptom stats from ./index.js
 * @param {Array} input.symptomEntries  Raw tracking rows
 * @param {Array} input.contextEntries  Raw context rows
 * @param {Array} input.symptomPairs    Overlapping symptom pairs from ./index.js
 * @param {number} input.totalDays      Days in the reported period
 * @returns {Array} Observations, strongest first, never longer than
 *   MAX_OBSERVATIONS.
 */
export function buildObservations({
  symptoms = [],
  symptomEntries = [],
  contextEntries = [],
  symptomPairs = [],
  totalDays = 0,
} = {}) {
  const byName = (name) => symptomEntries.filter((entry) => entry.symptom === name);

  const candidates = [
    buildPersistence(symptoms, byName),
    ...buildChange(symptoms),
    ...buildContext(symptoms, byName, contextEntries),
    ...buildRecurrence(symptoms, totalDays),
    ...buildDuration(symptoms, byName),
    ...buildVariability(symptoms, byName),
    ...buildOverlap(symptomPairs),
  ].filter(Boolean);

  return candidates
    .sort((a, b) => b.rank - a.rank)
    .slice(0, MAX_OBSERVATIONS)
    .map(({ rank, ...observation }) => observation);
}