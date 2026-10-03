// Every sentence the Evidence Brief shows about a relationship lives here.
//
// The distinction this file enforces:
//   observed  -> "Headache was logged on 8 of the 10 days you recorded less than
//                6 hours of sleep."
//   forbidden -> "Lack of sleep caused your headaches."
//
// Nothing below may state or imply that one factor produces another. Compare
// rates, report counts, describe co-occurrence. Stop there.

import { formatDate, roundTo } from "@/lib/format";

/**
 * Causal verbs that must never appear in generated copy. Checked against
 * generated output in lib/safety.js.
 */
export const CAUSAL_VERBS = [
  "caused",
  "causing",
  "causes",
  "causative",
  "due to",
  "because of",
  "result of",
  "resulted in",
  "results in",
  "led to",
  "leads to",
  "responsible for",
  "triggered by",
  "triggers",
  "brought on by",
  "makes you",
  "causing your",
  "why you get",
  "reason for your",
  "explains your",
  "underlying cause",
  "root cause",
];

export const DIAGNOSTIC_VERBS = [
  "you have",
  "you are suffering",
  "you likely have",
  "diagnosis",
  "diagnosed with",
  "indicates that you",
  "suggests that you",
  "suggests you",
  "this means you have",
  "you may have",
  "most likely",
  "probably because",
  "consistent with a",
  "points to",
];

export function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

/**
 * Co-occurrence statement, observationally worded.
 *
 * @example
 * "Headache was logged on 8 of the 10 days you recorded fewer than 6 hours of sleep."
 */
export function patternStatement(pattern) {
  const { symptom, factorDays, symptomDaysInFactor, label } = pattern;
  const dayWord = plural(factorDays, "day", "days");

  return `${symptom} was logged on ${symptomDaysInFactor} of the ${factorDays} ${dayWord} you recorded ${label}.`;
}

/**
 * The follow-up line. States that the two things showed up together in the
 * record and stops there.
 */
export function observationStatement(pattern) {
  const { symptom, shortLabel } = pattern;
  return `Observed pattern: ${symptom} and ${shortLabel} frequently appeared together in your tracking history. This is a description of your own records, not a medical finding.`;
}

/** Puts the factor rate next to the overall rate so the reader can judge it. */
export function comparisonStatement(pattern) {
  const { factorRate, overallRate } = pattern;
  return `It was logged on ${percent(factorRate)} of those days, compared with ${percent(overallRate)} of all the days you tracked.`;
}

/** Sentence for the changes-over-time section. */
export function changeStatement(name, halves, trend) {
  const { firstHalf, secondHalf, delta } = halves;

  if (firstHalf.averageSeverity == null || secondHalf.averageSeverity == null) {
    return `${name} was only recorded in one half of this period, so there is nothing to compare yet.`;
  }

  const first = roundTo(firstHalf.averageSeverity);
  const second = roundTo(secondHalf.averageSeverity);
  const difference = roundTo(Math.abs(delta));

  const direction = delta > 0 ? "higher" : "lower";
  const period =
    `${formatDate(firstHalf.startDate, { withYear: false })} – ${formatDate(firstHalf.endDate, { withYear: false })}`;
  const nextPeriod =
    `${formatDate(secondHalf.startDate, { withYear: false })} – ${formatDate(secondHalf.endDate, { withYear: false })}`;

  if (trend === "steady") {
    return `Average severity was ${first} / 10 in ${period} and ${second} / 10 in ${nextPeriod}. The difference of ${difference} ${plural(difference, "point", "points")} is small enough that your records do not show a clear change.`;
  }

  return `Average severity was ${first} / 10 in ${period} and ${second} / 10 in ${nextPeriod} — ${difference} ${plural(difference, "point", "points")} ${direction} in the second half of your records.`;
}

/** Sentence for two symptoms that keep showing up on the same day. */
export function coOccurrenceStatement(pair) {
  const { left, right, sharedDays, leftDays, rightDays } = pair;
  const dayWord = plural(sharedDays, "day", "days");

  return `${left} and ${right} were both logged on ${sharedDays} ${dayWord}. ${left} was logged on ${leftDays} days overall and ${right} on ${rightDays}.`;
}

/** Summary of how much tracking the brief is built on. */
export function coverageStatement(range) {
  const { daysLogged, totalDays, daysWithSymptoms, entryCount } = range;
  return `Built from ${entryCount} entries logged across ${daysLogged} of the ${totalDays} days in this period. ${daysWithSymptoms} ${plural(daysWithSymptoms, "day", "days")} had at least one symptom recorded.`;
}

export { percent };