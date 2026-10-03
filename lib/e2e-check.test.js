import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildReport } from "@/lib/analytics";
import { buildDoctorSummary } from "@/lib/doctor-summary";
import {
  buildAccess,
  buildProfile,
  composeConcern,
  FEATURE_IDS,
  normaliseSurvey,
  SETUP_STATUS,
  validateSurvey,
} from "@/lib/onboarding";
import { buildFallbackQuestions } from "@/lib/ai/gemini";
import { ComparisonCard } from "@/components/brief/ComparisonCard";
import {
  ChangesSection,
  ComparisonsSection,
  OverviewSection,
  PatternsSection,
  TimelineSection,
  TrendsSection,
} from "@/components/brief/ReportSections";
import { DoctorSummary } from "@/components/brief/DoctorSummary";

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

describe("new user survey", () => {
  const answers = normaliseSurvey(NEW_USER_ANSWERS);

  it("accepts the minimum a real user would fill in", () => {
    expect(validateSurvey(NEW_USER_ANSWERS)).toEqual({});
    expect(answers.firstName).toBe("Priya");
  });

  it("unlocks the brief once setup is complete", () => {
    const access = buildAccess({
      onboarding: { ...answers, status: SETUP_STATUS.COMPLETED },
      symptomEntries: [],
    });

    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(true);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(false);
  });

  it("writes the concern as prose for the top of the brief", () => {
    const concern = composeConcern(answers);

    expect(concern).toContain("cannot tell what is setting them off");
    expect(concern).toContain("headache and fatigue");
  });

  it("builds a profile the rest of the app can greet", () => {
    const profile = buildProfile({ ...answers, status: SETUP_STATUS.COMPLETED });

    expect(profile.displayName).toBe("Priya");
    expect(profile.isSample).toBe(false);
  });
});

describe("survey plus tracking plus analysis produces a report", () => {
  const profile = buildProfile({ ...normaliseSurvey(NEW_USER_ANSWERS), status: SETUP_STATUS.COMPLETED });

  for (const days of [1, 2, 3, 7, 14]) {
    it(`survives ${days} ${days === 1 ? "day" : "days"} of tracking`, () => {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });

      expect(report.isEmpty).toBe(false);
      expect(report.range.daysLogged).toBeGreaterThan(0);
      expect(report.coverage).not.toContain("NaN");
      expect(report.coverage).not.toContain("undefined");

      for (const symptom of report.symptoms) {
        expect(symptom.avgSeverity).toBeGreaterThan(0);
        expect(symptom.daysReported).toBeGreaterThan(0);
        expect(symptom.changeSentence ?? symptom.caveat).toBeTruthy();
      }

      const html = renderToStaticMarkup(
        createElement(OverviewSection, { report, user: profile }),
      );
      expect(html).not.toContain("NaN");

      const summary = buildDoctorSummary({ report, user: profile, draft: {} });
      expect(summary).toBeTruthy();
    });
  }

  it("renders every brief section without crashing at each size", () => {
    for (const days of [1, 3, 7, 14]) {
      const { symptomEntries, contextEntries } = sparseDataset(days);
      const report = buildReport({ symptomEntries, contextEntries, profile });
      const props = { report, user: profile };

      for (const Section of [
        TimelineSection,
        TrendsSection,
        PatternsSection,
        ComparisonsSection,
        ChangesSection,
      ]) {
        const html = renderToStaticMarkup(createElement(Section, props));
        expect(html.length).toBeGreaterThan(0);
        expect(html).not.toContain("NaN");
        expect(html).not.toContain("undefined");
      }
    }
  });

  it("generates fallback questions from the user's own numbers", () => {
    const { symptomEntries, contextEntries } = sparseDataset(7);
    const report = buildReport({ symptomEntries, contextEntries, profile });
    const questions = buildFallbackQuestions(report);

    expect(questions.length).toBeGreaterThanOrEqual(5);

    for (const question of questions) {
      expect(question.text).not.toContain("NaN");
      expect(question.text).not.toContain("undefined");
      expect(question.text.toLowerCase()).not.toContain("headaches you have");
    }
  });

  it("shows a real comparison once there are enough days on both sides", () => {
    const { symptomEntries, contextEntries } = sparseDataset(14);
    const report = buildReport({ symptomEntries, contextEntries, profile });

    for (const comparison of report.comparisons) {
      const html = renderToStaticMarkup(createElement(ComparisonCard, { comparison }));
      expect(html).not.toContain("NaN");
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("Infinity");
    }
  });
});