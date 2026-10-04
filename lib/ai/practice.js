import { roundTo, formatDate, formatDuration } from "@/lib/format";

export const PRACTICE_STAGES = [
  "opening",
  "history",
  "frequency",
  "severity",
  "duration",
  "impact",
  "wrapup",
];

/**
 * Scripted clinician used when no model is configured.
 *
 * It follows the same arc the prompt describes and quotes the user's own brief
 * back at them. Two jobs: get the experience into whole sentences, and reach for
 * the gaps their brief has flagged. The second is the one the script used to be
 * missing, and it is the whole reason the gaps section exists.
 */
export function fallbackReply(report, turnIndex) {
  if (!report || report.isEmpty) {
    return {
      reply:
        "Let's start simply: in your own words, what has been going on? There is no right way to say it.",
      stage: "opening",
    };
  }

  const lead = report.symptoms[0];
  const gaps = report.gaps.filter((gap) => !gap.isClear);
  const stage = PRACTICE_STAGES[Math.min(turnIndex, PRACTICE_STAGES.length - 1)];

  switch (stage) {
    case "opening":
      return {
        reply:
          "Imagine you've just sat down with your doctor. In your own words, tell me what's been happening.",
        stage,
      };

    case "history":
      return {
        reply: gaps.some((gap) => gap.id === "start")
          ? "Before we go further — when did this first start? Not exactly, just roughly."
          : `When did you first notice this? Your record starts on ${formatDate(
              lead.firstSeen,
            )}. Does that line up with what you remember?`,
        stage,
      };

    case "frequency":
      return {
        reply: `How often is it happening? Your records show ${lead.name.toLowerCase()} on ${lead.daysReported} of the ${report.range.totalDays} days you tracked. Does that match how it felt?`,
        stage,
      };

    case "severity":
      return {
        reply: `How severe does it usually feel? You've been rating ${lead.name.toLowerCase()} an average of ${roundTo(lead.avgSeverity)} out of 10, with a high of ${lead.maxSeverity}. What does an average day look like at that number?`,
        stage,
      };

    case "duration":
      return {
        reply: `How long does it last each time?${
          lead.avgDurationMinutes
            ? ` Your entries average ${formatDuration(lead.avgDurationMinutes)}.`
            : ""
        } Does it run you down afterwards, or do you come out of it?`,
        stage,
      };

    case "impact": {
      const impactGap = gaps.find((gap) => gap.id === "impact" || gap.id === "cost");

      return {
        reply: impactGap
          ? `${impactGap.ask} Take the worst day you can remember — what did you have to give up that day?`
          : `And how is it affecting your day-to-day life? Across this period you logged ${report.context.lowSleepDays} nights under six hours and ${report.context.highStressDays} high-stress days. Has that changed what you can do?`,
        stage,
      };
    }

    default:
      return {
        reply:
          "That's the shape of it. If you put it that way at your appointment, it will be hard for anyone to brush off. What is the one thing you most want them to do differently?",
        stage,
      };
  }
}

export function normaliseReply(payload) {
  const reply = typeof payload?.reply === "string" ? payload.reply.trim() : "";
  const stage =
    typeof payload?.stage === "string" && PRACTICE_STAGES.includes(payload.stage)
      ? payload.stage
      : "opening";

  if (!reply) return null;

  return { reply, stage };
}