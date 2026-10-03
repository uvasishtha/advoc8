import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/analytics";
import {
  buildDoctorSummary,
  findSummaryDefects,
  isEmptySummary,
  DOCTOR_SUMMARY_LIMITS,
} from "@/lib/doctor-summary";
import { CAUSAL_VERBS, DIAGNOSTIC_VERBS } from "@/lib/analytics/language";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES, SAMPLE_USER } from "@/lib/seed/maya";

const TODAY = "2026-10-03";

const DRAFT = {
  statement:
    "These symptoms have been getting worse rather than better, and they are starting to affect my work. I would like to understand what is going on and get a plan for what to do next.",
  appointmentGoal: "",
  questions: [
    { id: "q1", text: "What would you want to test first?" },
    { id: "q2", text: "How much of this should I keep tracking before we meet again?" },
    { id: "q3", text: "What would make you want to see a specialist?" },
    { id: "q4", text: "Is this a fourth question that should be dropped?" },
  ],
};

const USER = {
  displayName: "Maya R",
  concern: SAMPLE_USER.concern,
  concernText: SAMPLE_USER.concern,
  doctorNote: SAMPLE_USER.appointmentGoal,
  firstNoticed: "last-month",
  dayToDay: "significant",
  tracksCycle: true,
  cycleLength: 28,
  lastPeriodStart: "2026-09-02",
};

function summaryFrom({ entries = MOCK_SYMPTOM_ENTRIES, context = MOCK_CONTEXT_ENTRIES, draft, user } = {}) {
  const report = buildReport({ symptomEntries: entries, contextEntries: context, profile: null });
  return buildDoctorSummary({
    report,
    user: { ...USER, ...user },
    draft: draft ?? DRAFT,
    symptomEntries: entries,
    today: TODAY,
  });
}

function makeEntries(count, symptom = "Headache") {
  return Array.from({ length: count }, (unused, index) => ({
    id: `sym-${index}`,
    date: `2026-09-${String((index % 28) + 1).padStart(2, "0")}`,
    symptom,
    severity: 3 + (index % 6),
    duration_minutes: 120,
  }));
}

describe("buildDoctorSummary — sample data", () => {
  const summary = summaryFrom();

  it("produces every section from the sample brief", () => {
    expect(summary.isEmpty).toBe(false);
    expect(summary.concern).not.toBe("");
    expect(summary.snapshot.rows.length).toBeGreaterThan(0);
    expect(summary.trends.length).toBeGreaterThanOrEqual(2);
    expect(summary.patterns.length).toBeGreaterThan(0);
    expect(summary.statement.length).toBeGreaterThan(0);
    expect(summary.questions).toHaveLength(DOCTOR_SUMMARY_LIMITS.questions);
    expect(summary.context.length).toBeGreaterThan(0);
  });

  it("stamps the generation date and the tracking period", () => {
    expect(summary.header.generatedOn).toBe("October 3, 2026");
    expect(summary.header.meta).toContain("Tracking period");
  });

  it("reads the numbers out of the report rather than recomputing them", () => {
    const report = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
    });
    const lead = report.symptoms[0];
    const row = summary.snapshot.rows[0];

    expect(row.name).toBe(lead.name);
    expect(row.days).toBe(lead.daysReported);
    expect(row.trackingDays).toBe(report.range.totalDays);
    // Formatted for the page, but still the report's own figure.
    expect(row.maxSeverity).toBe(`${lead.maxSeverity} / 10`);
  });

  it("uses the patient's own words for the statement and questions", () => {
    expect(summary.statement.join(" ")).toContain("affect my work");
    expect(summary.questions[0]).toBe("What would you want to test first?");
  });
});

describe("buildDoctorSummary — language discipline", () => {
  const summary = summaryFrom();

  const text = [
    summary.concern,
    ...summary.trends,
    ...summary.patterns,
    ...summary.statement,
    ...summary.questions,
    ...summary.context.map((row) => `${row.label} ${row.value}`),
  ]
    .join(" ")
    .toLowerCase();

  it("states no cause", () => {
    for (const verb of CAUSAL_VERBS) {
      expect(text).not.toContain(verb.toLowerCase());
    }
  });

  it("implies no diagnosis", () => {
    for (const verb of DIAGNOSTIC_VERBS) {
      expect(text).not.toContain(verb.toLowerCase());
    }
  });

  it("labels patterns as observed co-occurrence", () => {
    for (const pattern of summary.patterns) {
      expect(pattern.startsWith("Observed pattern:")).toBe(true);
    }
  });
});

