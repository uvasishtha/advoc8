// Every sentence the Evidence Brief shows about a relationship lives here.
//
// The distinction this file enforces:
//
//   observed  -> "Headache showed up on 8 of the 11 days you slept under 6 hours."
//   forbidden -> "Lack of sleep caused your headaches."
//
// Nothing below may state or imply that one factor produces another. Compare
// rates, report counts, describe co-occurrence. Then, where it genuinely
// helps, say out loud that the record does not establish a cause and name the
// thing the reader could ask a clinician instead. That last part is what turns
// an observation into something a person can actually use in the room.

import { formatDate, formatDuration, roundTo } from "@/lib/format";

/**
 * Causal verbs that must never appear in generated copy. Checked against
 * generated output in lib/doctor-summary.js before this file was trimmed to the
 * brief's copy, and re-asserted in lib/analytics/analytics.test.js.
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

export function percent(value) {
  return `${Math.round(value * 100)}%`;
}

/** "3 days" / "1 day", optionally prefixed so two groups read differently. */
export function dayCount(days, prefix = "") {
  return `${prefix}${days} ${plural(days, "day", "days")}`;
}

/** "2 weeks" / "1 week". Weeks are rounded up: any part of one is some of one. */
export function weekCount(weeks) {
  return `${weeks} ${plural(weeks, "week", "weeks")}`;
}

/** Lower-cased unless it is the first word in the sentence. */
export function subject(name, { sentenceStart = false } = {}) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  return sentenceStart ? name.charAt(0).toUpperCase() + name.slice(1) : lower;
}

// ---------------------------------------------------------------------------
// What I've Noticed
// ---------------------------------------------------------------------------

/**
 * Recurrence. The single most useful thing a person can say in a short
 * appointment, so it leads.
 *
 * @example
 * "Fatigue keeps coming back. You recorded it on 18 of the last 30 days."
 */
export function recurrenceStatement({ name, daysReported, totalDays, firstSeen, lastSeen }) {
  const window = `on ${daysReported} of the last ${totalDays} ${plural(totalDays, "day", "days")}`;

  if (!firstSeen || !lastSeen) {
    return `${name} has been recorded ${window}.`;
  }

  return `${name} keeps coming back. You recorded it ${window}, from ${formatDate(firstSeen, {
    withYear: false,
  })} to ${formatDate(lastSeen, { withYear: false })}.`;
}

/**
 * Consecutiveness. A run of days is a much stronger thing to raise than a
 * scattered count, so it gets its own line when the record supports one.
 */
export function persistenceStatement({ run }) {
  if (run.days < 3) return null;

  const when =
    run.startDate === run.endDate
      ? formatDate(run.startDate, { withYear: false })
      : `${formatDate(run.startDate, { withYear: false })}–${formatDate(run.endDate, { withYear: false })}`;

  const length =
    run.days >= 7
      ? `${weekCount(Math.round(run.days / 7))}, ${dayCount(run.days)}`
      : dayCount(run.days);

  return `Your longest run without a break was ${length}, ${when}.`;
}

/** How long an episode typically lasts. */
export function durationStatement({ name, avgDurationMinutes, maxDurationMinutes, loggedCount, totalCount }) {
  if (avgDurationMinutes == null || loggedCount === 0) return null;

  const longest =
    maxDurationMinutes != null ? ` The longest was ${formatDuration(maxDurationMinutes)}.` : "";

  const missing =
    loggedCount < totalCount
      ? ` You recorded a duration on ${loggedCount} of ${totalCount} ${plural(totalCount, "entry", "entries")}.`
      : "";

  return `${name} typically lasts about ${formatDuration(avgDurationMinutes)}.${longest}${missing}`;
}

/** Severity moving in one direction across the period. */
export function changeStatement({ name, halves, trend }) {
  const { firstHalf, secondHalf, delta } = halves;

  if (firstHalf.averageSeverity == null || secondHalf.averageSeverity == null) {
    return `${name} was only recorded in one half of this period, so there is nothing to compare yet.`;
  }

  const first = roundTo(firstHalf.averageSeverity);
  const second = roundTo(secondHalf.averageSeverity);
  const difference = roundTo(Math.abs(delta));
  const period = `${formatDate(firstHalf.startDate, { withYear: false })}–${formatDate(
    firstHalf.endDate,
    { withYear: false },
  )}`;
  const nextPeriod = `${formatDate(secondHalf.startDate, { withYear: false })}–${formatDate(
    secondHalf.endDate,
    { withYear: false },
  )}`;

  if (trend === "steady") {
    return `Severity held steady: ${first} / 10 on average in ${period}, and ${second} / 10 in ${nextPeriod}.`;
  }

  const direction = delta > 0 ? "worse" : "better";

  return `${name} has been getting ${direction}. Average severity went from ${first} / 10 in ${period} to ${second} / 10 in ${nextPeriod} — ${difference} ${plural(difference, "point", "points")} ${delta > 0 ? "higher" : "lower"}.`;
}

