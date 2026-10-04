import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/analytics";
import { CAUSAL_VERBS, DIAGNOSTIC_VERBS } from "@/lib/analytics/language";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES } from "@/lib/seed/maya";

const report = buildReport({
  symptomEntries: MOCK_SYMPTOM_ENTRIES,
  contextEntries: MOCK_CONTEXT_ENTRIES,
  statement: "These symptoms have been getting worse rather than better.",
});

/** Every sentence the brief can put in front of a reader. */
function generatedCopy(next) {
  return [
    ...next.experience,
    ...next.observations.flatMap((observation) => [
      observation.statement,
      observation.caveat,
      observation.ask,
    ]),
    ...next.gaps.flatMap((gap) => [gap.detail, gap.ask]),
    next.coverage,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

describe("deterministic seed data", () => {
  it("produces an identical report on every run", () => {
    const again = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
      statement: "These symptoms have been getting worse rather than better.",
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
});

describe("severity across the period", () => {
  it("covers every day in the range, including days with nothing logged", () => {
    for (const symptom of report.symptoms) {
      expect(symptom.dailySeries).toHaveLength(report.range.totalDays);
      expect(symptom.dailySeries[0].date).toBe(report.range.start);
      expect(symptom.dailySeries.at(-1).date).toBe(report.range.end);
    }
  });

  it("leaves unlogged days null rather than interpolating them", () => {
    const headache = report.symptoms.find((symptom) => symptom.name === "Headache");
    const blank = headache.dailySeries.filter((day) => day.severity === null);

    expect(blank.length).toBeGreaterThan(0);
    expect(blank.length).toBe(report.range.totalDays - headache.daysReported);
  });

  it("collapses several entries on one day to the worst severity recorded", () => {
    const days = ["2026-09-01", "2026-09-02", "2026-09-03"];
    const series = severityOverTime(
      [
        { date: "2026-09-01", severity: 3 },
        { date: "2026-09-01", severity: 7 },
        { date: "2026-09-03", severity: 5 },
      ],
      days,
    );

    expect(series.map((day) => day.severity)).toEqual([7, null, 5]);
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

  it("reads as a sentence per symptom rather than a table of metrics", () => {
    expect(report.experience).toHaveLength(report.symptoms.length);

    const lead = report.experience[0];
    expect(lead).toContain(report.symptoms[0].name);
    expect(lead).toContain(`recorded on ${report.symptoms[0].daysReported} of 30 days`);
  });

  it("splits the period into two comparable halves", () => {
    for (const symptom of report.symptoms) {
      const { firstHalf, secondHalf } = symptom.halves;
      expect(firstHalf.days + secondHalf.days).toBe(report.range.totalDays);
      expect(firstHalf.endDate < secondHalf.startDate).toBe(true);
    }
  });
});

// Twelve days. Every one of the six short-sleep days has a severe headache and
// every one of the six good-sleep days has a mild one, so the gap in the
// fixture is entirely about severity. `CONTRAST_SPARSE` drops the entries on
// half the good-sleep days, which turns the same fixture into a frequency gap.
const CONTRAST_SYMPTOMS = [
  ...["01", "02", "03", "04", "05", "06"].flatMap((day) => [
    { id: `s-${day}-a`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "02" ? 9 : 8, duration_minutes: 120, notes: "note" },
    { id: `s-${day}-b`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "02" ? 7 : 6, duration_minutes: 120, notes: "note" },
  ]),
  ...["07", "08", "09", "10", "11", "12"].flatMap((day) => [
    { id: `s-${day}-a`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "09" ? 4 : 3, duration_minutes: 120, notes: "note" },
    { id: `s-${day}-b`, date: `2026-01-${day}`, symptom: "Headache", severity: day === "09" ? 2 : 1, duration_minutes: 120, notes: "note" },
  ]),
];

const CONTRAST_CONTEXT = [
  ...["01", "02", "03", "04", "05", "06"].map((day) => ({
    date: `2026-01-${day}`,
    sleep_hours: 5,
    stress_level: 4,
  })),
  ...["07", "08", "09", "10", "11", "12"].map((day) => ({
    date: `2026-01-${day}`,
    sleep_hours: 7,
    stress_level: 2,
  })),
];

const contrast = buildReport({ symptomEntries: CONTRAST_SYMPTOMS, contextEntries: CONTRAST_CONTEXT });

// Headache on all six short-sleep days, but on only three of the six good-sleep
// days: 100% against 50%, which clears the bar the brief applies.
const CONTRAST_SPARSE = CONTRAST_SYMPTOMS.filter((entry) => !["10", "11", "12"].includes(entry.date.slice(-2)));
const sparse = buildReport({ symptomEntries: CONTRAST_SPARSE, contextEntries: CONTRAST_CONTEXT });

describe("what I've noticed", () => {
  it("shows a short list rather than every calculation", () => {
    expect(report.observations.length).toBeGreaterThan(0);
    expect(report.observations.length).toBeLessThanOrEqual(4);
  });

  it("ranks the strongest observation first", () => {
    // Maya's seed data has symptoms that climb across the month, so a change
    // over time is the single most useful thing she can raise.
    expect(report.observations[0].kind).toBe("persistence");
  });

  it("gives every observation a headline and a statement", () => {
    for (const observation of report.observations) {
      expect(observation.title).toBeTruthy();
      expect(observation.statement).toBeTruthy();
    }
  });

  it("reports a context pattern with the numbers on both sides", () => {
    const context = report.observations.find((observation) => observation.kind === "context");

    expect(context).toBeDefined();
    expect(context.statement).toMatch(/showed up on \d+ of the \d+ days? you recorded/);
    expect(context.statement).toMatch(/of the other days you tracked/);
  });

  it("disclaims a context pattern instead of implying a cause", () => {
    const context = report.observations.find((observation) => observation.kind === "context");

    expect(context.caveat).toMatch(/does not show that/);
    expect(context.caveat).toMatch(/not an explanation/);
    expect(context.ask).toMatch(/Worth asking whether/);
  });

  it("keeps the count and the suggestion in the same observation", () => {
    // The caveat without the count is alarmist, and the count without the
    // suggestion leaves the reader with nothing to do about it.
    const context = report.observations.find((observation) => observation.kind === "context");

    expect(context.statement).toContain("showed up");
    expect(context.caveat).toBeTruthy();
    expect(context.ask).toBeTruthy();
  });

  it("finds the short-sleep pattern when the gap is there to find", () => {
    const shortSleep = sparse.observations.find(
      (observation) => observation.kind === "context" && observation.statement.includes("fewer than 6 hours of sleep"),
    );

    expect(shortSleep).toBeDefined();
    expect(shortSleep.statement).toContain("showed up on 6 of the 6 days");
    expect(shortSleep.statement).toContain("50% of the other days you tracked");
  });

  it("withholds a context pattern when the symptom appears just as often either way", () => {
    // Every one of the twelve days in this fixture has a headache logged, so
    // there is no frequency gap to report even though severity differs sharply.
    expect(contrast.observations.some((observation) => observation.kind === "context")).toBe(false);
  });

  it("reports no context pattern when both sides look the same", () => {
    const flat = buildReport({
      symptomEntries: CONTRAST_SYMPTOMS.map((entry) => ({ ...entry, severity: 5 })),
      contextEntries: CONTRAST_CONTEXT,
    });

    expect(flat.observations.some((observation) => observation.kind === "context")).toBe(false);
  });

  it("withholds observations entirely from a single entry", () => {
    const one = buildReport({
      symptomEntries: [{ id: "s-1", date: "2026-01-01", symptom: "Headache", severity: 5 }],
      contextEntries: [{ date: "2026-01-01", sleep_hours: 5, stress_level: 3 }],
    });

    expect(one.isEmpty).toBe(false);
    expect(one.observations.every((observation) => observation.kind !== "context")).toBe(true);
  });

  it("reports the longest unbroken run rather than the frequency count alone", () => {
    const run = [
      "2026-01-05",
      "2026-01-06",
      "2026-01-07",
      "2026-01-08",
      "2026-01-20",
    ].map((date, index) => ({
      id: `s-${index}`,
      date,
      symptom: "Fatigue",
      severity: 5,
      duration_minutes: 90,
      notes: "note",
    }));

    const built = buildReport({ symptomEntries: run, contextEntries: run });
    const persistence = built.observations.find((observation) => observation.kind === "persistence");

    expect(persistence.statement).toContain("4 days");
    expect(persistence.statement).toContain("Jan 5–Jan 8");
  });
});

describe("make sure I mention", () => {
  it("opens the gaps a complete profile still leaves", () => {
    const ids = report.gaps.map((gap) => gap.id);

    // Maya's seed data fills in every field the tracker offers and restores a
    // statement, so what is left open is only what no log can capture.
    expect(ids).not.toContain("notes");
    expect(ids).not.toContain("duration");
    expect(ids).not.toContain("context");
    expect(ids).not.toContain("ongoing");
    expect(ids).not.toContain("statement");
    expect(ids).toContain("start");
  });

  it("asks for the thing that is missing, not for more data", () => {
    for (const gap of report.gaps) {
      expect(gap.id).not.toBe("notes");
      expect(gap.detail).toBeTruthy();
      expect(gap.ask).toBeTruthy();
    }
  });

  it("reports a gap for every field the record leaves open", () => {
    const thin = buildReport({
      symptomEntries: [
        { id: "s-1", date: "2026-01-05", symptom: "Fatigue", severity: 5 },
        { id: "s-2", date: "2026-01-06", symptom: "Fatigue", severity: 5 },
        { id: "s-3", date: "2026-01-07", symptom: "Fatigue", severity: 5 },
      ],
      contextEntries: [],
    });

    const ids = thin.gaps.map((gap) => gap.id);

    expect(ids).toContain("start");
    expect(ids).toContain("statement");
    expect(ids).toContain("impact");
    expect(ids).toContain("notes");
    expect(ids).toContain("duration");
    expect(ids).toContain("cost");
    expect(ids).toContain("context");
    expect(ids).toContain("ongoing");
  });

  it("counts what is missing instead of guessing at it", () => {
    const thin = buildReport({
      symptomEntries: [
        { id: "s-1", date: "2026-01-05", symptom: "Fatigue", severity: 5 },
        { id: "s-2", date: "2026-01-06", symptom: "Fatigue", severity: 5 },
        { id: "s-3", date: "2026-01-07", symptom: "Fatigue", severity: 5 },
      ],
      contextEntries: [],
    });

    expect(thin.gaps.find((gap) => gap.id === "notes").detail).toContain("3 of your 3 entries have no note");
    expect(thin.gaps.find((gap) => gap.id === "duration").detail).toContain("0 of 3 entries");
  });

  it("closes the statement gap once a statement is written", () => {
    const withStatement = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
      statement: "I want to understand why this keeps happening.",
    });

    expect(withStatement.gaps.map((gap) => gap.id)).not.toContain("statement");
  });

  it("closes the start and impact gaps once the survey has answered them", () => {
    const started = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
      profile: { firstNoticed: "last-month", dayToDay: "significant" },
    });

    const ids = started.gaps.map((gap) => gap.id);

    expect(ids).not.toContain("start");
    expect(ids).not.toContain("impact");
  });

  it("says so plainly when nothing is missing", () => {
    const complete = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES.map((entry) => ({ ...entry, notes: "note", impact: "some" })),
      contextEntries: MOCK_CONTEXT_ENTRIES,
      profile: { firstNoticed: "last-month", dayToDay: "significant" },
      statement: "I want this looked at properly.",
    });

    expect(complete.gaps).toHaveLength(1);
    expect(complete.gaps[0].isClear).toBe(true);
    expect(complete.gaps[0].title).toBe("Your story is complete");
  });
});