describe("buildDoctorSummary — fitting one page", () => {
  it("caps the symptom rows and counts what it dropped", () => {
    const names = ["Headache", "Fatigue", "Brain fog", "Dizziness", "Nausea", "Back pain", "Rash", "Bloating"];
    const entries = names.flatMap((name, index) =>
      makeEntries(12 - index, name).map((entry, position) => ({
        ...entry,
        id: `${name}-${position}`,
        symptom: name,
        date: `2026-09-${String(((position + index * 3) % 28) + 1).padStart(2, "0")}`,
      })),
    );

    const summary = summaryFrom({ entries });

    expect(summary.snapshot.rows).toHaveLength(DOCTOR_SUMMARY_LIMITS.symptomRows);
    expect(summary.snapshot.omitted).toBeGreaterThan(0);
    expect(summary.trends.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.trends);
    expect(summary.patterns.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.patterns);
  });

  it("keeps the most reported symptoms when the cap bites", () => {
    const summary = summaryFrom();
    const reported = summary.snapshot.rows.map((row) => row.days);
    const sorted = [...reported].sort((a, b) => b - a);
    expect(reported).toEqual(sorted);
  });

  it("caps trends, patterns, statement bullets and questions", () => {
    const summary = summaryFrom({
      draft: {
        statement: [
          "First concern.",
          "Second concern.",
          "Third concern.",
          "Fourth concern.",
          "Fifth concern that should not appear.",
        ].join("\n"),
        questions: DRAFT.questions,
      },
    });

    expect(summary.trends.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.trends);
    expect(summary.patterns.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.patterns);
    expect(summary.statement).toHaveLength(DOCTOR_SUMMARY_LIMITS.statementBullets);
    expect(summary.statement.join(" ")).not.toContain("Fifth concern");
    expect(summary.questions).toHaveLength(DOCTOR_SUMMARY_LIMITS.questions);
  });

  it("splits a single paragraph of statement into bullets", () => {
    const summary = summaryFrom({ draft: { statement: "One thing. Two things. Three things.", questions: [] } });
    expect(summary.statement).toHaveLength(3);
  });
});

describe("buildDoctorSummary — nothing broken reaches the page", () => {
  const summary = summaryFrom();

  /**
   * The regression that started this: the sheet read `range.daysWithSymptoms`,
   * which the report does not have — it is called `daysLogged` — so the page
   * printed "undefined of 30". A missing key must cost a row, never a word.
   */
  it("counts the days a symptom was recorded from the report's own figure", () => {
    const report = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
    });

    const row = summary.context.find((item) => item.label === "Days a symptom was recorded");

    expect(row.value).toBe(`${report.range.daysLogged} of ${report.range.totalDays} days`);
    expect(row.value).not.toContain("undefined");
  });

  it("says how many days carried sleep and stress", () => {
    const report = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
    });

    const row = summary.context.find((item) => item.label === "Days sleep and stress recorded");

    expect(row.value).toBe(`${report.range.daysWithContext} of ${report.range.totalDays} days`);
  });

  it("has no placeholder, identifier or arithmetic artefact anywhere", () => {
    expect(findSummaryDefects(summary)).toEqual([]);
  });

  it("catches a broken sheet when one is handed to it", () => {
    const broken = {
      concern: "undefined",
      context: [{ label: "Sleep", value: "NaN hours" }],
      snapshot: {
        rows: [{ name: "Headache", days: 4, trackingDays: 30 }],
        descriptions: [{ symptom: "Headache", note: "felt like sym-2026-09-04-headache hurt" }],
      },
      trends: ["Headache lasted 3h 14.699999999999989m"],
    };

    // One per planted fault: the word, the NaN, the row id, the float run.
    expect(findSummaryDefects(broken)).toHaveLength(4);
  });

  it("drops a context row whose value would have printed a placeholder", () => {
    const report = buildReport({ symptomEntries: MOCK_SYMPTOM_ENTRIES, contextEntries: [] });
    const built = buildDoctorSummary({
      report: { ...report, range: { ...report.range, daysLogged: undefined } },
      user: USER,
      draft: { statement: "", questions: [] },
      today: TODAY,
    });

    const labels = built.context.map((row) => row.label);
    expect(labels).not.toContain("Days a symptom was recorded");
  });
});

