"use client";

import { Eye, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Notice";
import { formatDate } from "@/lib/format";

/**
 * 01 — What I've Been Experiencing.
 *
 * The person's own concern, in their own words, followed by one line per
 * symptom. Deliberately a list of sentences rather than a table of metrics:
 * a table invites reading the numbers as findings, and these are not findings.
 */
export function ExperiencingSection({ report, user }) {
  const firstLogged = report.symptoms
    .map((symptom) => symptom.firstSeen)
    .filter(Boolean)
    .sort()[0];

  return (
    <div className="space-y-5">
      {user.concern ? (
        <Card tone="soft" className="p-5 sm:p-6">
          <p className="eyebrow">In your own words</p>
          <p className="mt-1.5 font-serif text-xl leading-relaxed text-foreground">{user.concern}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">{report.range.label}</span> ·{" "}
          {report.range.entryCount} {report.range.entryCount === 1 ? "entry" : "entries"}
        </p>
        {firstLogged ? (
          <p className="text-sm text-muted">First entry {formatDate(firstLogged)}</p>
        ) : null}
      </div>

      <ul className="space-y-2.5">
        {report.experience.map((line) => (
          <li
            key={line}
            className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[0.9375rem] leading-relaxed text-foreground"
          >
            {line}
          </li>
        ))}
      </ul>

      <p className="hint">{report.coverage}</p>
    </div>
  );
}

/**
 * 02 — What I've Noticed.
 *
 * The heart of the brief. Each observation carries its own caveat and its own
 * suggested question, because a pattern without the "this does not establish a
 * cause" line is exactly the sentence the whole product exists to avoid, and a
 * pattern without a question is just information.
 */
export function NoticedSection({ report }) {
  if (report.observations.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="Nothing yet"
        description="Observations appear once a symptom has been recorded on several days. Keep logging and this section fills in on its own."
      />
    );
  }

  return (
    <div className="space-y-5">
      {report.observations.map((observation) => (
        <Card key={observation.kind + observation.statement} className="p-5 sm:p-6">
          <p className="eyebrow">{observation.title}</p>
          <p className="mt-2 font-serif text-lg leading-relaxed text-foreground">
            {observation.statement}
          </p>

          {observation.caveat || observation.ask ? (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {observation.caveat ? (
                <p className="text-sm leading-relaxed text-muted">{observation.caveat}</p>
              ) : null}
              {observation.ask ? (
                <p className="text-sm font-medium leading-relaxed text-accent-strong">
                  {observation.ask}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>
      ))}

      <p className="hint">
        Each of these is a description of what you logged. None of them says what caused
        anything — that is what the appointment is for.
      </p>
    </div>
  );
}

/**
 * 03 — Make Sure I Mention…
 *
 * The section that goes after the record rather than reading it. Everything here
 * is something a clinician asks for and nobody thinks to write down. The list
 * shrinks as the story fills in, which is the behaviour that makes it worth
 * reading twice.
 */
export function GapsSection({ report }) {
  const [onlyGap, ...rest] = report.gaps;
  const isClear = Boolean(onlyGap?.isClear) && rest.length === 0;

  if (isClear) {
    return (
      <Card tone="soft" className="p-5 sm:p-6">
        <p className="eyebrow">Make sure I mention</p>
        <p className="mt-2 font-serif text-lg font-semibold text-foreground">{onlyGap.title}</p>
        <p className="mt-1.5 leading-relaxed text-muted">{onlyGap.detail}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {report.gaps.map((gap) => (
        <Card key={gap.id} className="p-5">
          <div className="flex items-start gap-3">
            <ListChecks size={17} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden="true" />
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground">{gap.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{gap.detail}</p>
              {gap.ask ? (
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{gap.ask}</p>
              ) : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}