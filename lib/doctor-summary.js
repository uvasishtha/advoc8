// Turns the Evidence Brief into a one-page, doctor-facing summary.
//
// Two rules govern this file:
//
//   1. Nothing is invented. Every sentence is assembled from numbers that
//      lib/analytics already calculated from the patient's own entries, or from
//      words the patient wrote. A missing field produces no row, not a guess.
//   2. Nothing is implied about cause. The wording here matches the discipline
//      in lib/analytics/language.js: counts, rates and co-occurrence only.
//
// The output is capped so the printed sheet stays on a single US Letter page.
// When a brief has more than fits, the extra is dropped and counted rather than
// squeezed in — `snapshot.omitted` lets the sheet say so honestly.

import { DAY_TO_DAY_OPTIONS, FIRST_NOTICED_OPTIONS } from "@/lib/onboarding";
import { formatDate, formatDateLong, formatDuration } from "@/lib/format";
import {
  countOf,
  decimal,
  hours as formatHours,
  severityMaximum,
  severityScore,
} from "@/lib/report-format";

/** How much of the brief can fit on one page. */
export const DOCTOR_SUMMARY_LIMITS = Object.freeze({
  concernSentences: 2,
  concernChars: 210,
  symptomRows: 6,
  descriptions: 3,
  descriptionChars: 95,
  trends: 4,
  patterns: 3,
  statementBullets: 4,
  statementBulletChars: 140,
  questions: 3,
  questionChars: 120,
  frequencyLines: 2,
});

const SENTENCE_BOUNDARY = /[^.!?…]+[.!?…]+["')\]]*|.+$/g;
const BULLET_PREFIX = /^\s*(?:[-*•–—]|\d+[.)])\s*/;

/** Splits prose into sentences without inventing any. */
function toSentences(text) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  return (clean.match(SENTENCE_BOUNDARY) ?? []).map((part) => part.trim()).filter(Boolean);
}

