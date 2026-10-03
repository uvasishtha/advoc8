import { roundTo } from "@/lib/format";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Calls Gemini and returns parsed JSON.
 *
 * Deliberately plain `fetch` rather than the SDK: one request shape, no
 * dependency to keep current. Swap the endpoint and headers to move providers.
 */
export async function callGemini({ system, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const response = await fetch(`${GEMINI_ENDPOINT}/${MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ?? "";

  return JSON.parse(text);
}

/**
 * Questions derived from the report without calling any model.
 *
 * Used when no API key is configured, so the button is never dead. Every
 * question references a number the user can check against section 03.
 */
export function buildFallbackQuestions(report) {
  if (!report || report.isEmpty) {
    return [
      {
        id: "fallback-empty",
        text: "I have not tracked anything yet. What should I be recording, and for how long?",
        section: "getting started",
        source: "fallback",
      },
    ];
  }

  const lead = report.symptoms[0];
  const questions = [];

  questions.push({
    id: "fallback-overview",
    text: `I have logged ${lead.name.toLowerCase()} on ${lead.daysReported} of the last ${report.range.totalDays} days, averaging ${roundTo(lead.avgSeverity)} out of 10. What would you want to know to understand this?`,
    section: "getting started",
    source: "fallback",
  });

  if (lead.trend === "increasing") {
    questions.push({
      id: "fallback-change",
      text: `My ${lead.name.toLowerCase()} severity went from ${roundTo(lead.halves.firstHalf.averageSeverity)} to ${roundTo(
        lead.halves.secondHalf.averageSeverity,
      )} out of 10 across the month. What would explain a change like that in your view?`,
      section: "getting started",
      source: "fallback",
    });
  }

  questions.push({
    id: "fallback-tests",
    text: `Given how often these symptoms have appeared, what would you want to test or check first?`,
    section: "tests",
    source: "fallback",
  });

  if (report.patterns.length > 0) {
    const pattern = report.patterns[0];
    questions.push({
      id: "fallback-pattern",
      text: `${pattern.statement} Is that pattern something you would pay attention to, and why?`,
      section: "day to day",
      source: "fallback",
    });
  }

  questions.push({
    id: "fallback-tracking",
    text: "What should I keep tracking before our next appointment, and what would make that useful to you?",
    section: "next steps",
    source: "fallback",
  });

  questions.push({
    id: "fallback-referral",
    text: "At what point would you want me to see a specialist, and who would you recommend?",
    section: "referrals",
    source: "fallback",
  });

  return questions;
}

/** Normalises model output into the shape the UI expects. */
export function normaliseQuestions(payload) {
  const raw = Array.isArray(payload) ? payload : payload?.questions;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => typeof item?.text === "string" && item.text.trim())
    .slice(0, 8)
    .map((item, index) => ({
      id: `ai-${Date.now()}-${index}`,
      text: item.text.trim(),
      section: typeof item.section === "string" ? item.section : "general",
      source: "ai",
    }));
}