/** Some days are much harder than others, which is worth saying out loud. */
export function variabilityStatement({ name, minSeverity, maxSeverity }) {
  if (minSeverity == null || maxSeverity == null) return null;
  if (maxSeverity - minSeverity < 3) return null;

  // "You have rated it from 5 to 8" reads fine, but "you have" is on the banned
  // list below because it is how every one of those phrasings opens. The rule is
  // cheaper to obey than to explain an exception to.
  return `${name} varies a lot day to day — your ratings run from ${minSeverity} to ${maxSeverity} / 10. On the hardest days it is a different problem from the mild ones.`;
}

/** Two symptoms that keep landing on the same days. */
export function coOccurrenceStatement(pair) {
  const { left, right, sharedDays, leftDays, rightDays } = pair;
  const days = plural(sharedDays, "day", "days");

  return `${left} and ${right} showed up together on ${sharedDays} ${days}. ${left} appeared on ${leftDays} ${plural(leftDays, "day", "days")} overall, ${right} on ${rightDays}.`;
}

/**
 * Context co-occurrence, plus the sentence that keeps it honest.
 *
 * The two halves are the whole point: the count is what is worth raising, and
 * the caveat plus the suggestion is what makes it safe to raise.
 */
export function contextStatement({ name, label, shortLabel, factorDays, symptomDaysInFactor, outsideRate }) {
  const days = plural(factorDays, "day", "days");
  const contrast = outsideRate == null ? "" : ` You recorded it on ${percent(outsideRate)} of the other days you tracked.`;

  return {
    statement: `${name} showed up on ${symptomDaysInFactor} of the ${factorDays} ${days} you recorded ${label}.${contrast}`,
    caveat: `Your record does not show that ${shortLabel} and ${subject(name)} are connected. It is a coincidence worth mentioning, not an explanation.`,
    ask: `Worth asking whether ${shortLabel} could be relevant to ${subject(name)}.`,
  };
}

/** How far apart two groups of days are, in the plainest terms available. */
export function comparisonStatement({ name, label, complementLabel, severityWithFactor, severityOutsideFactor, severityDelta }) {
  const gap = roundTo(Math.abs(severityDelta));
  const direction = severityDelta > 0 ? "higher" : "lower";

  return `Average ${subject(name)} severity was ${roundTo(severityWithFactor.average)} / 10 on the ${dayCount(
    severityWithFactor.days,
  )} you recorded ${label}, and ${roundTo(severityOutsideFactor.average)} / 10 on the ${dayCount(
    severityOutsideFactor.days,
    "other ",
  )} you recorded ${complementLabel} — ${gap} ${plural(gap, "point", "points")} ${direction} on ${label} days.`;
}

export function frequencyComparisonStatement({ name, label, complementLabel, daysWithFactor, daysOutsideFactor, symptomDaysWithFactor, symptomDaysOutsideFactor, factorRate, outsideRate }) {
  return `${name} was recorded on ${percent(factorRate)} of the ${dayCount(daysWithFactor)} you recorded ${label} (${symptomDaysWithFactor} of them), compared with ${percent(outsideRate)} of the ${dayCount(
    daysOutsideFactor,
    "other ",
  )} you recorded ${complementLabel} (${symptomDaysOutsideFactor} of them).`;
}

// ---------------------------------------------------------------------------
// What I've Been Experiencing
// ---------------------------------------------------------------------------

/** Summary of how much tracking the brief is built on. */
export function coverageStatement(range) {
  const { daysLogged, totalDays, daysWithContext, entryCount } = range;

  return `Built from ${entryCount} ${plural(entryCount, "entry", "entries")} logged on ${daysLogged} of the ${totalDays} days in this period. Sleep and stress recorded alongside on ${daysWithContext} ${plural(daysWithContext, "day", "days")}.`;
}

/** One line per symptom, so section 01 reads as a list rather than a table. */
export function experienceLine({ name, daysReported, totalDays, avgSeverity, avgDurationMinutes }) {
  const rate = `recorded on ${daysReported} of ${totalDays} ${plural(totalDays, "day", "days")}`;
  const severity = avgSeverity == null ? "" : ` · averaging ${roundTo(avgSeverity)} / 10`;
  const duration =
    avgDurationMinutes == null ? "" : ` · about ${formatDuration(avgDurationMinutes)} each time`;

  return `${name}: ${rate}${severity}${duration}.`;
}