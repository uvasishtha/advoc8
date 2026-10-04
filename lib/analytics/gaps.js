// "Make sure I mention…" — the gaps in the story, not the gaps in the data.
//
// This is the part of the brief that goes after the record itself. Someone can
// log four symptoms diligently for a month and still walk into an appointment
// unable to say when it started, what it stopped them doing, or what they want
// to happen next. Those are the things a clinician asks for, and they are the
// things nobody thinks to write down.
//
// So each entry here answers two questions:
//   - What is missing from the story?
//   - What is the smallest thing the person could add or say to close it?
//
// Rules:
//   - Pure. No I/O, no `Date.now()`, no model calls.
//   - A gap is only reported when it is genuinely open. Once it is covered, it
//     stops appearing — the list shrinks as the story improves, which is the
//     behaviour that makes it worth reading.
//   - Nothing here diagnoses, and nothing here says a missing detail is the
//     reason for a symptom. It is a gap in the record, not in the person.

import { COVERAGE_THRESHOLD, weeksSpanned } from "./calculations";
import { FIRST_NOTICED_OPTIONS } from "@/lib/onboarding";

/** Below this many distinct weeks, "is this ongoing" is still an open question. */
const MIN_WEEKS_FOR_ONGOING = 2;

/**
 * "When did it start". Closed by the setup survey's answer, because that answer
 * is already printed in section 01 — re-asking for it would be nagging about
 * something the brief already says.
 */
function startDetail(profile, symptom) {
  const answered = FIRST_NOTICED_OPTIONS.some((option) => option.value === profile?.firstNoticed);
  if (answered) return null;

  return {
    detail:
      symptom == null
        ? "Your record does not say when this started. “It has been going on for a while” is much harder to act on than a month."
        : `Your record does not say when ${symptom.toLowerCase()} started, or whether it has been constant since.`,
    ask: "Say when you first noticed it, and whether it comes and goes or has been steady.",
  };
}

function statementDetail(statement) {
  const written = typeof statement === "string" && statement.trim();

  return written
    ? null
    : {
        detail:
          "Your brief has no opening line in your own words. Without one, everything else in it reads as data you collected rather than something you are asking about.",
        ask: "Write one sentence: what do you want to walk out of this appointment with?",
      };
}

function impactDetail(profile) {
  if (profile?.dayToDay) return null;

  return {
    detail:
      "Nothing in your record says what this does to your day. That is usually the part a clinician cannot see, and it is often the part that changes what they do.",
    ask: "Note what you had to stop, postpone or push through on the worst days.",
  };
}

function notesDetail(coverage) {
  if (coverage.noteRate >= COVERAGE_THRESHOLD) return null;

  const missing = Math.max(0, coverage.total - coverage.notes);

  return {
    detail: `${missing} of your ${coverage.total} ${
      coverage.total === 1 ? "entry has" : "entries have"
    } no note. What made it better or worse is the detail nobody can infer from a severity number.`,
    ask: "In your notes, mention anything that reliably helped or reliably made it worse.",
  };
}

function durationDetail(coverage) {
  if (coverage.durationRate >= COVERAGE_THRESHOLD) return null;

  const missing = Math.max(0, coverage.total - coverage.durations);

  return {
    detail: `You recorded how long it lasted on ${coverage.durations} of ${coverage.total} ${
      coverage.total === 1 ? "entry" : "entries"
    }. Duration is what tells a clinician whether this is brief and sharp or long and dull.`,
    ask: "Add how long a typical episode runs, from when it starts to when it eases.",
  };
}

function impactPerEntryDetail(coverage) {
  if (coverage.impactRate >= COVERAGE_THRESHOLD) return null;

  const missing = Math.max(0, coverage.total - coverage.impacts);

  return {
    detail:
      missing === coverage.total
        ? "None of your entries say what the day looked like afterwards. Severity is a number; what you could not do that day is the part a clinician can act on."
        : `${missing} of your ${coverage.total} ${
            coverage.total === 1 ? "entry" : "entries"
          } say what the day looked like afterwards.`,
    ask: "Mark the entries that cost you something — a missed plan, a bad night, work you had to move.",
  };
}

function contextDetail(daysLogged, daysWithContext) {
  if (daysLogged === 0) return null;
  if (daysWithContext >= daysLogged) return null;

  const missing = daysLogged - daysWithContext;

  return {
    detail: `You logged sleep and stress on ${daysWithContext} of the ${daysLogged} days you reported a symptom, so ${missing} ${
      missing === 1 ? "day has" : "days have"
    } nothing alongside it. Those days cannot take part in any comparison.`,
    ask: "Add sleep and stress to the same day as a symptom entry, even roughly.",
  };
}

function ongoingDetail(dates) {
  if (weeksSpanned(dates) >= MIN_WEEKS_FOR_ONGOING) return null;

  return {
    detail:
      "Everything so far sits inside a single week. A clinician cannot tell a flare from a pattern yet, and neither can you.",
    ask: "Keep logging for a second week so you can say whether this is ongoing.",
  };
}

function allClear() {
  return {
    id: "complete",
    title: "Your story is complete",
    detail:
      "You have said when this started, what it does to your day, and what you want out of the appointment. Nothing important is missing.",
    ask: null,
    isClear: true,
  };
}

/**
 * @param {object} input
 * @param {Array} input.symptomEntries  Raw tracking rows
 * @param {object} input.coverage      Output of storyCoverage()
 * @param {object} input.profile       The composed profile from lib/onboarding
 * @param {object} input.range         The reported period
 * @param {string} input.statement     The user's own statement, if written
 * @returns {Array} Open gaps in the order a clinician would ask them, or a
 *   single positive entry when nothing is missing.
 */
export function buildGaps({
  symptomEntries = [],
  coverage = { total: 0, notes: 0, noteRate: 0, durations: 0, durationRate: 0, impacts: 0, impactRate: 0 },
  profile = null,
  range = { daysLogged: 0, daysWithContext: 0 },
  statement = "",
} = {}) {
  const lead = [...new Set(symptomEntries.map((entry) => entry.symptom))][0] ?? null;
  const dates = [...new Set(symptomEntries.map((entry) => entry.date))].sort();

  const candidates = [
    { id: "start", title: "When it started", ...(startDetail(profile, lead) ?? {}) },
    { id: "statement", title: "What you want them to understand", ...(statementDetail(statement) ?? {}) },
    { id: "impact", title: "How it affects your day", ...impactDetail(profile) },
    { id: "notes", title: "What makes it better or worse", ...notesDetail(coverage) },
    { id: "duration", title: "How long each episode lasts", ...durationDetail(coverage) },
    { id: "cost", title: "What you had to stop doing", ...impactPerEntryDetail(coverage) },
    {
      id: "context",
      title: "What else was happening that day",
      ...(contextDetail(range.daysLogged, range.daysWithContext) ?? {}),
    },
    { id: "ongoing", title: "Whether this is ongoing", ...ongoingDetail(dates) },
  ];

  const gaps = candidates.filter((gap) => gap.detail);
  return gaps.length > 0 ? gaps : [allClear()];
}