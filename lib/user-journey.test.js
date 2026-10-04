import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildReport } from "@/lib/analytics";
import { CAUSAL_VERBS, DIAGNOSTIC_VERBS } from "@/lib/analytics/language";
import {
  buildAccess,
  buildProfile,
  composeConcern,
  FEATURE_IDS,
  MIN_DAYS_LOGGED,
  normaliseSurvey,
  SETUP_STATUS,
  validateSurvey,
} from "@/lib/onboarding";
import { buildFallbackQuestions } from "@/lib/ai/gemini";
import { fallbackReply } from "@/lib/ai/practice";
import { ExperiencingSection, GapsSection, NoticedSection } from "@/components/brief/ReportSections";

// A brand new user answering the setup survey with the minimum required.
const NEW_USER_ANSWERS = {
  firstName: "Priya",
  concern: "Headaches most mornings for about three weeks and I cannot tell what is setting them off.",
  firstNoticed: "one-to-three-months",
  symptoms: ["Headache", "Fatigue"],
  dayToDay: "some",
  tracksCycle: true,
  cycleLength: "28",
  lastPeriodStart: "2026-08-20",
};

function entry(date, symptom, severity, extra = {}) {
  return { id: `e-${date}-${symptom}`, date, symptom, severity, duration_minutes: 90, ...extra };
}

/** A few days of tracking that looks like a real person on their phone. */
function sparseDataset(days) {
  const symptomEntries = [];
  const contextEntries = [];

  for (let day = 1; day <= days; day += 1) {
    const date = `2026-09-${String(day).padStart(2, "0")}`;

    contextEntries.push({
      date,
      sleep_hours: day % 3 === 0 ? 5.5 : 7,
      stress_level: day % 4 === 0 ? 4 : 2,
      cycle_day: ((day - 20 + 28) % 28) + 1,
      cycle_phase: day <= 5 ? "Menstrual" : "Follicular",
    });

    if (day % 2 === 0) {
      symptomEntries.push(entry(date, "Headache", day % 4 === 0 ? 8 : 5));
    }
    if (day % 5 === 0) {
      symptomEntries.push(entry(date, "Fatigue", 4));
    }
  }

  return { symptomEntries, contextEntries };
}

const profile = buildProfile({ ...normaliseSurvey(NEW_USER_ANSWERS), status: SETUP_STATUS.COMPLETED });

describe("new user survey", () => {
  const answers = normaliseSurvey(NEW_USER_ANSWERS);

  it("accepts the minimum a real user would fill in", () => {
    expect(validateSurvey(NEW_USER_ANSWERS)).toEqual({});
    expect(answers.firstName).toBe("Priya");
  });

  it("holds the brief until the new user has logged enough days", () => {
    const access = buildAccess({
      onboarding: { ...answers, status: SETUP_STATUS.COMPLETED },
      symptomEntries: [],
    });

    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(false);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(false);

    // sparseDataset logs on every second day, so six days is three logged days.
    const { symptomEntries } = sparseDataset(MIN_DAYS_LOGGED * 2);
    const tracked = buildAccess({
      onboarding: { ...answers, status: SETUP_STATUS.COMPLETED },
      symptomEntries,
    });

    expect(tracked.features[FEATURE_IDS.BRIEF].unlocked).toBe(true);
    expect(tracked.features[FEATURE_IDS.PRACTICE].unlocked).toBe(true);
  });

  it("writes the concern as prose for the top of the brief", () => {
    const concern = composeConcern(answers);

    expect(concern).toContain("cannot tell what is setting them off");
    expect(concern).toContain("headache and fatigue");
  });

  it("builds a profile the rest of the app can greet", () => {
    expect(profile.displayName).toBe("Priya");
    expect(profile.isSample).toBe(false);
  });
});