describe("buildDoctorSummary — numbers that read consistently", () => {
  const summary = summaryFrom();

  it("gives every severity its scale and at most one decimal place", () => {
    for (const row of summary.snapshot.rows) {
      expect(row.avgSeverity).toMatch(/^\d(\.\d)? \/ 10$/);
      expect(row.maxSeverity).toMatch(/^\d+ \/ 10$/);
    }
  });

  it("writes a whole average as 7 rather than 7.0", () => {
    const report = buildReport({
      symptomEntries: [
        { id: "a", date: "2026-09-01", symptom: "Headache", severity: 7, duration_minutes: 60 },
        { id: "b", date: "2026-09-02", symptom: "Headache", severity: 7, duration_minutes: 60 },
      ],
      contextEntries: [],
    });

    const built = buildDoctorSummary({
      report,
      user: USER,
      draft: { statement: "", questions: [] },
      symptomEntries: [],
      today: TODAY,
    });

    expect(built.snapshot.rows[0].avgSeverity).toBe("7 / 10");
    expect(built.snapshot.rows[0].maxSeverity).toBe("7 / 10");
  });

  it("spells the scale out in every trend line", () => {
    const changes = summary.trends.filter((line) => line.includes("first half"));
    expect(changes.length).toBeGreaterThan(0);

    for (const line of changes) {
      expect(line.match(/\d+(\.\d)? \/ 10/g)).toHaveLength(2);
    }
  });

  it("rounds durations to whole minutes", () => {
    const built = buildDoctorSummary({
      report: {
        isEmpty: false,
        range: {
          label: "Sep 1 – 30, 2026",
          totalDays: 30,
          daysLogged: 1,
          daysWithContext: 1,
          entryCount: 1,
        },
        symptoms: [
          {
            name: "Headache",
            daysReported: 1,
            avgSeverity: 5,
            maxSeverity: 5,
            avgDurationMinutes: 194.7,
            lastSeen: "2026-09-04",
            hasEnoughData: false,
          },
        ],
        patterns: [],
        context: {},
      },
      user: USER,
      draft: { statement: "", questions: [] },
      symptomEntries: [],
      today: TODAY,
    });

    expect(built.snapshot.rows[0].duration).toBe("3h 15m");
  });

  it("marks an unrecorded figure as unrecorded instead of guessing", () => {
    const built = summaryFrom({
      entries: [
        {
          id: "sym-1",
          date: "2026-09-10",
          symptom: "Headache",
          severity: 5,
          duration_minutes: null,
        },
      ],
    });

    expect(built.snapshot.rows[0].duration).toBeNull();
    expect(built.snapshot.rows[0].avgSeverity).toBe("5 / 10");
  });
});