describe("language discipline", () => {
  it("never states a cause or a diagnosis anywhere in the brief", () => {
    const copy = generatedCopy(report);

    for (const banned of [...CAUSAL_VERBS, ...DIAGNOSTIC_VERBS]) {
      expect(copy).not.toContain(banned);
    }
  });

  it("holds for a thin record as well as a full one", () => {
    const thin = buildReport({
      symptomEntries: CONTRAST_SYMPTOMS.slice(0, 2),
      contextEntries: CONTRAST_CONTEXT.slice(0, 2),
    });

    for (const banned of [...CAUSAL_VERBS, ...DIAGNOSTIC_VERBS]) {
      expect(generatedCopy(thin)).not.toContain(banned);
    }
  });

  it("does not expose analytics vocabulary to the reader", () => {
    const copy = generatedCopy(report);

    for (const jargon of ["frequency rate", "stdev", "n=", "delta", "co-occurrence", "baseline"]) {
      expect(copy).not.toContain(jargon);
    }
  });
});

describe("empty input", () => {
  it("degrades without throwing", () => {
    const empty = buildReport({});

    expect(empty.isEmpty).toBe(true);
    expect(empty.symptoms).toEqual([]);
    expect(empty.observations).toEqual([]);
    expect(empty.gaps).toEqual([]);
    expect(empty.headline).toBeNull();
  });

  it("treats context-only tracking as nothing to report", () => {
    const contextOnly = buildReport({
      symptomEntries: [],
      contextEntries: [{ date: "2026-01-01", sleep_hours: 5, stress_level: 3 }],
    });

    expect(contextOnly.isEmpty).toBe(true);
  });
});

if (process.env.PRINT_REPORT) {
  console.log(JSON.stringify(report.headline, null, 2));
  console.log("\nWHAT I'VE BEEN EXPERIENCING");
  for (const line of report.experience) console.log("-", line);
  console.log("\nWHAT I'VE NOTICED");
  for (const observation of report.observations) {
    console.log(`- [${observation.kind}] ${observation.title}`);
    console.log("   ", observation.statement);
    if (observation.caveat) console.log("    caveat:", observation.caveat);
    if (observation.ask) console.log("    ask:   ", observation.ask);
  }
  console.log("\nMAKE SURE I MENTION");
  for (const gap of report.gaps) console.log(`- [${gap.id}] ${gap.title}: ${gap.detail}`);
}