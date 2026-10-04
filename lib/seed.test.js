import { describe, expect, it } from "vitest";
import { MOCK_SYMPTOM_ENTRIES } from "@/lib/seed/maya";

describe("seed data coverage", () => {
  it("reports the actual distinct logged days in the seed", () => {
    const dates = [...new Set(MOCK_SYMPTOM_ENTRIES.map((entry) => entry.date))].sort();
    // This assertion exists so the streak test cannot silently drift: the
    // number below is the count of distinct dates in the seed, and the streak
    // test asserts the same value.
    expect(dates.length).toBe(27);
  });
});