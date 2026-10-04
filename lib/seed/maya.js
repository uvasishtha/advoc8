// Deterministic sample data for the prototype user.
// Every value is derived from a fixed seed so the demo looks identical on
// every load, and so analytics tests can assert exact numbers.

function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const YEAR = 2026;
const MONTH = 9;
const FIRST_DAY = 1;
const LAST_DAY = 30;
const PERIOD_START = 2;
const CYCLE_LENGTH = 28;

export const SAMPLE_USER = {
  id: "user-maya",
  firstName: "Maya",
  lastName: "R",
  displayName: "Maya R",
  email: "maya.r@example.com",
  concern:
    "Headaches and fatigue have been showing up most days for the past month, and both have felt worse in the second half than the first. I keep telling myself it is stress or a bad sleep schedule, but the pattern has been consistent enough that I want it looked at properly.",
  appointmentGoal:
    "I want to understand why my headaches and fatigue have been getting worse, and to get a plan for what to track next.",
  appointmentDate: "2026-10-08",
  appointmentType: "Primary care",
};

// The words Maya wrote for herself. Restoring the sample data restores these
// too, so the demo profile and the brief never disagree about who it belongs
// to. A brand new user's own words come from the setup survey instead.
export const SAMPLE_STATEMENT =
  "These symptoms have been getting worse rather than better, and they are starting to affect my work. I would like to understand what is going on and get a plan for what to do next.";

const SYMPTOM_CATALOG = [
  {
    name: "Headache",
    baseChance: 0.28,
    // Severity climbs across the month so the brief's change-over-time
    // section has a real signal to show rather than noise.
    trend: 2.2,
    durationRange: [60, 300],
    severityRange: [2.5, 6.5],
    notes: [
      "Throbbing behind both eyes, worse in the afternoon.",
      "Started late morning and eased after lying down in a dark room.",
      "Builds up over a few hours. Bright light made it noticeably worse.",
      "Sharp on the right side only. Needed to stop what I was doing.",
    ],
    modifiers: [
      {
        when: (day) => day.sleep_hours < 6,
        chance: 0.26,
        severity: 0.9,
      },
      {
        when: (day) => day.stress_level >= 4,
        chance: 0.18,
        severity: 0.7,
      },
      {
        when: (day) => day.cycle_day >= 18 && day.cycle_day <= 23,
        chance: 0.1,
        severity: 0.4,
      },
    ],
  },
  {
    name: "Fatigue",
    baseChance: 0.48,
    trend: 2,
    durationRange: [180, 600],
    severityRange: [2.5, 6],
    notes: [
      "Heavy from the moment I woke up, even after a full night.",
      "Managed to get through the day but had to lie down in the afternoon.",
      "Tired in a way that sleep does not seem to fix.",
      "Skipped my usual walk because getting out of bed felt like a lot.",
    ],
    modifiers: [
      {
        when: (day) => day.sleep_hours < 6,
        chance: 0.22,
        severity: 1.1,
      },
      {
        when: (day) => day.stress_level === 5,
        chance: 0.16,
        severity: 0.6,
      },
    ],
  },
  {
    name: "Pelvic pain",
    baseChance: 0.04,
    trend: 0.6,
    durationRange: [120, 480],
    severityRange: [3.5, 7.5],
    notes: [
      "Cramping low in the pelvis, dull and constant.",
      "Sharp pain that made me stop walking. Eased when I lay on my side.",
      "Woke me up once during the night.",
      "Deep ache that built through the day and eased in the evening.",
    ],
    modifiers: [
      {
        when: (day) => day.cycle_day <= 5,
        chance: 0.5,
        severity: 0.8,
      },
      {
        when: (day) => day.cycle_day >= 19 && day.cycle_day <= 24,
        chance: 0.22,
        severity: 0.4,
      },
    ],
  },
  {
    name: "Brain fog",
    baseChance: 0.22,
    trend: 0.8,
    durationRange: [120, 480],
    severityRange: [2, 5.5],
    notes: [
      "Losing my train of thought mid-sentence and having to restart.",
      "Reading the same paragraph three times without taking it in.",
      "Hard to focus on anything with detail.",
    ],
    modifiers: [
      {
        when: (day) => day.sleep_hours < 6,
        chance: 0.26,
        severity: 0.8,
      },
    ],
  },
  {
    name: "Dizziness",
    baseChance: 0.13,
    trend: 0.5,
    durationRange: [5, 40],
    severityRange: [2, 5],
    notes: [
      "Lightheaded when standing up quickly. Had to grab the counter.",
      "Room tilted for a few minutes in the afternoon.",
    ],
    modifiers: [
      {
        when: (day) => day.stress_level >= 4,
        chance: 0.1,
        severity: 0.4,
      },
    ],
  },
];

