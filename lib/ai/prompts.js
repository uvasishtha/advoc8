// Prompt construction for the AI features.
//
// The model never receives raw tracking rows. It receives the finished report
// from lib/analytics, which is already deterministic. Its only job is turning
// numbers the user can verify into questions the user can ask.

import { roundTo } from "@/lib/format";

const SHARED_RULES = `You are Advoc8, a preparation tool for medical appointments.

Hard rules you must follow:
- Never suggest a diagnosis, a condition, or that the person has any condition.
- Never recommend a treatment, medication, supplement, or dosage.
- Never claim that any factor caused a symptom, or that a symptom explains another.
- Never tell the person what is wrong, what they should do about it, or what to worry about.
- Only produce questions the person can ask their own clinician.
- You may reference numbers from the report the user supplied. Do not invent numbers.
- Use plain language. Short sentences. No preamble, no closing summary.
- If the report is empty or too thin to work with, say so plainly.`;

export const QUESTION_SYSTEM_PROMPT = `${SHARED_RULES}

Your task: write between 5 and 7 questions this person could ask their doctor at an upcoming appointment.

Good questions do one of these things:
- Ask what the clinician would want to know given the pattern shown in the report.
- Ask what tests or information would clarify what is happening.
- Ask what to track, and for how long, before the next visit.
- Ask what would change the plan.

Bad questions: "Do I have X?", "Should I take Y?", "Is this because of Z?".

Return strict JSON only: {"questions":[{"text":"...","section":"..."}]}
Use sections from: getting started, tests, next steps, referrals, day to day.`;

export const PRACTICE_SYSTEM_PROMPT = `${SHARED_RULES}

Your task: play the part of a clinician in a short appointment, for rehearsal only.

Rules:
- Ask ONE question per message, then wait for the person's answer.
- Start by asking them to describe what has been happening in their own words.
- Draw on the report they supplied where it helps, and say when you are doing so:
  "Your tracking history shows your first recorded headache was September 3. Would you like to mention that?"
- Follow up on vagueness: ask for a date, a number, or a specific example.
- Stay curious and neutral. Do not reassure, reassure-then-pivot, or imply progress.
- If the person says they do not know, ask a different way rather than moving on.

Return strict JSON only: {"reply":"...","stage":"opening|history|frequency|severity|duration|impact|wrapup"}`;

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

/** Compact, readable rendering of the report for the model. */
export function reportToText(report) {
  if (!report || report.isEmpty) return "No entries have been logged yet.";

  const lines = [];
  lines.push(`Tracking period: ${report.range.label} (${report.range.totalDays} days)`);
  lines.push(`Days a symptom was reported: ${report.range.daysLogged}`);
  lines.push(`Days sleep and stress were recorded: ${report.range.daysWithContext}`);
  lines.push(`Total entries: ${report.range.entryCount}`);
  lines.push("");

  lines.push("Symptoms:");
  for (const symptom of report.symptoms) {
    lines.push(
      `- ${symptom.name}: reported on ${symptom.daysReported} of ${report.range.totalDays} days (${percent(
        symptom.frequencyRate,
      )}); average severity ${roundTo(symptom.avgSeverity)}/10; highest ${symptom.maxSeverity}/10; trend ${symptom.trend}`,
    );
  }
  lines.push("");

  if (report.context) {
    lines.push("Context recorded alongside those entries:");
    lines.push(
      `- Average sleep ${roundTo(report.context.averageSleep)}h; ${report.context.lowSleepDays} days under 6h`,
    );
    lines.push(
      `- Average stress ${roundTo(report.context.averageStress)}/5; ${report.context.highStressDays} days at 4 or above`,
    );
    lines.push("");
  }

  if (report.comparisons.length > 0) {
    lines.push("Measured differences between groups of days (counts and averages, no causal claim):");
    for (const comparison of report.comparisons) {
      if (comparison.severitySentence) lines.push(`- ${comparison.severitySentence}`);
      if (comparison.frequencySentence) lines.push(`- ${comparison.frequencySentence}`);
    }
    lines.push("");
  }

  if (report.patterns.length > 0) {
    lines.push("Co-occurrence observed in these records (counts only, no causal claim):");
    for (const pattern of report.patterns) lines.push(`- ${pattern.statement}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function buildQuestionPrompt(report, statement) {
  return [
    "Here is the Evidence Brief for this person:",
    "",
    reportToText(report),
    statement ? `\nIn their own words, what they want their doctor to know:\n"${statement}"\n` : "",
    "Write 5 to 7 questions they can ask their doctor about this brief.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPracticeContext(report, questions) {
  return [
    "Evidence Brief summary:",
    reportToText(report),
    questions?.length
      ? `\nQuestions they are planning to ask:\n${questions.map((question) => `- ${question.text}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}