describe("buildDoctorSummary — the patient's own descriptions", () => {
  it("quotes what the patient wrote, on their worst day for that symptom", () => {
    const summary = summaryFrom();
    const [first] = summary.snapshot.descriptions;

    expect(first).toBeDefined();
    expect(first.symptom).toBe(summary.snapshot.rows[0].name);

    const written = MOCK_SYMPTOM_ENTRIES.filter((entry) => entry.symptom === first.symptom);
    const quoted = written.filter((entry) => entry.notes === first.note);
    expect(quoted.length).toBeGreaterThan(0);

    const worstSeverity = Math.max(...quoted.map((entry) => entry.severity));
    expect(Math.max(...written.map((entry) => entry.severity))).toBe(worstSeverity);
  });

  it("caps the number of descriptions", () => {
    const summary = summaryFrom();
    expect(summary.snapshot.descriptions.length).toBeLessThanOrEqual(
      DOCTOR_SUMMARY_LIMITS.descriptions,
    );
  });

  it("trims a long note at a word boundary rather than overflowing", () => {
    const lead = summaryFrom().snapshot.rows[0].name;
    const long = "word ".repeat(80).trim();
    // Every entry for the leading symptom, so the worst day carries it too.
    const entries = MOCK_SYMPTOM_ENTRIES.map((entry) =>
      entry.symptom === lead ? { ...entry, notes: long } : entry,
    );

    const summary = summaryFrom({ entries });
    const note = summary.snapshot.descriptions[0].note;

    expect(note.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.descriptionChars);
    expect(note.endsWith("…")).toBe(true);
    expect(note).not.toMatch(/\d\.\d{4,}/);
  });

  it("carries no descriptions when no entries are supplied, rather than inventing them", () => {
    const report = buildReport({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: MOCK_CONTEXT_ENTRIES,
    });
    const built = buildDoctorSummary({ report, user: USER, draft: DRAFT, today: TODAY });

    expect(built.snapshot.descriptions).toEqual([]);
    expect(built.snapshot.rows.length).toBeGreaterThan(0);
  });

  it("gives every description a symptom it belongs to and a date", () => {
    for (const item of summaryFrom().snapshot.descriptions) {
      expect(item.symptom).not.toBe("");
      expect(item.note.length).toBeGreaterThan(0);
      expect(item.date).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    }
  });
});

describe("buildDoctorSummary — missing data", () => {
  it("omits sections instead of inventing rows", () => {
    const entries = [
      {
        id: "sym-1",
        date: "2026-09-10",
        symptom: "Headache",
        severity: 5,
        duration_minutes: null,
      },
    ];
    const summary = summaryFrom({ entries, context: [], draft: { statement: "", questions: [] } });

    expect(summary.concern).not.toBe(""); // from the user's own words
    expect(summary.snapshot.rows).toHaveLength(1);
    expect(summary.snapshot.rows[0].duration).toBeNull();
    expect(summary.trends).toHaveLength(1); // frequency only, no half comparison
    expect(summary.patterns).toHaveLength(0);
    expect(summary.statement).toHaveLength(1); // falls back to the doctor's note
    expect(summary.questions).toHaveLength(0);

    const labels = summary.context.map((row) => row.label);
    expect(labels).not.toContain("Sleep");
    expect(labels).not.toContain("Stress");
  });

  it("omits the concern when the patient wrote none", () => {
    const summary = summaryFrom({ user: { concern: "", concernText: "", doctorNote: "" } });
    expect(summary.concern).toBe("");
  });

  it("handles a brief with no entries at all", () => {
    const report = buildReport({ symptomEntries: [], contextEntries: [] });
    const summary = buildDoctorSummary({ report, user: USER, draft: DRAFT, today: TODAY });

    expect(summary.isEmpty).toBe(true);
    expect(isEmptySummary(summary)).toBe(true);
    expect(summary.snapshot.rows).toHaveLength(0);
    expect(summary.trends).toHaveLength(0);
    expect(summary.context).toHaveLength(0);
  });

  it("survives missing report, user and draft entirely", () => {
    const summary = buildDoctorSummary();
    expect(summary.isEmpty).toBe(true);
    expect(isEmptySummary(summary)).toBe(true);
  });

  it("reports an empty summary when a non-empty brief yields nothing printable", () => {
    expect(isEmptySummary({ isEmpty: false })).toBe(true);
  });
});

describe("buildDoctorSummary — condensing the patient's words", () => {
  it("keeps the concern to at most two sentences", () => {
    const summary = summaryFrom({
      user: {
        concernText:
          "First sentence here. Second sentence here. Third sentence that should be dropped. Fourth too.",
      },
    });

    expect(summary.concern).toContain("First sentence here.");
    expect(summary.concern).toContain("Second sentence here.");
    expect(summary.concern).not.toContain("Third sentence");
  });

  it("truncates a very long single sentence instead of overflowing the page", () => {
    const long = `${"word ".repeat(120).trim()}.`;
    const summary = summaryFrom({ user: { concernText: long } });

    expect(summary.concern.length).toBeLessThanOrEqual(DOCTOR_SUMMARY_LIMITS.concernChars);
    expect(summary.concern.endsWith("…")).toBe(true);
  });
});