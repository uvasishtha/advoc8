import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/analytics";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES } from "@/lib/seed/maya";

const report = buildReport({
  symptomEntries: MOCK_SYMPTOM_ENTRIES,
  contextEntries: MOCK_CONTEXT_ENTRIES,
});

describe("deterministic seed data", () => {
  it("produces an identical report on every run", () => {
    const again = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
    });

    expect(JSON.stringify(again)).toBe(JSON.stringify(report));
  });

  it("covers September 2026 for Maya R", () => {
    expect(report.range.start).toBe("2026-09-01");
    expect(report.range.end).toBe("2026-09-30");
    expect(report.range.totalDays).toBe(30);
    expect(report.range.daysWithContext).toBe(30);
    expect(report.range.entryCount).toBeGreaterThan(40);
  });
});

describe("range day counts", () => {
  const symptomDays = new Set(MOCK_SYMPTOM_ENTRIES.map((entry) => entry.date));
  const contextDays = new Set(MOCK_CONTEXT_ENTRIES.map((entry) => entry.date));

  it("counts days reported as days with a symptom, not days with context", () => {
    expect(report.range.daysLogged).toBe(symptomDays.size);
    expect(report.range.daysLogged).toBeLessThan(report.range.totalDays);
  });

  it("reports context coverage separately", () => {
    expect(report.range.daysWithContext).toBe(contextDays.size);
  });

  it("describes both counts in the coverage sentence", () => {
    expect(report.coverage).toContain(`${report.range.daysLogged} of the 30 days`);
    expect(report.coverage).toContain(`alongside on ${report.range.daysWithContext} days`);
  });

  it("does not report a day the user recorded nothing on", () => {
    for (const day of report.timeline) {
      const hasSymptom = symptomDays.has(day.date);
      const hasContext = contextDays.has(day.date);

      if (!hasSymptom) expect(day.entries).toHaveLength(0);
      if (!hasContext) expect(day.context).toBeNull();
    }
  });
});

describe("symptom statistics", () => {
  it("reports frequency, average and maximum severity from stored rows", () => {
    const headache = report.symptoms.find((symptom) => symptom.name === "Headache");
    expect(headache).toBeDefined();

    const source = MOCK_SYMPTOM_ENTRIES.filter((entry) => entry.symptom === "Headache");
    const expectedAverage = source.reduce((sum, entry) => sum + entry.severity, 0) / source.length;

    expect(headache.entryCount).toBe(source.length);
    expect(headache.avgSeverity).toBeCloseTo(expectedAverage, 5);
    expect(headache.maxSeverity).toBe(Math.max(...source.map((entry) => entry.severity)));
    expect(headache.daysReported).toBe(new Set(source.map((entry) => entry.date)).size);
  });

  it("never reports a day the user did not record", () => {
    const fatigue = report.symptoms.find((symptom) => symptom.name === "Fatigue");
    const recordedDays = new Set(
      MOCK_SYMPTOM_ENTRIES.filter((entry) => entry.symptom === "Fatigue").map((entry) => entry.date),
    );

    for (const day of fatigue.dailySeries) {
      if (!recordedDays.has(day.date)) expect(day.severity).toBeNull();
      else expect(typeof day.severity).toBe("number");
    }
  });

  it("splits the period into two comparable halves", () => {
    for (const symptom of report.symptoms) {
      const { firstHalf, secondHalf } = symptom.halves;
      expect(firstHalf.days + secondHalf.days).toBe(report.range.totalDays);
      expect(firstHalf.endDate < secondHalf.startDate).toBe(true);
    }
  });
});