/** Trims to a word boundary. Marks the cut so a reader can see it was trimmed. */
function clip(text, maxChars) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;

  const cut = clean.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[.,;:]$/, "")}…`;
}

function plural(count, singular, many) {
  return count === 1 ? singular : many;
}

/**
 * Keeps whole sentences up to a budget, so the concern reads as something a
 * person wrote rather than as a fragment.
 */
function condense(text, { maxSentences, maxChars }) {
  const sentences = toSentences(text);
  if (sentences.length === 0) return "";

  const kept = [];
  let used = 0;

  for (const sentence of sentences) {
    if (kept.length >= maxSentences) break;
    const cost = sentence.length + (kept.length > 0 ? 1 : 0);
    if (kept.length > 0 && used + cost > maxChars) break;
    kept.push(sentence);
    used += cost;
  }

  if (kept.length === 0) kept.push(clip(sentences[0], maxChars));

  // The final kept sentence may still be too long on its own.
  const clipped = clip(kept[kept.length - 1], maxChars);
  kept[kept.length - 1] = clipped;

  return kept.join(" ");
}

/** First value that actually has text in it. */
function firstText(...candidates) {
  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (value) return value;
  }
  return "";
}

/** "I am not sure" -> "not sure"; "In the last month" -> "in the last month". */
function asValue(label) {
  const clean = String(label ?? "").trim();
  if (!clean) return "";
  if (/^I am not sure$/i.test(clean)) return "not sure";
  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

function optionValue(options, value) {
  const match = options.find((option) => option.value === value);
  return match ? asValue(match.label) : "";
}

// ---------------------------------------------------------------------------
// Guards
//
// A figure that failed to format, or an id that leaked into prose, must never
// reach a printed page. These two helpers are what keep that promise testable:
// the builders below filter with `usable`, and `findSummaryDefects` re-checks
// the finished sheet so a regression fails a test instead of a consultation.
// ---------------------------------------------------------------------------

/** Text that cannot be blank and cannot contain a leaked placeholder. */
const DEFECTIVE_TEXT = /undefined|\bNaN\b|\[object|\bnull\b/i;

/**
 * Arithmetic noise: a decimal run long enough to be a float artefact rather
 * than a measurement. "6.2" and "14.7" are fine; "14.699999999999989" is not.
 */
const FLOAT_ARTEFACT = /\d\.\d{4,}/;

/** Row keys like "sym-2026-09-04-headache" or "user-maya". */
const INTERNAL_ID = /\b(?:sym|user|ctx|entry)-[a-z0-9]+(?:-[a-z0-9]+)+\b/i;

function isUsable(text) {
  const value = String(text ?? "").trim();
  return (
    value !== "" &&
    !DEFECTIVE_TEXT.test(value) &&
    !FLOAT_ARTEFACT.test(value) &&
    !INTERNAL_ID.test(value)
  );
}

/** Every string a reader could see, flattened for the defect scan. */
export function printableText(summary) {
  if (!summary) return [];

  const parts = [
    summary.concern,
    ...(summary.trends ?? []),
    ...(summary.patterns ?? []),
    ...(summary.statement ?? []),
    ...(summary.questions ?? []),
    ...(summary.context ?? []).flatMap((row) => [row.label, row.value]),
    ...(summary.snapshot?.rows ?? []).flatMap((row) => [row.name, row.days, row.avgSeverity, row.maxSeverity, row.duration, row.lastSeen]),
    ...(summary.snapshot?.descriptions ?? []).flatMap((row) => [row.symptom, row.note]),
    summary.header?.meta,
    summary.header?.patient,
    summary.header?.generatedOn,
  ];

  return parts.filter((part) => part != null).map((part) => String(part));
}

/**
 * Anything on the sheet that should never be printed. Empty array means the
 * summary is safe to hand to a printer.
 */
export function findSummaryDefects(summary) {
  return printableText(summary).filter((text) => !isUsable(text));
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function buildHeader(report, user, today) {
  const range = report?.range ?? null;
  const pieces = [];

  if (range?.label) pieces.push(`Tracking period ${range.label}`);

  if (typeof range?.entryCount === "number" && Number.isFinite(range.entryCount)) {
    pieces.push(`${range.entryCount} ${plural(range.entryCount, "entry", "entries")} logged`);
  }

  return {
    title: "Doctor Summary",
    subtitle: "Patient-reported symptom history",
    generatedOn: today ? formatDateLong(today) : "",
    patient: user?.displayName && user.displayName !== "Your profile" ? user.displayName : "",
    meta: pieces.join(" · "),
  };
}

function buildConcern(report, user) {
  const source = firstText(user?.concernText, user?.concern);
  if (!source) return "";

  return condense(source, {
    maxSentences: DOCTOR_SUMMARY_LIMITS.concernSentences,
    maxChars: DOCTOR_SUMMARY_LIMITS.concernChars,
  });
}

/**
 * Picks, per symptom, the description the patient wrote on their worst day.
 *
 * Severity decides which entry speaks, because that is the episode a clinician
 * most needs described; ties go to the most recent day. Nothing is rewritten —
 * only whitespace is collapsed and long notes are trimmed at a word boundary,
 * so the words stay the patient's.
 */
function buildDescriptions(ranked, symptomEntries) {
  const entries = symptomEntries ?? [];
  if (entries.length === 0) return [];

  const seen = new Set();
  const picked = [];

  for (const symptom of ranked) {
    if (picked.length >= DOCTOR_SUMMARY_LIMITS.descriptions) break;

    const candidates = entries
      .filter((entry) => entry?.symptom === symptom.name && isUsable(entry.notes))
      .sort(
        (a, b) =>
          (b.severity ?? 0) - (a.severity ?? 0) ||
          String(b.date ?? "").localeCompare(String(a.date ?? "")),
      );

    const best = candidates[0];
    if (!best) continue;

    const note = clip(best.notes, DOCTOR_SUMMARY_LIMITS.descriptionChars);
    const key = note.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    picked.push({
      symptom: symptom.name,
      note,
      date: isUsable(best.date) ? formatDate(best.date, { withYear: false }) : "",
    });
  }

  return picked;
}

/**
 * The symptom table. Ranked by how often each symptom was reported, then by
 * peak severity, so the rows that survive the cap are the ones the patient came
 * in about.
 *
 * Every cell is either a formatted number or null. The sheet prints null as a
 * dash, so an unrecorded figure looks unrecorded instead of broken.
 */
function buildSnapshot(report, symptomEntries) {
  const ranked = [...(report?.symptoms ?? [])].sort(
    (a, b) =>
      b.daysReported - a.daysReported ||
      (b.maxSeverity ?? 0) - (a.maxSeverity ?? 0) ||
      a.name.localeCompare(b.name),
  );

  const trackingDays = report?.range?.totalDays ?? null;

  const rows = ranked
    .slice(0, DOCTOR_SUMMARY_LIMITS.symptomRows)
    .map((symptom) => ({
      name: symptom.name,
      days: symptom.daysReported,
      trackingDays,
      avgSeverity: severityScore(symptom.avgSeverity),
      maxSeverity: severityMaximum(symptom.maxSeverity),
      duration: symptom.avgDurationMinutes == null ? null : formatDuration(symptom.avgDurationMinutes),
      lastSeen: symptom.lastSeen ? formatDate(symptom.lastSeen, { withYear: false }) : "",
    }))
    .filter((row) => isUsable(row.name) && isUsable(row.days));

  return {
    rows,
    descriptions: buildDescriptions(ranked, symptomEntries),
    omitted: Math.max(0, ranked.length - rows.length),
    trackingDays,
    daysLogged: report?.range?.daysLogged ?? null,
    daysWithContext: report?.range?.daysWithContext ?? null,
  };
}

function trendLine({ name, first, second, delta, trend }) {
  const difference = Math.abs(decimal(Math.abs(delta ?? 0)) ?? 0);

  if (trend === "steady" || difference === 0) {
    return `${name} average severity was ${first} / 10 in the first half of the period and ${second} / 10 in the second half — no clear change in the records.`;
  }

  const direction = delta > 0 ? "rose" : "fell";
  const points = plural(difference, "point", "points");
  const signed = delta > 0 ? `+${difference}` : `−${difference}`;

  return `${name} average severity ${direction} from ${first} / 10 in the first half of the period to ${second} / 10 in the second half (${signed} ${points}).`;
}

/**
 * The 2–4 numbers that matter most: how often the leading symptoms appeared,
 * then the largest changes in average severity between the two halves.
 */
function buildTrends(report) {
  const range = report?.range;
  if (!range) return [];

  // Only the two most-reported symptoms get a frequency line; the rest of the
  // space is better spent on change over time.
  const lines = (report.symptoms ?? [])
    .slice(0, DOCTOR_SUMMARY_LIMITS.frequencyLines)
    .map((symptom) => {
      const counted = countOf(symptom.daysReported, range.totalDays);
      return counted ? `${symptom.name} was recorded on ${counted} tracked days.` : "";
    })
    .filter(Boolean);

  const changes = (report.symptoms ?? [])
    .filter(
      (symptom) =>
        symptom.hasEnoughData &&
        symptom.halves?.firstHalf?.averageSeverity != null &&
        symptom.halves?.secondHalf?.averageSeverity != null,
    )
    .map((symptom) => ({
      name: symptom.name,
      first: decimal(symptom.halves.firstHalf.averageSeverity),
      second: decimal(symptom.halves.secondHalf.averageSeverity),
      delta: symptom.halves.delta,
      trend: symptom.trend,
    }))
    .filter((change) => change.first != null && change.second != null)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0));

  for (const change of changes) {
    if (lines.length >= DOCTOR_SUMMARY_LIMITS.trends) break;
    lines.push(trendLine(change));
  }

  return lines.slice(0, DOCTOR_SUMMARY_LIMITS.trends).filter((line) => isUsable(line));
}

/**
 * Co-occurrence only. The patient's own records, in third person, with no
 * suggestion that one thing produced another.
 */
function buildPatterns(report) {
  return (report?.patterns ?? [])
    .slice(0, DOCTOR_SUMMARY_LIMITS.patterns)
    .map((pattern) => {
      const factor = String(pattern.label ?? "").replace(/\byour\b/gi, "the patient's");
      const counted = countOf(pattern.symptomDaysInFactor, pattern.factorDays);
      if (!counted || !factor) return "";

      return `Observed pattern: ${pattern.symptom} was recorded on ${counted} ${plural(pattern.factorDays, "day", "days")} the patient recorded with ${factor}.`;
    })
    .filter((line) => isUsable(line));
}

/** The patient's own words, condensed into bullets. Never generated. */
function buildStatement(draft, user) {
  const source = firstText(draft?.statement, user?.doctorNote);
  if (!source) return [];

  const lines = source
    .split(/\n+/)
    .map((line) => line.replace(BULLET_PREFIX, "").trim())
    .filter(Boolean);

  const parts = lines.length > 1 ? lines : toSentences(source);
  if (parts.length === 0) return [];

  return parts
    .slice(0, DOCTOR_SUMMARY_LIMITS.statementBullets)
    .map((part) => clip(part, DOCTOR_SUMMARY_LIMITS.statementBulletChars));
}

function buildQuestions(draft) {
  return (draft?.questions ?? [])
    .map((question) => (typeof question === "string" ? question : question?.text))
    .map((text) => String(text ?? "").trim())
    .filter(Boolean)
    .slice(0, DOCTOR_SUMMARY_LIMITS.questions)
    .map((text) => clip(text, DOCTOR_SUMMARY_LIMITS.questionChars));
}

/**
 * Only what the patient actually recorded. Sleep, stress and cycle data come
 * from the tracking rows; onset and day-to-day impact come from their setup
 * answers. Anything not captured anywhere is simply absent — no medication
 * list, because none is captured, and none is guessed at.
 */
function buildContext(report, user) {
  const rows = [];
  const context = report?.context ?? {};

  // `range.daysLogged` is the count of days a symptom was recorded. It is not
  // called daysWithSymptoms: a day can be tracked without a symptom on it.
  const counted = countOf(report?.range?.daysLogged, report?.range?.totalDays);
  if (counted) {
    rows.push({ label: "Days a symptom was recorded", value: `${counted} days` });
  }

  const contextCounted = countOf(report?.range?.daysWithContext, report?.range?.totalDays);
  if (contextCounted) {
    rows.push({ label: "Days sleep and stress recorded", value: `${contextCounted} days` });
  }

  const sleep = formatHours(context.averageSleep);
  if (sleep) {
    const parts = [`average ${sleep} per night`];
    if (context.lowSleepDays > 0) {
      parts.push(`${context.lowSleepDays} ${plural(context.lowSleepDays, "night", "nights")} under 6h`);
    }
    const shortest = formatHours(context.minimumSleep);
    if (shortest) parts.push(`shortest ${shortest}`);
    rows.push({ label: "Sleep", value: parts.join(" · ") });
  }

  const stress = decimal(context.averageStress);
  if (stress != null) {
    const parts = [`average ${stress} / 5`];
    if (context.highStressDays > 0) {
      parts.push(
        `${context.highStressDays} ${plural(context.highStressDays, "day", "days")} at 4 or 5`,
      );
    }
    rows.push({ label: "Stress", value: parts.join(" · ") });
  }

  if (user?.tracksCycle) {
    const parts = ["tracked"];
    if (user.cycleLength) parts.push(`typical cycle ${user.cycleLength} days`);
    if (user.lastPeriodStart) parts.push(`last period began ${formatDate(user.lastPeriodStart)}`);
    rows.push({ label: "Menstrual cycle", value: parts.join(" · ") });
  }

  const noticed = optionValue(FIRST_NOTICED_OPTIONS, user?.firstNoticed);
  if (noticed) rows.push({ label: "First noticed", value: noticed });

  const impact = optionValue(DAY_TO_DAY_OPTIONS, user?.dayToDay);
  if (impact) rows.push({ label: "Day-to-day impact", value: impact });

  return rows;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * @param {object} input
 * @param {object} input.report  The Evidence Brief report from buildReport().
 * @param {object} input.user    The profile from buildProfile().
 * @param {object} input.draft   The patient's statement and questions.
 * @param {object[]} [input.symptomEntries] Raw entries, for the descriptions
 *   the patient wrote against their worst days. Omit it and the sheet simply
 *   carries no descriptions — it never falls back to generated text.
 * @param {string} [input.today] ISO date the report is being generated on.
 */
export function buildDoctorSummary({ report, user, draft, symptomEntries, today } = {}) {
  const isEmpty = !report || report.isEmpty === true;

  if (isEmpty) {
    return {
      isEmpty: true,
      header: {
        title: "Doctor Summary",
        subtitle: "Patient-reported symptom history",
        generatedOn: today ? formatDateLong(today) : "",
        patient: "",
        meta: "",
      },
      concern: "",
      snapshot: {
        rows: [],
        descriptions: [],
        omitted: 0,
        trackingDays: null,
        daysLogged: null,
        daysWithContext: null,
      },
      trends: [],
      patterns: [],
      statement: [],
      questions: [],
      context: [],
    };
  }

  return {
    isEmpty: false,
    header: buildHeader(report, user, today),
    concern: buildConcern(report, user),
    snapshot: buildSnapshot(report, symptomEntries),
    trends: buildTrends(report),
    patterns: buildPatterns(report),
    statement: buildStatement(draft, user),
    questions: buildQuestions(draft),
    context: buildContext(report, user).filter((row) => isUsable(row.value)),
  };
}

/** True when there is nothing a doctor would read. Tolerates partial input. */
export function isEmptySummary(summary) {
  if (!summary || summary.isEmpty) return true;

  return (
    (summary.snapshot?.rows?.length ?? 0) === 0 &&
    (summary.snapshot?.descriptions?.length ?? 0) === 0 &&
    (summary.trends?.length ?? 0) === 0 &&
    (summary.patterns?.length ?? 0) === 0 &&
    (summary.statement?.length ?? 0) === 0 &&
    (summary.questions?.length ?? 0) === 0 &&
    (summary.context?.length ?? 0) === 0 &&
    !summary.concern
  );
}