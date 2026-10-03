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
    expect(report.range.daysLogged).toBe(30);
    expect(report.range.entryCount).toBeGreaterThan(40);
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
    expect(empty.headline).toBeNull();
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
  console.log("\nPAIRS");
  for (const pair of report.symptomPairs) console.log("-", pair.statement);
}