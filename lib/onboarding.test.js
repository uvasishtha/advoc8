import { describe, expect, it } from "vitest";
import {
  EMPTY_ONBOARDING,
  FEATURE_IDS,
  MIN_ENTRIES_FOR_PRACTICE,
  SAMPLE_ONBOARDING,
  SETUP_STATUS,
  buildAccess,
  buildProfile,
  composeConcern,
  normaliseSurvey,
  validateSurvey,
} from "@/lib/onboarding";

const MINIMAL = { firstName: "Jordan", concern: "Dizziness after standing up." };
const ENTRIES = (count) =>
  Array.from({ length: count }, (unused, index) => ({
    id: `sym-${index}`,
    date: "2026-09-0${index + 1}",
    symptom: "Dizziness",
    severity: 5,
  }));

describe("survey validation", () => {
  it("needs a name and a concern, and nothing else", () => {
    expect(Object.keys(validateSurvey(EMPTY_ONBOARDING)).sort()).toEqual([
      "concern",
      "firstName",
    ]);
    expect(validateSurvey(MINIMAL)).toEqual({});
  });

  it("asks for wording when Other is picked", () => {
    const errors = validateSurvey({ ...MINIMAL, symptoms: ["Headache", "Other"] });
    expect(errors.otherSymptom).toBeTruthy();

    expect(
      validateSurvey({ ...MINIMAL, symptoms: ["Headache", "Other"], otherSymptom: "Ear pressure" }),
    ).toEqual({});
  });

  it("requires both cycle answers when cycle tracking is on", () => {
    const errors = validateSurvey({ ...MINIMAL, tracksCycle: true });
    expect(Object.keys(errors).sort()).toEqual(["cycleLength", "lastPeriodStart"]);

    expect(
      validateSurvey({
        ...MINIMAL,
        tracksCycle: true,
        cycleLength: "28",
        lastPeriodStart: "2026-09-02",
      }),
    ).toEqual({});
  });

  it("rejects a cycle length outside the possible range", () => {
    expect(
      validateSurvey({
        ...MINIMAL,
        tracksCycle: true,
        cycleLength: "4",
        lastPeriodStart: "2026-09-02",
      }).cycleLength,
    ).toBeTruthy();
  });

  it("drops cycle answers when tracking was declined", () => {
    const clean = normaliseSurvey({
      ...MINIMAL,
      tracksCycle: false,
      cycleLength: "28",
      lastPeriodStart: "2026-09-02",
    });

    expect(clean.cycleLength).toBe("");
    expect(clean.lastPeriodStart).toBe("");
  });

  it("the sample profile is a valid completed profile", () => {
    expect(SAMPLE_ONBOARDING.status).toBe(SETUP_STATUS.COMPLETED);
    expect(validateSurvey(SAMPLE_ONBOARDING)).toEqual({});
  });
});

describe("profile composition", () => {
  it("writes the survey answers as prose for the brief", () => {
    const concern = composeConcern(
      normaliseSurvey({
        ...MINIMAL,
        firstNoticed: "last-month",
        symptoms: ["Headache", "Fatigue"],
        dayToDay: "significant",
      }),
    );

    expect(concern).toContain("Dizziness after standing up.");
    expect(concern).toContain("Symptoms I am tracking: headache and fatigue.");
    expect(concern).toContain("I first noticed it in the last month.");
    expect(concern).toContain("significant impact");
  });

  it("keeps Maya's own wording intact", () => {
    const profile = buildProfile(SAMPLE_ONBOARDING);
    expect(profile.firstName).toBe("Maya");
    expect(profile.greeting).toBe("Welcome back, Maya");
    expect(profile.concern.startsWith("Headaches and fatigue have been showing up")).toBe(true);
    expect(profile.email).toBe("maya.r@example.com");
  });

  it("falls back gracefully for a user who skipped setup", () => {
    const profile = buildProfile({ ...EMPTY_ONBOARDING, status: SETUP_STATUS.SKIPPED });
    expect(profile.firstName).toBe("");
    expect(profile.displayName).toBe("Your profile");
    expect(profile.email).toBeNull();
    expect(profile.tracksCycle).toBe(false);
  });
});

describe("feature access", () => {
  it("locks everything except tracking while setup is unfinished", () => {
    for (const status of [SETUP_STATUS.PENDING, SETUP_STATUS.SKIPPED]) {
      const access = buildAccess({
        onboarding: { ...EMPTY_ONBOARDING, status },
        symptomEntries: ENTRIES(10),
      });

      expect(access.needsSetup).toBe(true);
      expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(false);
      expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(false);
    }
  });

  it("explains what setup is required", () => {
    const access = buildAccess({ onboarding: { ...EMPTY_ONBOARDING, status: SETUP_STATUS.SKIPPED } });

    expect(access.features[FEATURE_IDS.BRIEF].message).toBe(
      "Complete your setup to build your Evidence Brief.",
    );
    expect(access.features[FEATURE_IDS.PRACTICE].message).toBe(
      "Complete your setup and log something before practising.",
    );
    expect(access.features[FEATURE_IDS.BRIEF].action).toEqual({
      label: "Complete Setup",
      href: "/setup",
    });
  });

  it("unlocks the brief from setup alone, with no tracking required", () => {
    const access = buildAccess({ onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED } });

    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(true);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(false);
    expect(access.features[FEATURE_IDS.PRACTICE].message).toBe(
      "Log a symptom or two first, so there is something to practise explaining.",
    );
  });

  it("unlocks practice once enough has been tracked", () => {
    const access = buildAccess({
      onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED },
      symptomEntries: ENTRIES(MIN_ENTRIES_FOR_PRACTICE),
    });

    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(true);
  });

  it("never locks symptom tracking", () => {
    const access = buildAccess({ onboarding: EMPTY_ONBOARDING, symptomEntries: [] });

    expect(access.features.tracking ?? null).toBeNull();
    expect(access.trackingEntries).toBe(0);
  });
});