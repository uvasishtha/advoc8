// Initial setup: the questions, the answers they produce, and every rule that
// is derived from those answers.
//
// Rules for this file:
//   - Pure data and pure functions. No React, no storage, no I/O.
//   - The survey form, the feature gates and the Evidence Brief all read from
//     here, so "what a completed profile means" is defined exactly once.
//
// Persistence lives in components/providers/DataProvider.jsx, which is the swap
// point for Supabase. Nothing in this file needs to change when it does.

import { SAMPLE_STATEMENT, SAMPLE_USER } from "@/lib/seed/maya";

export const SETUP_STATUS = Object.freeze({
  PENDING: "pending",
  SKIPPED: "skipped",
  COMPLETED: "completed",
});

/** Common symptoms offered as chips. `Other` opens a free-text field. */
export const SURVEY_SYMPTOM_OPTIONS = Object.freeze([
  "Headache",
  "Fatigue",
  "Nausea",
  "Pain",
  "Dizziness",
  "Pelvic pain",
  "Brain fog",
  "Joint pain",
  "Anxiety",
  "Bloating",
  "Insomnia",
  "Other",
]);

const OTHER_SYMPTOM = "Other";

/**
 * What the person has *themselves* noticed might go with their symptoms.
 *
 * Deliberately not a medical cause list. These are the user's own observations,
 * offered as things to keep an eye on, and the copy on the question says so —
 * Advoc8 has no business turning "I feel worse after a bad night's sleep" into
 * "poor sleep causes this".
 *
 * This is baseline context for later pattern detection, collected once. The
 * longitudinal detail belongs in /track, not here.
 */
export const POSSIBLE_FACTOR_OPTIONS = Object.freeze([
  { value: "sleep", label: "Sleep" },
  { value: "stress", label: "Stress" },
  { value: "food", label: "Food or meals" },
  { value: "activity", label: "Exercise or activity" },
  { value: "medication", label: "Medications or supplements" },
  { value: "cycle", label: "Menstrual cycle" },
  { value: "time-of-day", label: "Time of day" },
  { value: "certain-activities", label: "Certain activities" },
  { value: "nothing-yet", label: "Nothing I've noticed yet" },
  { value: "other", label: "Other" },
]);

const OTHER_FACTOR = "other";

/**
 * Cycle relevance is three-valued on purpose. "Yes"/"No" forced a binary that
 * quietly assumed every user menstruates and that everyone knows their own
 * cycle is relevant; "I'm not sure" is the honest answer for a lot of people and
 * must not be made to answer a question they cannot yet.
 */
export const CYCLE_RELEVANCE_OPTIONS = Object.freeze([
  { value: "yes", label: "Yes, I'd like to track it" },
  { value: "unsure", label: "I'm not sure" },
  { value: "no", label: "No" },
]);

const CYCLE_RELEVANCE_VALUES = CYCLE_RELEVANCE_OPTIONS.map((option) => option.value);

// `sentence` is used when these answers are quoted back in the Evidence Brief,
// so the wording there reads as prose instead of a form value.
export const FIRST_NOTICED_OPTIONS = Object.freeze([
  {
    value: "last-week",
    label: "In the last week",
    sentence: "I first noticed this in the last week.",
  },
  {
    value: "last-month",
    label: "In the last month",
    sentence: "I first noticed it in the last month.",
  },
  {
    value: "one-to-three-months",
    label: "1 to 3 months ago",
    sentence: "I first noticed it between one and three months ago.",
  },
  {
    value: "three-to-six-months",
    label: "3 to 6 months ago",
    sentence: "I first noticed it between three and six months ago.",
  },
  {
    value: "over-six-months",
    label: "More than 6 months ago",
    sentence: "I first noticed it more than six months ago.",
  },
  {
    value: "unsure",
    label: "I am not sure",
    sentence: "I am not sure exactly when it started.",
  },
]);

export const DAY_TO_DAY_OPTIONS = Object.freeze([
  {
    value: "none",
    label: "Little or no impact",
    sentence: "It has little or no impact on my day-to-day life.",
  },
  {
    value: "some",
    label: "Some impact on my day",
    sentence: "It has some impact on my day-to-day life.",
  },
  {
    value: "significant",
    label: "Significant impact",
    sentence: "It has a significant impact on my day-to-day life.",
  },
  {
    value: "missed",
    label: "Missed school or work",
    sentence: "It has made me miss school or work.",
  },
]);

