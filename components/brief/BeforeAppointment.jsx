"use client";

import { Sparkle, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { DownloadBriefButton } from "@/components/brief/DownloadBriefButton";
import { formatDate, roundTo } from "@/lib/format";

/**
 * Closing section: the one-page summary of everything above, plus the two
 * actions a user takes right before an appointment.
 */
export function BeforeAppointment({ report, user, statement, questions, appointmentGoal, onAppointmentGoalChange }) {
  const lead = report.symptoms[0];
  const topPatterns = report.patterns.slice(0, 3);
  const topComparison = report.comparisons[0] ?? null;

  return (
    <Card tone="soft" className="p-5 sm:p-7">
      <p className="eyebrow">Before my appointment</p>
      <h2 className="mt-1 font-serif text-2xl font-semibold">Everything on one screen</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Key symptoms</h3>
          <ul className="mt-2.5 space-y-2">
            {report.symptoms.slice(0, 4).map((symptom) => (
              <li key={symptom.name} className="rounded-lg bg-surface/70 px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-foreground">{symptom.name}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {symptom.daysReported}d · {roundTo(symptom.avgSeverity)} avg · {symptom.maxSeverity} max
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  First seen {formatDate(symptom.firstSeen)} · {symptom.trend}
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-foreground">Important metrics</h3>
          <ul className="mt-2.5 space-y-1.5">
            <li className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <span className="text-muted">Period covered</span>
              <span className="font-medium text-foreground">{report.range.label}</span>
            </li>
            <li className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <span className="text-muted">Entries logged</span>
              <span className="font-medium text-foreground">{report.range.entryCount}</span>
            </li>
            <li className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <span className="text-muted">Average sleep</span>
              <span className="font-medium text-foreground">
                {roundTo(report.context?.averageSleep)}h · {report.context?.lowSleepDays} short nights
              </span>
            </li>
            <li className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <span className="text-muted">Days reported</span>
              <span className="font-medium text-foreground">
                {report.range.daysLogged} of {report.range.totalDays}
              </span>
            </li>
            <li className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <span className="text-muted">Average stress</span>
              <span className="font-medium text-foreground">
                {roundTo(report.context?.averageStress)}/5 · {report.context?.highStressDays} high days
              </span>
            </li>
            {topComparison ? (
              <li className="rounded-lg bg-surface/70 px-3 py-2 text-sm">
                <p className="text-muted">Biggest measured difference</p>
                <p className="mt-0.5 leading-relaxed text-foreground">{topComparison.headline}</p>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Observed patterns</h3>
          {topPatterns.length > 0 ? (
            <ul className="mt-2.5 space-y-2">
              {topPatterns.map((pattern) => (
                <li key={pattern.id} className="rounded-lg bg-surface/70 px-3 py-2.5 text-sm leading-relaxed text-foreground">
                  {pattern.statement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint mt-2">No overlapping days yet.</p>
          )}

          <h3 className="mt-6 text-sm font-semibold text-foreground">My questions</h3>
          <ol className="mt-2.5 space-y-1.5">
            {(questions.length > 0 ? questions : []).slice(0, 5).map((question, index) => (
              <li key={question.id} className="rounded-lg bg-surface/70 px-3 py-2 text-sm leading-relaxed text-foreground">
                <span className="font-semibold text-accent-strong">{index + 1}.</span> {question.text}
              </li>
            ))}
            {questions.length === 0 ? (
              <li className="hint">No questions added yet. Generate some in section 08.</li>
            ) : null}
          </ol>

          <div className="mt-6">
            <TextArea
              label="My goal for this appointment"
              rows={3}
              value={appointmentGoal}
              onChange={(event) => onAppointmentGoalChange(event.target.value)}
              hint="Say it out loud once before you go in."
            />
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-accent-muted pt-6">
        <DownloadBriefButton
          report={report}
          user={user}
          statement={statement}
          questions={questions}
          appointmentGoal={appointmentGoal}
        />
        <Button href="/practice" variant="outline">
          <Sparkle size={16} aria-hidden="true" />
          Practice with Advoc8
        </Button>
        <Badge tone="outline" className="ml-auto">
          <Target size={13} aria-hidden="true" />
          {lead ? `Lead symptom: ${lead.name}` : "No data yet"}
        </Badge>
      </div>
    </Card>
  );
}