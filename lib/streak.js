// The Advoc8 streak: consecutive calendar days on which at least one symptom
// was logged.
//
// Rules, in the same spirit as lib/analytics:
//   - Pure. No Date.now(), no storage. `today` is passed in.
//   - Derived entirely from the entries the user already has. Nothing here is
//     stored separately, so a streak can never disagree with the record.
//   - Several logs on one day are one day, never two.
//   - A streak measures consistency of documentation and nothing else. The copy
//     in this file is about building a clearer record, never about getting
//     healthier.

import { addDays } from "@/lib/format";

/**
 * The milestone lines. Keyed by day count. Anything not listed falls back to a
 * plain description of what was done.
 */
const MILESTONES = {
  2: "You're building a record of your symptoms.",
  7: "One week of consistent tracking.",
  14: "Two weeks of consistent tracking.",
  21: "Three weeks of consistent tracking.",
  30: "A month of consistent tracking.",
  100: "A hundred days of your own record.",
};

/**
 * A streak counts days you recorded something. It says nothing about your
 * health.
 */
export const STREAK_NOTE =
  "A streak counts the days you recorded something. It is a measure of consistency in your record, not of your health.";

/** Every calendar day with at least one symptom entry, oldest first. */
export function loggedSymptomDates(symptomEntries = []) {
  return [...new Set(symptomEntries.map((entry) => entry.date).filter(Boolean))].sort();
}

/** Length of the run of consecutive days that ends at `anchor`. */
function countBackFrom(anchor, dates) {
  const logged = new Set(dates);
  let count = 0;
  let cursor = anchor;

  while (logged.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  return count;
}

/** Longest run of consecutive days anywhere in the history. */
function longestRun(dates) {
  let longest = 0;
  let run = 0;
  let previous = null;

  for (const date of dates) {
    run = previous !== null && addDays(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  return longest;
}

/**
 * @param {Array} symptomEntries  Every symptom row the user has logged.
 * @param {string} today          Today's date as "YYYY-MM-DD".
 */
export function buildStreak(symptomEntries = [], today = "") {
  const dates = loggedSymptomDates(symptomEntries);
  const isTodayLogged = Boolean(today) && dates.includes(today);
  const yesterday = today ? addDays(today, -1) : "";

  // A streak stays alive until a whole calendar day has been missed, so an
  // evening user does not lose it before they have had a chance to log.
  const anchor = isTodayLogged ? today : dates.includes(yesterday) ? yesterday : "";

  const current = anchor ? countBackFrom(anchor, dates) : 0;

  return {
    current,
    /** True only while a streak is actually running. */
    hasStreak: current > 0,
    isTodayLogged,
    /** False when the streak is alive but today has not been logged yet. */
    isAtRisk: current > 0 && !isTodayLogged,
    daysLogged: dates.length,
    longest: longestRun(dates),
    loggedDates: dates,
    ...streakCopy({ current, isTodayLogged }),
  };
}

/**
 * The words. The number is always written out in full, so the message still
 * makes sense with the graphic removed or with the animation still running.
 */
export function streakCopy({ current = 0, isTodayLogged = false } = {}) {
  if (current <= 0) {
    return { label: "", headline: "", detail: "" };
  }

  const headline =
    MILESTONES[current] ??
    (current === 1
      ? "You've started your Advoc8 streak."
      : `You've logged your symptoms ${current} days in a row.`);

  return {
    label: `${current} DAY STREAK`,
    headline,
    detail: isTodayLogged ? "Keep building your health history." : "Log something today to keep it going.",
  };
}