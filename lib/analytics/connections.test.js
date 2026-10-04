import { describe, expect, it } from "vitest";
import { findSymptomConnections, MAX_CONNECTIONS } from "@/lib/analytics/connections";
import { MOCK_SYMPTOM_ENTRIES, MOCK_CONTEXT_ENTRIES } from "@/lib/seed/maya";

describe("findSymptomConnections — Maya sample data", () => {
  const connections = findSymptomConnections({
    symptomEntries: MOCK_SYMPTOM_ENTRIES,
    contextEntries: MOCK_CONTEXT_ENTRIES,
  });

  it("finds at least one connection from Maya's data", () => {
    expect(connections.length).toBeGreaterThan(0);
  });

  it("never returns more than MAX_CONNECTIONS", () => {
    expect(connections.length).toBeLessThanOrEqual(MAX_CONNECTIONS);
  });

  it("every connection has the required fields", () => {
    for (const connection of connections) {
      expect(connection.type).toMatch(/^(context|symptom_overlap)$/);
      expect(typeof connection.title).toBe("string");
      expect(connection.title.length).toBeGreaterThan(0);
      expect(typeof connection.evidence).toBe("string");
      expect(connection.evidence.length).toBeGreaterThan(0);
      expect(typeof connection.caveat).toBe("string");
      expect(typeof connection.question).toBe("string");
    }
  });

  it("context connections carry rate data", () => {
    const contextConnections = connections.filter((c) => c.type === "context");
    for (const connection of contextConnections) {
      expect(connection.factorDays).toBeGreaterThan(0);
      expect(connection.symptomDaysWithFactor).toBeGreaterThan(0);
      expect(connection.factorRate).toBeGreaterThan(0);
      expect(connection.factorRate).toBeLessThanOrEqual(1);
      expect(connection.comparisonDays).toBeGreaterThan(0);
      expect(typeof connection.difference).toBe("number");
    }
  });

  it("overlap connections carry shared day counts", () => {
    const overlapConnections = connections.filter((c) => c.type === "symptom_overlap");
    for (const connection of overlapConnections) {
      expect(connection.sharedDays).toBeGreaterThan(0);
      expect(Array.isArray(connection.symptoms)).toBe(true);
      expect(connection.symptoms.length).toBe(2);
    }
  });

  it("never states or implies a cause", () => {
    // The caveat text intentionally negates a causal claim ("not proof that X
    // caused Y"), so the check runs against the title and evidence — the parts
    // that describe what the record shows — rather than the caveat itself.
    const CAUSAL_VERBS = [
      "caused", "causing", "causes", "due to", "because of", "result of",
      "resulted in", "results in", "led to", "leads to", "responsible for",
      "triggered by", "triggers", "brought on by", "makes you", "causing your",
      "why you get", "reason for your", "explains your", "underlying cause", "root cause",
    ];
    const DIAGNOSTIC_VERBS = [
      "you have", "you are suffering", "you likely have", "diagnosis",
      "diagnosed with", "indicates that you", "suggests that you",
      "suggests you", "this means you have", "you may have", "most likely",
      "probably because", "consistent with a", "points to",
    ];
    const text = connections
      .map((c) => `${c.title} ${c.evidence}`)
      .join(" ")
      .toLowerCase();
    for (const verb of CAUSAL_VERBS) {
      expect(text).not.toContain(verb);
    }
    for (const verb of DIAGNOSTIC_VERBS) {
      expect(text).not.toContain(verb);
    }
  });
});

describe("findSymptomConnections — empty input", () => {
  it("returns an empty array when there are no symptom entries", () => {
    expect(findSymptomConnections({ symptomEntries: [], contextEntries: MOCK_CONTEXT_ENTRIES })).toEqual([]);
  });

  it("returns overlap connections even without context entries", () => {
    // Symptom overlap does not need context rows — it is computed purely
    // from which days two symptoms were logged on.
    const connections = findSymptomConnections({
      symptomEntries: MOCK_SYMPTOM_ENTRIES,
      contextEntries: [],
    });
    expect(connections.length).toBeGreaterThan(0);
    for (const connection of connections) {
      expect(connection.type).toBe("symptom_overlap");
    }
  });
});

describe("findSymptomConnections — threshold enforcement", () => {
  it("does not surface a connection with too few factor days", () => {
    // One symptom on one day, with one context row — nowhere near enough data.
    const entries = [
      { id: "sym-1", date: "2026-09-10", symptom: "Headache", severity: 5, duration_minutes: 60 },
    ];
    const context = [
      { id: "ctx-1", date: "2026-09-10", sleep_hours: 5, stress_level: 2, cycle_day: 1, cycle_phase: "Menstrual" },
    ];
    expect(findSymptomConnections({ symptomEntries: entries, contextEntries: context })).toEqual([]);
  });

  it("does not surface a connection with too few comparison days", () => {
    // 5 low-sleep days all with headache, but only 2 comparison days.
    const entries = [];
    const context = [];
    for (let i = 1; i <= 5; i += 1) {
      const date = `2026-09-${String(i).padStart(2, "0")}`;
      entries.push({ id: `sym-${i}`, date, symptom: "Headache", severity: 6, duration_minutes: 60 });
      context.push({ id: `ctx-${i}`, date, sleep_hours: 5, stress_level: 2, cycle_day: i, cycle_phase: "Follicular" });
    }
    // Only two well-sleep days — below the MIN_COMPARISON_DAYS floor.
    for (let i = 6; i <= 7; i += 1) {
      const date = `2026-09-${String(i).padStart(2, "0")}`;
      context.push({ id: `ctx-${i}`, date, sleep_hours: 8, stress_level: 2, cycle_day: i, cycle_phase: "Follicular" });
    }
    expect(findSymptomConnections({ symptomEntries: entries, contextEntries: context })).toEqual([]);
  });
});