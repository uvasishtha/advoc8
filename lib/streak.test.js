import { describe, expect, it } from "vitest";
import { buildStreak, loggedSymptomDates, streakCopy } from "@/lib/streak";
import { MOCK_SYMPTOM_ENTRIES } from "@/lib/seed/maya";

/** One entry per date given, plus `times` duplicates of the last day. */
function entriesOn(dates, times = 1) {
  const rows = dates.map((date, index) => ({
    id: `sym-${index}`,
    date,
    symptom: "Headache",
    severity: 5,
  }));

  for (let extra = 1; extra < times; extra += 1) {
    rows.push({ id: `sym-dup-${extra}`, date: dates[dates.length - 1], symptom: "Fatigue", severity: 3 });
  }

  return rows;
}

const range = (start, count) =>
  Array.from({ length: count }, (unused, index) => {
    const day = new Date(Date.UTC(2026, 8, start + index));
    return day.toISOString().slice(0, 10);
  });

describe("buildStreak — counting days", () => {
  it("counts one day per calendar day, not one per entry", () => {
    const streak = buildStreak(entriesOn(["2026-09-30"], 5), "2026-09-30");
    expect(streak.current).toBe(1);
    expect(streak.daysLogged).toBe(1);
  });

  it("counts a run of consecutive days ending today", () => {
    const streak = buildStreak(entriesOn(["2026-09-28", "2026-09-29", "2026-09-30"]), "2026-09-30");
    expect(streak.current).toBe(3);
    expect(streak.hasStreak).toBe(true);
    expect(streak.isTodayLogged).toBe(true);
    expect(streak.isAtRisk).toBe(false);
  });

  it("ignores duplicate logs on the days inside a run", () => {
    const streak = buildStreak(entriesOn(["2026-09-28", "2026-09-29", "2026-09-30"], 4), "2026-09-30");
    expect(streak.current).toBe(3);
  });

  it("stops at the first missing day", () => {
    const streak = buildStreak(
      entriesOn(["2026-09-26", "2026-09-27", "2026-09-29", "2026-09-30"]),
      "2026-09-30",
    );
    expect(streak.current).toBe(2);
  });

  it("does not span a month boundary by accident", () => {
    const streak = buildStreak(entriesOn(["2026-08-31", "2026-09-01"]), "2026-09-01");
    expect(streak.current).toBe(2);
  });
});

describe("buildStreak — updating and breaking", () => {
  it("starts at 1 on the very first day logged", () => {
    const streak = buildStreak(entriesOn(["2026-09-30"]), "2026-09-30");
    expect(streak.current).toBe(1);
    expect(streak.label).toBe("1 DAY STREAK");
    expect(streak.headline).toBe("You've started your Advoc8 streak.");
  });

  it("extends the moment a day is logged", () => {
    // Logged on the 28th and 29th, read on the 30th: still alive, waiting.
    const before = buildStreak(entriesOn(["2026-09-28", "2026-09-29"]), "2026-09-30");
    expect(before.current).toBe(2);
    expect(before.isTodayLogged).toBe(false);

    const after = buildStreak(entriesOn(["2026-09-28", "2026-09-29", "2026-09-30"]), "2026-09-30");
    expect(after.current).toBe(3);
    expect(after.isTodayLogged).toBe(true);
  });

  it("keeps the streak alive until a whole day is missed", () => {
    const streak = buildStreak(entriesOn(["2026-09-28", "2026-09-29"]), "2026-09-30");
    expect(streak.current).toBe(2);
    expect(streak.isTodayLogged).toBe(false);
    expect(streak.isAtRisk).toBe(true);
    expect(streak.detail).toBe("Log something today to keep it going.");
  });

  it("resets once a calendar day has been missed", () => {
    const streak = buildStreak(entriesOn(["2026-09-26", "2026-09-27"]), "2026-09-30");
    expect(streak.current).toBe(0);
    expect(streak.hasStreak).toBe(false);
    expect(streak.label).toBe("");
  });

  it("restarts from one when logging again after a gap", () => {
    const streak = buildStreak(entriesOn(["2026-09-25", "2026-09-30"]), "2026-09-30");
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });
});

describe("buildStreak — no data", () => {
  it("reports no streak for an empty record", () => {
    const streak = buildStreak([], "2026-09-30");
    expect(streak.hasStreak).toBe(false);
    expect(streak.current).toBe(0);
    expect(streak.daysLogged).toBe(0);
    expect(streak.label).toBe("");
    expect(streak.headline).toBe("");
    expect(streak.detail).toBe("");
  });

  it("reports no streak when nothing has been logged today or yesterday", () => {
    const streak = buildStreak(entriesOn(["2026-09-10"]), "2026-09-30");
    expect(streak.hasStreak).toBe(false);
    expect(streak.daysLogged).toBe(1);
  });

  it("survives being called with nothing", () => {
    expect(buildStreak().hasStreak).toBe(false);
    expect(buildStreak(undefined, undefined).current).toBe(0);
  });

  it("ignores entries with no date", () => {
    const streak = buildStreak([{ id: "x", symptom: "Headache", severity: 4 }], "2026-09-30");
    expect(streak.daysLogged).toBe(0);
    expect(streak.hasStreak).toBe(false);
  });
});

describe("buildStreak — history", () => {
  it("remembers the longest run even after the current one breaks", () => {
    const streak = buildStreak(entriesOn(range(1, 9)), "2026-09-30");
    expect(streak.current).toBe(0);
    expect(streak.longest).toBe(9);
  });

  it("reads the seeded sample data", () => {
    const dates = loggedSymptomDates(MOCK_SYMPTOM_ENTRIES);
    expect(dates.length).toBe(26);

    // 26 of the 30 days have an entry. The 11th is missing, so the longest run
    // in the month is 1st–10th, and the run ending on the 30th is the 22nd–30th.
    const streak = buildStreak(MOCK_SYMPTOM_ENTRIES, "2026-09-30");
    expect(streak.daysLogged).toBe(dates.length);
    expect(streak.current).toBe(9);
    expect(streak.longest).toBe(10);
    expect(streak.isTodayLogged).toBe(true);
    expect(streak.label).toBe("9 DAY STREAK");
  });
});

describe("streakCopy", () => {
  it("uses the milestone lines", () => {
    expect(streakCopy({ current: 2, isTodayLogged: true }).headline).toBe(
      "You're building a record of your symptoms.",
    );
    expect(streakCopy({ current: 7, isTodayLogged: true }).headline).toBe(
      "One week of consistent tracking.",
    );
  });

  it("describes any other run in plain words with the number in it", () => {
    const copy = streakCopy({ current: 4, isTodayLogged: true });
    expect(copy.label).toBe("4 DAY STREAK");
    expect(copy.headline).toBe("You've logged your symptoms 4 days in a row.");
    expect(copy.detail).toBe("Keep building your health history.");
  });

  it("says nothing at all when there is no streak", () => {
    expect(streakCopy({ current: 0 })).toEqual({ label: "", headline: "", detail: "" });
  });

  it("never claims the user is healthier or any closer to a diagnosis", () => {
    const forbidden = ["healthier", "better", "cure", "healing", "diagnosis", "improve", "symptom-free"];

    for (let current = 1; current <= 120; current += 1) {
      for (const isTodayLogged of [true, false]) {
        const copy = streakCopy({ current, isTodayLogged });
        const text = `${copy.label} ${copy.headline} ${copy.detail}`.toLowerCase();

        for (const word of forbidden) {
          expect(text).not.toContain(word);
        }
      }
    }
  });
});