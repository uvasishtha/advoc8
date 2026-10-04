import { describe, expect, it } from "vitest";
import {
  EMPTY_ONBOARDING,
  FEATURE_IDS,
  MIN_DAYS_LOGGED,
  SAMPLE_ONBOARDING,
  SETUP_STATUS,
  buildAccess,
  buildProfile,
  composeConcern,
  countLoggedDays,
  normaliseSurvey,
  validateSurvey,
} from "@/lib/onboarding";

const MINIMAL = { firstName: "Jordan", concern: "Dizziness after standing up." };
/** `count` entries, all on their own day. */
const ENTRIES = (count) =>
  Array.from({ length: count }, (unused, index) => ({
    id: `sym-${index}`,
    date: `2026-09-${String(index + 1).padStart(2, "0")}`,
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
  it("holds the brief and the rehearsal until enough days are logged", () => {
    const access = buildAccess({
      onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED },
      symptomEntries: ENTRIES(MIN_DAYS_LOGGED - 1),
    });

    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(false);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(false);
    expect(access.needsTracking).toBe(true);
  });

  it("counts days, not entries", () => {
    // One bad afternoon logged three times is not a record.
    const sameDay = ENTRIES(6).map((entry, index) => ({ ...entry, id: `sym-${index}`, date: "2026-09-01" }));
    const access = buildAccess({
      onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED },
      symptomEntries: sameDay,
    });

    expect(countLoggedDays(sameDay)).toBe(1);
    expect(access.daysLogged).toBe(1);
    expect(access.trackingEntries).toBe(6);
    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(false);
  });

  it("opens both together on the third logged day", () => {
    const access = buildAccess({
      onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED },
      symptomEntries: ENTRIES(MIN_DAYS_LOGGED),
    });

    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(true);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(true);
    expect(access.needsTracking).toBe(false);
  });

  it("says how many days are still missing, and sends them to track", () => {
    const access = buildAccess({
      onboarding: { ...MINIMAL, status: SETUP_STATUS.COMPLETED },
      symptomEntries: ENTRIES(1),
    });

    expect(access.features[FEATURE_IDS.BRIEF].message).toBe(
      "Log symptoms on 2 more days and your Evidence Brief opens.",
    );
    expect(access.features[FEATURE_IDS.PRACTICE].message).toBe(
      "Log symptoms on 2 more days and you can rehearse your conversation.",
    );
    expect(access.features[FEATURE_IDS.BRIEF].action).toEqual({
      label: "Log a symptom",
      href: "/track",
    });
  });

  it("opens everything for someone who skipped, because the sample month is already deep", () => {
    const access = buildAccess({
      onboarding: { ...SAMPLE_ONBOARDING, status: SETUP_STATUS.SKIPPED },
      symptomEntries: ENTRIES(12),
    });

    expect(access.needsSetup).toBe(true);
    expect(access.features[FEATURE_IDS.BRIEF].unlocked).toBe(true);
    expect(access.features[FEATURE_IDS.PRACTICE].unlocked).toBe(true);
  });

  it("never locks symptom tracking", () => {
    const access = buildAccess({ onboarding: EMPTY_ONBOARDING, symptomEntries: [] });

    expect(access.features.tracking ?? null).toBeNull();
    expect(access.trackingEntries).toBe(0);
    expect(access.daysLogged).toBe(0);
  });
});

describe("what have you noticed?", () => {
  it("is optional", () => {
    expect(normaliseSurvey(MINIMAL).possibleFactors).toEqual([]);
    expect(validateSurvey(MINIMAL)).toEqual({});
  });

  it("keeps known options and drops anything else", () => {
    const clean = normaliseSurvey({
      ...MINIMAL,
      possibleFactors: ["sleep", "stress", "not-a-real-factor"],
    });

    expect(clean.possibleFactors).toEqual(["sleep", "stress"]);
  });

  it("asks for wording only when Other is picked", () => {
    expect(validateSurvey({ ...MINIMAL, possibleFactors: ["other"] }).otherFactor).toBeTruthy();

    expect(
      validateSurvey({ ...MINIMAL, possibleFactors: ["other"], otherFactor: "Long flights" }),
    ).toEqual({});
  });

  it("drops the Other wording when Other is deselected", () => {
    const clean = normaliseSurvey({
      ...MINIMAL,
      possibleFactors: ["sleep"],
      otherFactor: "Long flights",
    });

    expect(clean.otherFactor).toBe("");
  });

  it("reaches the profile for later pattern detection", () => {
    const profile = buildProfile({ ...MINIMAL, possibleFactors: ["sleep", "cycle"] });

    expect(profile.possibleFactors).toEqual(["sleep", "cycle"]);
  });
});

describe("cycle relevance", () => {
  it("only demands cycle details for an explicit yes", () => {
    expect(validateSurvey({ ...MINIMAL, cycleRelevance: "yes" })).toEqual({
      cycleLength: "Pick the length of a typical cycle.",
      lastPeriodStart: "Add the day your last period started.",
    });

    // The honest "I don't know yet" must stay answerable on its own.
    expect(validateSurvey({ ...MINIMAL, cycleRelevance: "unsure" })).toEqual({});
    expect(validateSurvey({ ...MINIMAL, cycleRelevance: "no" })).toEqual({});
  });

  it("turns a yes into the legacy boolean the rest of the app reads", () => {
    const clean = normaliseSurvey({
      ...MINIMAL,
      cycleRelevance: "yes",
      cycleLength: "28",
      lastPeriodStart: "2026-09-02",
    });

    expect(clean.tracksCycle).toBe(true);
    expect(clean.cycleLength).toBe("28");
    expect(buildProfile(clean).tracksCycle).toBe(true);
  });

  it("clears cycle details for unsure and for no", () => {
    for (const cycleRelevance of ["unsure", "no"]) {
      const clean = normaliseSurvey({
        ...MINIMAL,
        cycleRelevance,
        cycleLength: "28",
        lastPeriodStart: "2026-09-02",
      });

      expect(clean.tracksCycle).toBe(false);
      expect(clean.cycleLength).toBe("");
      expect(clean.lastPeriodStart).toBe("");
    }
  });

  it("still reads a profile saved before cycleRelevance existed", () => {
    const clean = normaliseSurvey({
      ...MINIMAL,
      tracksCycle: true,
      cycleLength: "28",
      lastPeriodStart: "2026-09-02",
    });

    expect(clean.tracksCycle).toBe(true);
    expect(clean.cycleLength).toBe("28");
    // Nothing to show in a three-way control, so it stays empty rather than
    // being invented from the boolean.
    expect(clean.cycleRelevance).toBe("");
    expect(buildProfile(clean).tracksCycle).toBe(true);
  });

  it("prefers cycleRelevance when a record somehow has both", () => {
    const clean = normaliseSurvey({ ...MINIMAL, cycleRelevance: "no", tracksCycle: true });

    expect(clean.tracksCycle).toBe(false);
  });
});