import { callGemini, isAiConfigured } from "@/lib/ai/gemini";
import { PRACTICE_SYSTEM_PROMPT, buildPracticeContext } from "@/lib/ai/prompts";
import { fallbackReply, normaliseReply } from "@/lib/ai/practice";

const MAX_HISTORY = 16;

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { report, messages = [], turnIndex = 0, questions = [], connections = [] } = body ?? {};

  if (!isAiConfigured()) {
    return Response.json({ ...fallbackReply(report, turnIndex), source: "fallback" });
  }

  // Send the brief once, then a trimmed transcript so the conversation stays
  // focused and the request stays small.
  const transcript = messages
    .slice(-MAX_HISTORY)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content ?? "") }],
    }));

  try {
    const payload = await callGemini({
      system: PRACTICE_SYSTEM_PROMPT,
      prompt: [
        buildPracticeContext(report, questions, connections),
        "\nThe rehearsal is already underway. Here is the conversation so far:",
        transcript.map((entry) => `${entry.role === "model" ? "Clinician" : "Patient"}: ${entry.parts[0].text}`).join("\n"),
        "\nClinician:",
      ].join("\n"),
    });

    const parsed = normaliseReply(payload);

    if (!parsed) {
      return Response.json({ ...fallbackReply(report, turnIndex), source: "fallback" });
    }

    return Response.json({ ...parsed, source: "gemini" });
  } catch (error) {
    console.error("Practice turn failed, using fallback:", error?.message ?? error);
    return Response.json({ ...fallbackReply(report, turnIndex), source: "fallback" });
  }
}