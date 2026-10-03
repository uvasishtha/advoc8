import { buildFallbackQuestions, callGemini, isAiConfigured, normaliseQuestions } from "@/lib/ai/gemini";
import { QUESTION_SYSTEM_PROMPT, buildQuestionPrompt } from "@/lib/ai/prompts";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { report, statement } = body ?? {};

  if (!report || report.isEmpty) {
    return Response.json({ questions: buildFallbackQuestions(report), source: "fallback" });
  }

  if (!isAiConfigured()) {
    return Response.json({ questions: buildFallbackQuestions(report), source: "fallback" });
  }

  try {
    const payload = await callGemini({
      system: QUESTION_SYSTEM_PROMPT,
      prompt: buildQuestionPrompt(report, statement),
    });

    const questions = normaliseQuestions(payload);

    if (questions.length === 0) {
      return Response.json({ questions: buildFallbackQuestions(report), source: "fallback" });
    }

    return Response.json({ questions, source: "gemini" });
  } catch (error) {
    console.error("Question generation failed, using fallback:", error?.message ?? error);
    return Response.json({ questions: buildFallbackQuestions(report), source: "fallback" });
  }
}