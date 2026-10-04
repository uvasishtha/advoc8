"use client";

import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Notice";
import { formatDate, formatDuration } from "@/lib/format";

/**
 * Home.
 *
 * One thing to do: review the brief. Everything else on this page exists to
 * answer the two questions that decide whether someone bothers — what is this,
 * and what is in it if I open it now.
 */
export default function HomePage() {
  const { isReady, user, report, symptomEntries, resetToSampleData } = useAdvoc8();

  if (!isReady) return null;

  const lead = report.headline?.leadSymptom;

  const recent = [...symptomEntries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.severity - a.severity)
    .slice(0, 3);

  return (
    <PageContainer className="max-w-3xl space-y-12">
      <header className="space-y-5">
        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          Prepare for your next appointment.
        </h1>
        <p className="max-w-prose text-lg leading-relaxed text-muted">
          Your health experiences are worth documenting. Keep the record as it happens, and walk in
          with something concrete instead of a feeling you cannot quite explain.
        </p>

        {report.isEmpty ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/track" size="lg">
              <NotebookPen size={17} aria-hidden="true" />
              Track a symptom
            </Button>
            <Button href="/setup" variant="outline" size="lg">
              Tell Advoc8 what to track
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/prepare" size="lg">
              Review your Evidence Brief
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button href="/track" variant="outline" size="lg">
              Track a symptom
            </Button>
          </div>
        )}

        <p className="hint">
          {report.isEmpty
            ? `Nothing logged yet${
                user.firstName ? `, ${user.firstName}` : ""
              }. The brief builds itself from whatever you record.`
            : `${report.range.label} · ${report.range.entryCount} ${
                report.range.entryCount === 1 ? "entry" : "entries"
              }${lead ? ` · most often ${lead.toLowerCase()}` : ""}`}
        </p>
      </header>

      {report.isEmpty ? (
        <SampleCard onOpenSample={() => resetToSampleData({ unlock: true })} />
      ) : (
        <section aria-labelledby="recent">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="recent" className="font-serif text-xl font-semibold">
              Recent entries
            </h2>
            <Link href="/track" className="text-sm font-medium text-accent-strong hover:underline">
              See all {symptomEntries.length}
            </Link>
          </div>

          <ul className="space-y-2.5">
            {recent.map((entry) => (
              <li key={entry.id}>
                <Card className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3.5">
                  <span className="font-medium text-foreground">{entry.symptom}</span>
                  <span className="text-sm text-muted">
                    {formatDate(entry.date)} · {formatDuration(entry.duration_minutes)} ·{" "}
                    <span className="tabular-nums">{entry.severity}/10</span>
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclaimer>
        Advoc8 organises what you record and helps you prepare. It does not diagnose conditions,
        suggest treatments, or say what caused your symptoms. Deciding what any of it means is a
        conversation for a clinician who can examine you.
      </Disclaimer>
    </PageContainer>
  );
}

/**
 * The empty state has one job: show that there is already something to look at,
 * so nobody has to log a fortnight before they can judge whether this is worth
 * their time.
 */
function SampleCard({ onOpenSample }) {
  return (
    <Card tone="soft" className="p-5 sm:p-6">
      <h2 className="font-serif text-xl font-semibold text-foreground">Nothing tracked yet</h2>
      <p className="mt-1.5 max-w-prose leading-relaxed text-foreground">
        Log a symptom to start your own record — or open a month of sample tracking to see what
        the brief looks like once there is something in it.
      </p>
      <div className="mt-5">
        <Button variant="outline" onClick={onOpenSample}>
          Open the sample brief
        </Button>
      </div>
      <p className="hint mt-4">
        The sample is one month of a fictional user, Maya R. Opening it replaces anything in this
        browser; you can undo it from Settings.
      </p>
    </Card>
  );
}