describe("co-occurrence wording", () => {
  it("states counts and never claims a cause", () => {
    expect(report.patterns.length).toBeGreaterThan(0);

    for (const pattern of report.patterns) {
      expect(pattern.statement).toMatch(/was logged on \d+ of the \d+ days?/);
      expect(pattern.observation).toContain("Observed pattern:");
      expect(pattern.observation).toContain("not a medical finding");

      for (const banned of ["caused", "due to", "because of", "resulted in", "led to"]) {
        expect(pattern.statement.toLowerCase()).not.toContain(banned);
        expect(pattern.observation.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it("only surfaces factors with enough supporting days", () => {
    for (const pattern of report.patterns) {
      expect(pattern.factorDays).toBeGreaterThanOrEqual(4);
      expect(pattern.symptomDaysInFactor).toBeGreaterThanOrEqual(2);
      expect(pattern.factorRate).toBeLessThanOrEqual(1);
    }
  });
});

describe("empty input", () => {
  it("degrades without throwing", () => {
    const empty = buildReport({});
    expect(empty.isEmpty).toBe(true);
    expect(empty.symptoms).toEqual([]);
    expect(empty.patterns).toEqual([]);
    expect(empty.comparisons).toEqual([]);
    expect(empty.headline).toBeNull();
  });
});

// Six days of short sleep, all with a headache logged at 8 or 9. Six days of
// 7h sleep, all with a headache logged at 3 or 4. Every number below is
// readable off this fixture by hand.
const CONTRAST_SYMPTOMS = [
  ...["01", "02", "03", "04", "05", "06"].flatMap((day) => [
    { id: `s-${day}-a`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "02" ? 9 : 8 },
    { id: `s-${day}-b`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "02" ? 7 : 6 },
  ]),
  ...["07", "08", "09", "10", "11", "12"].flatMap((day) => [
    { id: `s-${day}-a`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "09" ? 4 : 3 },
    { id: `s-${day}-b`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "09" ? 2 : 1 },
  ]),
];

const CONTRAST_CONTEXT = [...["01", "02", "03", "04", "05", "06"].map((day) => ({
  date: `2026-01-${day}`,
  sleep_hours: 5,
  stress_level: 4,
})), ...["07", "08", "09", "10", "11", "12"].map((day) => ({
  date: `2026-01-${day}`,
  sleep_hours: 7,
  stress_level: 2,
}))];

const contrast = buildReport({ symptomEntries: CONTRAST_SYMPTOMS, contextEntries: CONTRAST_CONTEXT });
const sleepComparison = contrast.comparisons.find((item) => item.factorId === "low_sleep");

describe("measured comparisons", () => {
  it("splits the days into factor days and the days that are not factor days", () => {
    expect(sleepComparison.daysWithFactor).toBe(6);
    expect(sleepComparison.daysOutsideFactor).toBe(6);
    expect(sleepComparison.symptomDaysWithFactor).toBe(6);
    expect(sleepComparison.symptomDaysOutsideFactor).toBe(6);
  });

  it("averages severity per day, so a day with two entries does not count twice", () => {
    // Short-sleep days: 7, 8, 7, 7, 7, 7 -> 7.17. Long-sleep days: 2, 2, 3, 2, 2, 2 -> 2.17.
    expect(sleepComparison.severityWithFactor.average).toBeCloseTo(43 / 6, 5);
    expect(sleepComparison.severityOutsideFactor.average).toBeCloseTo(13 / 6, 5);
    expect(sleepComparison.severityDelta).toBeCloseTo(5, 5);
  });

  it("reports the frequency gap against the complementary group", () => {
    expect(sleepComparison.factorRate).toBe(1);
    expect(sleepComparison.outsideRate).toBe(1);
    expect(sleepComparison.rateDelta).toBe(0);
  });

  it("marks a gap large enough to be worth the reader's attention", () => {
    expect(sleepComparison.severityDiffers).toBe(true);
    expect(sleepComparison.differsFromBaseline).toBe(true);
    expect(sleepComparison.frequencyDiffers).toBe(false);
  });

  it("leaves days out when the factor cannot be measured on them", () => {
    const withBlank = buildReport({
      symptomEntries: CONTRAST_SYMPTOMS,
      contextEntries: [
        ...CONTRAST_CONTEXT,
        // No sleep value, so this day belongs to neither group.
        { date: "2026-01-13", sleep_hours: null, stress_level: 2 },
      ],
    });
    const comparison = withBlank.comparisons.find((item) => item.factorId === "low_sleep");

    expect(comparison.daysWithFactor + comparison.daysOutsideFactor).toBe(12);
  });

  it("hides comparisons until both groups have enough days", () => {
    const thin = buildReport({
      symptomEntries: CONTRAST_SYMPTOMS.filter((entry) => !entry.date.endsWith("-11")),
      contextEntries: CONTRAST_CONTEXT.filter((entry) => !entry.date.endsWith("-11")),
    });

    for (const item of thin.comparisons) {
      if (item.hasSeverityData) {
        expect(item.severityWithFactor.days).toBeGreaterThanOrEqual(3);
        expect(item.severityOutsideFactor.days).toBeGreaterThanOrEqual(3);
      }

      if (item.hasFrequencyData) {
        expect(item.daysWithFactor).toBeGreaterThanOrEqual(3);
        expect(item.daysOutsideFactor).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("surfaces a comparable number of differences for the sample user", () => {
    expect(report.comparisons.length).toBeGreaterThan(0);
    expect(report.comparisons.length).toBeLessThanOrEqual(4);
    expect(report.comparisons.some((item) => item.severityDiffers)).toBe(true);
  });

  it("reports numbers the reader can check, and never a cause", () => {
    for (const item of report.comparisons) {
      expect(item.symptom).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.complementLabel).toBeTruthy();

      const copy = [item.headline, item.severitySentence, item.frequencySentence, item.caveat]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      for (const banned of ["caused", "due to", "because of", "result of", "led to", "triggered by", "triggers"]) {
        expect(copy).not.toContain(banned);
      }
    }
  });

  it("states both group averages and the gap between them", () => {
    expect(sleepComparison.severitySentence).toMatch(
      /Average headache severity was \d+(\.\d+)? \/ 10 on the 6 days you recorded fewer than 6 hours of sleep, and \d+(\.\d+)? \/ 10 on the other 6 days you recorded 6 hours of sleep or more — 5 points higher on short sleep days\./,
    );
    expect(sleepComparison.caveat).toContain("not a medical finding");
  });

  // The card and the PDF both render from these flags, so a metric has to be
  // withheld from the prose and from the numbers at the same time. Otherwise a
  // two-day group gets a bar chart it did not earn.
  it("gates each metric's prose and its numbers on the same flag", () => {
    for (const item of report.comparisons) {
      expect(item.severitySentence != null).toBe(item.hasSeverityData);
      expect(item.frequencySentence != null).toBe(item.hasFrequencyData);
      expect(item.headline).not.toBeNull();
    }

    const thin = buildReport({
      symptomEntries: CONTRAST_SYMPTOMS.filter((entry) => entry.date.endsWith("-01")),
      contextEntries: CONTRAST_CONTEXT.filter((entry) => entry.date.endsWith("-01")),
    });

    expect(thin.comparisons).toEqual([]);
  });
});

if (process.env.PRINT_REPORT) {
  console.log(JSON.stringify(report.headline, null, 2));
  console.log(
    report.symptoms
      .map(
        (s) =>
          `${s.name.padEnd(14)} ${String(s.daysReported).padStart(2)} days  avg ${String(
            s.avgSeverity?.toFixed(1),
          ).padStart(4)}  max ${s.maxSeverity}  ${s.trend}`,
      )
      .join("\n"),
  );
  console.log("\nPATTERNS");
  for (const pattern of report.patterns) console.log("-", pattern.statement);
  console.log("\nCOMPARISONS");
  for (const item of report.comparisons) {
    console.log(`- [${item.symptom} x ${item.shortLabel}] strength=${item.strength.toFixed(2)}`);
    if (item.severitySentence) console.log("   ", item.severitySentence);
    if (item.frequencySentence) console.log("   ", item.frequencySentence);
  }
  console.log("\nPAIRS");
  for (const pair of report.symptomPairs) console.log("-", pair.statement);
}