function cycleDayFor(day) {
  return ((day - PERIOD_START + CYCLE_LENGTH) % CYCLE_LENGTH) + 1;
}

function cyclePhaseFor(cycleDay) {
  if (cycleDay <= 5) return "Menstrual";
  if (cycleDay <= 13) return "Follicular";
  if (cycleDay <= 17) return "Ovulation";
  return "Luteal";
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildContextEntries() {
  const random = mulberry32(20260901);
  const entries = [];

  for (let day = FIRST_DAY; day <= LAST_DAY; day += 1) {
    const date = `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Sleep drifts upward across the month, so the two halves of the brief
    // show a real difference rather than pure noise.
    const progress = (day - FIRST_DAY) / (LAST_DAY - FIRST_DAY);
    const sleepHours = round1(clamp(5.4 + progress * 1.5 + (random() - 0.5) * 1.6, 4.2, 8.6));
    const stressLevel = clamp(Math.round(2.6 + (1 - progress) * 1.4 + (random() - 0.5) * 2.4), 1, 5);
    const cycleDay = cycleDayFor(day);

    entries.push({
      id: `ctx-${date}`,
      user_id: SAMPLE_USER.id,
      date,
      sleep_hours: sleepHours,
      stress_level: stressLevel,
      cycle_day: cycleDay,
      cycle_phase: cyclePhaseFor(cycleDay),
    });
  }

  return entries;
}

function buildSymptomEntries(contextEntries) {
  const random = mulberry32(770413);
  const entries = [];

  for (const [index, day] of contextEntries.entries()) {
    const progress = contextEntries.length === 1 ? 0 : index / (contextEntries.length - 1);

    for (const symptom of SYMPTOM_CATALOG) {
      let chance = symptom.baseChance;
      let severityBonus = (symptom.trend ?? 0) * progress;

      for (const modifier of symptom.modifiers) {
        if (modifier.when(day)) {
          chance += modifier.chance;
          severityBonus += modifier.severity;
        }
      }

      if (random() > chance) continue;

      const [sevMin, sevMax] = symptom.severityRange;
      const severity = Math.round(clamp(sevMin + random() * (sevMax - sevMin) + severityBonus, 1, 10));
      const [durMin, durMax] = symptom.durationRange;
      const durationMinutes = Math.round((durMin + random() * (durMax - durMin)) / 5) * 5;
      const note = symptom.notes[Math.floor(random() * symptom.notes.length)];

      entries.push({
        id: `sym-${day.date}-${symptom.name.toLowerCase().replace(/\s+/g, "-")}`,
        user_id: SAMPLE_USER.id,
        date: day.date,
        symptom: symptom.name,
        severity,
        duration_minutes: durationMinutes,
        notes: note,
      });
    }
  }

  return entries;
}

const contextEntries = buildContextEntries();
const symptomEntries = buildSymptomEntries(contextEntries);

export const MOCK_CONTEXT_ENTRIES = contextEntries;
export const MOCK_SYMPTOM_ENTRIES = symptomEntries;

export const SYMPTOM_OPTIONS = SYMPTOM_CATALOG.map((symptom) => symptom.name);

export const IMPACT_OPTIONS = [
  { value: "none", label: "Little or no impact" },
  { value: "some", label: "Some impact on my day" },
  { value: "significant", label: "Significant impact" },
  { value: "missed", label: "Missed school or work" },
];

export const STRESS_OPTIONS = [
  { value: 1, label: "1 — Very low" },
  { value: 2, label: "2 — Low" },
  { value: 3, label: "3 — Moderate" },
  { value: 4, label: "4 — High" },
  { value: 5, label: "5 — Very high" },
];

// Seeded questions, so section 07 has content before the AI is wired up.
// They are phrased as questions for a clinician, never as claims.
export const MOCK_QUESTIONS = [
  {
    id: "q-seed-1",
    text: "Looking at this brief, what questions should I be asking to get a full picture of what has changed?",
    section: "getting started",
    source: "seed",
  },
  {
    id: "q-seed-2",
    text: "Given how often these symptoms have appeared, what would you want to test first?",
    section: "tests",
    source: "seed",
  },
  {
    id: "q-seed-3",
    text: "How much of this should I keep tracking before we meet again, and what should I be tracking?",
    section: "next steps",
    source: "seed",
  },
  {
    id: "q-seed-4",
    text: "What would make you want to see a specialist?",
    section: "referrals",
    source: "seed",
  },
];