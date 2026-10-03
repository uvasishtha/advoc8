// Number and label formatting for the printed Doctor Summary.
//
// Every figure that reaches the sheet goes through this file, for two reasons.
//
//   1. Consistency. Severity reads "6.2 / 10" in the snapshot, "6.2 / 10" in a
//      trend line and "rose from 4.1 / 10 to 6.2 / 10" in between. That only
//      holds if all three call the same function.
//   2. Safety. A missing or unparseable number becomes null here, and the sheet
//      renders null as an em dash. It never becomes the word "undefined" or
//      "NaN" — a bug that reads as a finding.
//
// Decimals are deliberately boring: at most one place, trailing zeros dropped.
// "8 / 10", not "8.0 / 10". "6.2 / 10", not "6.200000000000001 / 10".

/** What the sheet prints where a number was not recorded. */
export const NO_VALUE = "—";

/** A real, finite number — or null. Everything else is "not recorded". */
export function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * At most `places` decimals, trailing zeros removed. Never a float artefact:
 * decimal(6.200000000000001) === "6.2".
 */
export function decimal(value, places = 1) {
  const number = finite(value);
  if (number == null) return null;

  const factor = 10 ** places;
  const rounded = Math.round(number * factor) / factor;

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(places);
}

/** "6.2" for an average, "8" for a peak. null when not recorded. */
export function decimalOrNull(value, places = 1) {
  return decimal(value, places);
}

/** A 0–10 severity with its scale spelled out: "6.2 / 10". */
export function severityScore(value, places = 1) {
  const number = decimal(value, places);
  return number == null ? null : `${number} / 10`;
}

/** The integer peak severity the patient gave: "8 / 10". */
export function severityMaximum(value) {
  const number = finite(value);
  if (number == null) return null;

  const whole = Math.round(number);
  return `${decimal(whole)} / 10`;
}

/** Sleep hours: "6.2h". */
export function hours(value, places = 1) {
  const number = decimal(value, places);
  return number == null ? null : `${number}h`;
}

/** A count against the period: "14 of 30 tracked days" needs no percentage. */
export function countOf(part, total) {
  const from = finite(part);
  const outOf = finite(total);

  if (from == null || outOf == null || outOf <= 0) return null;
  return `${Math.round(from)} of ${Math.round(outOf)}`;
}

/** 1 -> "day", 14 -> "days". */
export function dayWord(count) {
  const number = finite(count);
  if (number == null) return "days";
  return Math.round(number) === 1 ? "day" : "days";
}

/**
 * A share of the period as a whole percentage: "43%". Rounded to a whole
 * number on purpose — a sheet for a ten-minute appointment does not need a
 * percentage to one decimal place.
 */
export function percentLabel(fraction) {
  const value = finite(fraction);
  if (value == null) return null;
  return `${Math.round(value * 100)}%`;
}

/**
 * Drops any figure the formatter could not render. Used on values that were
 * interpolated into a sentence, where a fallback dash would read oddly.
 */
export function orDash(text) {
  const value = String(text ?? "").trim();
  return value === "" ? NO_VALUE : value;
}