export const CYCLE_LENGTH_MIN = 20;
export const CYCLE_LENGTH_MAX = 45;

export const CYCLE_LENGTH_OPTIONS = Object.freeze(
  Array.from({ length: CYCLE_LENGTH_MAX - CYCLE_LENGTH_MIN + 1 }, (unused, index) =>
    String(CYCLE_LENGTH_MIN + index),
  ).map((value) => ({ value, label: `${value} days` })),
);

/** The shape stored for a brand new user who has answered nothing yet. */
export const EMPTY_ONBOARDING = Object.freeze({
  status: SETUP_STATUS.PENDING,
  firstName: "",
  concern: "",
  firstNoticed: "",
  symptoms: [],
  otherSymptom: "",
  possibleFactors: [],
  otherFactor: "",
  dayToDay: "",
  doctorNote: "",
  cycleRelevance: "",
  tracksCycle: null,
  cycleLength: "",
  lastPeriodStart: "",
  completedAt: null,
  skippedAt: null,
  source: "local",
});

/**
 * The sample profile. Only ever written by "Restore sample data", which is why
 * it is a completed profile: the demo should show the app in its unlocked,
 * fully populated state rather than making a judge sit through setup first.
 */
export const SAMPLE_ONBOARDING = Object.freeze({
  status: SETUP_STATUS.COMPLETED,
  firstName: SAMPLE_USER.firstName,
  concern: SAMPLE_USER.concern,
  firstNoticed: "last-month",
  symptoms: ["Headache", "Fatigue", "Pelvic pain", "Brain fog", "Dizziness", "Nausea", "Joint pain", "Anxiety", "Bloating", "Insomnia"],
  otherSymptom: "",
  possibleFactors: ["sleep", "stress", "cycle"],
  otherFactor: "",
  dayToDay: "significant",
  doctorNote: SAMPLE_STATEMENT,
  cycleRelevance: "yes",
  tracksCycle: true,
  cycleLength: "28",
  lastPeriodStart: "2026-09-02",
  completedAt: "2026-09-01T09:00:00.000Z",
  skippedAt: null,
  source: "sample",
});

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isOneOf(value, options) {
  return options.some((option) => option.value === value);
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toIsoDate(value) {
  const text = toText(value);
  return ISO_DATE.test(text) ? text : "";
}

/**
 * Resolves the three-valued `cycleRelevance` into the legacy boolean.
 *
 * `tracksCycle` predates `cycleRelevance` and is still what the rest of the app
 * reads (`buildProfile().tracksCycle`, the cycle field on /track), so it stays as
 * the stored source of truth rather than being removed. Older saved profiles
 * only have the boolean, newer ones only have `cycleRelevance`; this accepts
 * either and always produces the boolean. `cycleRelevance` is kept alongside it
 * so the survey can still show which of the three answers was given.
 */
function resolveCycleTracking(answers = {}) {
  const relevance = CYCLE_RELEVANCE_VALUES.includes(answers.cycleRelevance)
    ? answers.cycleRelevance
    : "";

  if (relevance !== "") {
    return { cycleRelevance: relevance, tracksCycle: relevance === "yes" };
  }

  const legacy =
    answers.tracksCycle === true || answers.tracksCycle === false ? answers.tracksCycle : null;

  // No new answer and no legacy boolean: only a profile that explicitly said "not
  // sure" keeps cycle data around, and anything unanswered stays unanswered.
  return { cycleRelevance: "", tracksCycle: legacy };
}

/**
 * Coerces whatever the form held into the stored shape: strings trimmed,
 * unknown options dropped, and the cycle fields cleared when cycle tracking was
 * not chosen. Safe to call on data read back from storage.
 */
export function normaliseSurvey(answers = {}) {
  const symptoms = Array.isArray(answers.symptoms)
    ? answers.symptoms.filter((name) => SURVEY_SYMPTOM_OPTIONS.includes(name))
    : [];

  const possibleFactors = Array.isArray(answers.possibleFactors)
    ? answers.possibleFactors.filter((value) =>
        POSSIBLE_FACTOR_OPTIONS.some((option) => option.value === value),
      )
    : [];

  const { cycleRelevance, tracksCycle } = resolveCycleTracking(answers);

  const cycleLength = toText(answers.cycleLength);
  const cycleLengthNumber = Number(cycleLength);
  const cycleLengthValid =
    cycleLength !== "" &&
    Number.isInteger(cycleLengthNumber) &&
    cycleLengthNumber >= CYCLE_LENGTH_MIN &&
    cycleLengthNumber <= CYCLE_LENGTH_MAX;

  return {
    firstName: toText(answers.firstName),
    concern: toText(answers.concern),
    firstNoticed: isOneOf(answers.firstNoticed, FIRST_NOTICED_OPTIONS) ? answers.firstNoticed : "",
    symptoms,
    otherSymptom: symptoms.includes(OTHER_SYMPTOM) ? toText(answers.otherSymptom) : "",
    possibleFactors,
    otherFactor: possibleFactors.includes(OTHER_FACTOR) ? toText(answers.otherFactor) : "",
    dayToDay: isOneOf(answers.dayToDay, DAY_TO_DAY_OPTIONS) ? answers.dayToDay : "",
    doctorNote: toText(answers.doctorNote),
    cycleRelevance,
    tracksCycle,
    cycleLength: tracksCycle === true && cycleLengthValid ? String(cycleLengthNumber) : "",
    lastPeriodStart: tracksCycle === true ? toIsoDate(answers.lastPeriodStart) : "",
  };
}

/**
 * @returns an object keyed by field name. Empty object means the answers can be
 * saved. Only a name and the main concern are required — everything else is
 * there because it makes the brief better, not because it is mandatory.
 */
export function validateSurvey(answers = {}) {
  const clean = normaliseSurvey(answers);
  const errors = {};

  if (!clean.firstName) {
    errors.firstName = "Advoc8 needs a name to greet you by.";
  }

  if (!clean.concern) {
    errors.concern = "One line is enough. What do you want to keep track of?";
  }

  // A hand-edited or restored value outside the option list is reported rather
  // than silently dropped, so the form never quietly discards an answer.
  if (toText(answers.firstNoticed) && !clean.firstNoticed) {
    errors.firstNoticed = "Pick one of these options.";
  }

  if (toText(answers.dayToDay) && !clean.dayToDay) {
    errors.dayToDay = "Pick one of these options.";
  }

  if (clean.symptoms.includes(OTHER_SYMPTOM) && !clean.otherSymptom) {
    errors.otherSymptom = "Add your own wording, or choose a different symptom.";
  }

  // "What have you noticed?" is optional, so only the free-text escape hatch is
  // ever required — never the question itself.
  if (clean.possibleFactors.includes(OTHER_FACTOR) && !clean.otherFactor) {
    errors.otherFactor = "Add your own wording, or choose a different option.";
  }

  // Only an explicit "yes" demands the two cycle details. "I'm not sure" must
  // stay answerable without them, or the survey punishes the honest reply.
  if (clean.tracksCycle === true) {
    if (!clean.cycleLength) {
      errors.cycleLength = "Pick the length of a typical cycle.";
    }

    if (!clean.lastPeriodStart) {
      errors.lastPeriodStart = "Add the day your last period started.";
    } else if (clean.lastPeriodStart > todayLocalIso()) {
      errors.lastPeriodStart = "That date cannot be in the future.";
    }
  }

  return errors;
}

function todayLocalIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Symptom chips as they will read in a sentence. */
export function describeSymptoms({ symptoms = [], otherSymptom = "" } = {}) {
  const names = symptoms
    .map((name) => (name === OTHER_SYMPTOM ? toText(otherSymptom) : name))
    .filter(Boolean);

  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function optionSentence(options, value) {
  return options.find((option) => option.value === value)?.sentence ?? "";
}

/**
 * The survey answers written as one paragraph. This is the "My main concern"
 * block at the top of the Evidence Brief, so it has to read as something a
 * person wrote rather than as a list of fields.
 */
export function composeConcern(answers = {}) {
  const clean = normaliseSurvey(answers);
  const parts = [];

  if (clean.concern) parts.push(clean.concern);

  const symptoms = describeSymptoms(clean);
  if (symptoms) parts.push(`Symptoms I am tracking: ${symptoms.toLowerCase()}.`);

  const noticed = optionSentence(FIRST_NOTICED_OPTIONS, clean.firstNoticed);
  if (noticed) parts.push(noticed);

  const impact = optionSentence(DAY_TO_DAY_OPTIONS, clean.dayToDay);
  if (impact) parts.push(impact);

  return parts.join(" ");
}

/**
 * The person as the rest of the app sees them. Every screen reads this instead
 * of importing the sample user, so the demo and a brand new user look the same
 * to the components that use it.
 */
export function buildProfile(onboarding) {
  const clean = normaliseSurvey(onboarding ?? {});
  const isSample = onboarding?.source === "sample";
  const firstName = clean.firstName;
  const words = firstName.split(/\s+/).filter(Boolean);

  return {
    id: isSample ? SAMPLE_USER.id : "user-local",
    status: onboarding?.status ?? SETUP_STATUS.PENDING,
    firstName,
    displayName: firstName || "Your profile",
    initials: words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
    greeting: firstName ? `Welcome back, ${firstName}` : "Welcome back",
    email: isSample ? SAMPLE_USER.email : null,
    isSample,
    concern: composeConcern(clean),
    concernText: clean.concern,
    firstNoticed: clean.firstNoticed,
    symptoms: clean.symptoms
      .map((name) => (name === OTHER_SYMPTOM ? clean.otherSymptom : name))
      .filter(Boolean),
    dayToDay: clean.dayToDay,
    doctorNote: clean.doctorNote,
    possibleFactors: clean.possibleFactors,
    otherFactor: clean.otherFactor,
    cycleRelevance: clean.cycleRelevance,
    tracksCycle: clean.tracksCycle === true,
    cycleLength: clean.cycleLength === "" ? null : Number(clean.cycleLength),
    lastPeriodStart: clean.lastPeriodStart || null,
  };
}

// ---------------------------------------------------------------------------
// Feature gating
// ---------------------------------------------------------------------------

export const FEATURE_IDS = Object.freeze({
  BRIEF: "brief",
  PRACTICE: "practice",
});

/**
 * Days of logged symptoms before the personalised features open.
 *
 * Counting days rather than entries is the point: one bad afternoon logged three
 * times is not a record, and a brief built from it would have nothing to say. A
 * few days spread across the week is the smallest amount of history that can
 * honestly be called a pattern.
 */
export const MIN_DAYS_LOGGED = 3;

/**
 * How many distinct days carry at least one symptom entry.
 *
 * Entries carry a plain "YYYY-MM-DD" date, so the days are strings already and
 * need no parsing or timezone handling to be counted.
 */
export function countLoggedDays(symptomEntries = []) {
  const days = new Set();
  for (const entry of symptomEntries) {
    if (typeof entry?.date === "string" && entry.date !== "") days.add(entry.date);
  }
  return days.size;
}

/**
 * One rule table for every lock in the app: the brief and the rehearsal open
 * together, once there are enough logged days behind them.
 *
 * Symptom tracking is deliberately absent from it. Collecting data must never
 * be blocked, or the features below could never unlock in the first place.
 *
 * Setup is not in the table either. Answering the survey says what to track;
 * the entries say whether there is a record to work from. Someone who skips
 * setup gets the sample month, which is already three days deep, so the same
 * rule opens everything for them without a special case.
 */
export function buildAccess({ onboarding, symptomEntries = [] } = {}) {
  const status = onboarding?.status ?? SETUP_STATUS.PENDING;
  const setupComplete = status === SETUP_STATUS.COMPLETED;
  const trackingEntries = symptomEntries.length;
  const daysLogged = countLoggedDays(symptomEntries);
  const daysMissing = Math.max(MIN_DAYS_LOGGED - daysLogged, 0);
  const unlocked = daysLogged >= MIN_DAYS_LOGGED;
  const daysToGo = `${daysMissing} more ${daysMissing === 1 ? "day" : "days"}`;

  const features = {
    [FEATURE_IDS.BRIEF]: {
      id: FEATURE_IDS.BRIEF,
      title: "Evidence Brief",
      unlocked,
      message: unlocked
        ? `${daysLogged} days logged.`
        : `Log symptoms on ${daysToGo} and your Evidence Brief opens.`,
      action: unlocked ? null : { label: "Log a symptom", href: "/track" },
    },
    [FEATURE_IDS.PRACTICE]: {
      id: FEATURE_IDS.PRACTICE,
      title: "Practice your conversation",
      unlocked,
      message: unlocked
        ? `${daysLogged} days logged.`
        : `Log symptoms on ${daysToGo} and you can rehearse your conversation.`,
      action: unlocked ? null : { label: "Log a symptom", href: "/track" },
    },
  };

  return {
    status,
    setupComplete,
    /** The survey has been answered, even if the answer was "not yet". */
    setupStarted: status !== SETUP_STATUS.PENDING,
    needsSetup: !setupComplete,
    trackingEntries,
    daysLogged,
    /** True while the personalised features are still waiting on tracking. */
    needsTracking: !unlocked,
    features,
  };
}