describe("survey plus tracking plus analysis produces a brief", () => {
  for (const days of [1, 2, 3, 7, 14]) {
    it(`survives ${days} ${days === 1 ? "day" : "days"} of tracking`, () => {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });

      // Day 1 logs context but no symptom yet. That is not a brief.
      if (symptomEntries.length === 0) {
        expect(report.isEmpty).toBe(true);
        expect(report.context).toBeNull();
        expect(report.headline).toBeNull();
        return;
      }

      expect(report.isEmpty).toBe(false);
      expect(report.range.daysLogged).toBeGreaterThan(0);
      expect(report.coverage).not.toContain("NaN");
      expect(report.coverage).not.toContain("undefined");

      for (const symptom of report.symptoms) {
        expect(symptom.avgSeverity).toBeGreaterThan(0);
        expect(symptom.daysReported).toBeGreaterThan(0);
      }

      expect(report.experience).toHaveLength(report.symptoms.length);
      expect(report.gaps.length).toBeGreaterThan(0);
    });
  }

  it("renders every brief section without crashing at each size", () => {
    for (const days of [2, 3, 7, 14]) {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });
      expect(report.isEmpty).toBe(false);

      const sections = [
        [ExperiencingSection, { report, user: profile }],
        [NoticedSection, { report }],
        [GapsSection, { report }],
      ];

      for (const [Component, props] of sections) {
        const html = renderToStaticMarkup(createElement(Component, props));

        expect(html.length).toBeGreaterThan(0);
        expect(html).not.toContain("NaN");
        expect(html).not.toContain("undefined");
        expect(html).not.toContain("Infinity");
      }
    }
  });

  it("holds the language discipline across every size", () => {
    for (const days of [2, 3, 7, 14, 30]) {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });

      const copy = [
        ...report.experience,
        ...report.observations.flatMap((observation) => [
          observation.statement,
          observation.caveat,
          observation.ask,
        ]),
        ...report.gaps.flatMap((gap) => [gap.detail, gap.ask]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      for (const banned of [...CAUSAL_VERBS, ...DIAGNOSTIC_VERBS]) {
        expect(copy).not.toContain(banned);
      }
    }
  });

  it("generates fallback questions from the user's own brief", () => {
    const { symptomEntries, contextEntries } = sparseDataset(7);
    const report = buildReport({ symptomEntries, contextEntries, profile });
    const questions = buildFallbackQuestions(report);

    expect(questions.length).toBeGreaterThanOrEqual(5);

    for (const question of questions) {
      expect(question.text).not.toContain("NaN");
      expect(question.text).not.toContain("undefined");

      const copy = question.text.toLowerCase();
      for (const banned of [...CAUSAL_VERBS, ...DIAGNOSTIC_VERBS]) {
        expect(copy).not.toContain(banned);
      }
    }
  });

  it("reaches for a gap the brief flagged when generating questions", () => {
    const { symptomEntries, contextEntries } = sparseDataset(14);
    const report = buildReport({ symptomEntries, contextEntries, profile });
    const [gap] = report.gaps.filter((entry) => !entry.isClear);
    const questions = buildFallbackQuestions(report);

    expect(gap).toBeDefined();
    expect(questions.some((question) => question.text.includes(gap.detail))).toBe(true);
  });

  it("drives the rehearsal from the gaps the brief has not closed", () => {
    const { symptomEntries, contextEntries } = sparseDataset(14);
    const report = buildReport({ symptomEntries, contextEntries, profile });

    // The survey already answered "when did it start", so the script asks for a
    // memory rather than repeating what the brief prints.
    expect(fallbackReply(report, 1).reply).toContain("Your record starts on");

    // Impact is still an open gap, so the script asks for the one thing a
    // severity number cannot carry.
    expect(fallbackReply(report, 5).reply).toContain("worst day");
  });

  it("asks when it started when nothing in the record says", () => {
    const { symptomEntries, contextEntries } = sparseDataset(14);
    const report = buildReport({
      symptomEntries,
      contextEntries,
      profile: buildProfile({ ...normaliseSurvey({ ...NEW_USER_ANSWERS, firstNoticed: "" }), status: SETUP_STATUS.COMPLETED }),
    });

    expect(fallbackReply(report, 1).reply).toContain("roughly");
  });

  it("never puts a number from nowhere into a spoken line", () => {
    for (const days of [2, 7, 14]) {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });

      for (let turn = 0; turn < 7; turn += 1) {
        const reply = fallbackReply(report, turn).reply;

        expect(reply).not.toContain("NaN");
        expect(reply).not.toContain("undefined");
        expect(reply).not.toContain("Invalid Date");
      }
    }
  });
});