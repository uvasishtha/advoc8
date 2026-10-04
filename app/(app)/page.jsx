"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Lock, NotebookPen, Sparkle } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stat, StatGrid } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Disclaimer } from "@/components/ui/Notice";
import { StreakPanel } from "@/components/streak/StreakPanel";
import { SeverityTrendChart } from "@/components/charts/Charts";
import { buildStreak } from "@/lib/streak";
import { formatDate, formatDuration, roundTo, todayIso } from "@/lib/format";

/**
 * Home — the dashboard.
 *
 * The answer to "is this working, and is it worth reading?" in one screen:
 * today's check-in, the brief waiting to be read, the shape of the record over
 * the period, and the last few entries. Everything here is a count, an average
 * or a line the user can check against their own log.
 *
 * The chart is the one place a graph earns its keep. It shows the record as
 * recorded — gaps stay gaps, several logs in a day collapse to the worst of
 * them — so it cannot be read as a finding. Everything interpretive lives in the
 * brief, in sentences, with its caveats attached.
 */
export default function HomePage() {
  const { isReady, user, report, symptomEntries, access, resetToSampleData } = useAdvoc8();

  if (!isReady) return null;

  const today = todayIso();
  const loggedToday = symptomEntries.filter((entry) => entry.date === today);
  const lead = report.symptoms[0] ?? null;

  const briefAccess = access.features[FEATURE_IDS.BRIEF];
  const practiceAccess = access.features[FEATURE_IDS.PRACTICE];
  const briefLocked = !briefAccess.unlocked;
  const practiceLocked = !practiceAccess.unlocked;

  // Same entries, same rules as the track page. Reads nothing new.
  const streak = buildStreak(symptomEntries, today);

  const recent = [...symptomEntries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.severity - a.severity)
    .slice(0, 4);

  const trendSeries = report.symptoms.slice(0, 3).map((symptom) => ({
    name: symptom.name,
    points: symptom.dailySeries.map((day) => ({ date: day.date, value: day.severity })),
  }));

  if (report.isEmpty) {
    return (
      <PageContainer className="max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">{user.greeting}</h1>
          <p className="hint mt-1">
            Nothing logged yet. Your Evidence Brief builds itself as you track.
          </p>
        </div>

        <EmptyState
          icon={NotebookPen}
          title="Your record is empty"
          description="Log your first symptom to start building the record you will bring to your doctor."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/track">Log a symptom</Button>
              <Button onClick={() => resetToSampleData({ unlock: true })} variant="outline">
                Open the sample brief
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-5xl space-y-8">
      <header>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">{user.greeting}</h1>
        <p className="hint mt-1">{report.coverage}</p>
      </header>

      {streak.hasStreak ? <StreakPanel streak={streak} /> : null}

      <Card tone="soft" className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-accent-strong">
              {briefLocked ? (
                <Lock size={16} aria-hidden="true" />
              ) : (
                <FileText size={16} aria-hidden="true" />
              )}
              Your Evidence Brief
            </p>
            <p className="mt-1 font-serif text-2xl font-semibold text-foreground">
              {briefLocked ? "Not generated yet" : report.range.label}
            </p>
            <p className="hint mt-1">
              {briefLocked
                ? briefAccess.message
                : `${report.range.entryCount} entries on ${report.range.daysLogged} of ${report.range.totalDays} days`}
            </p>
          </div>

          {briefLocked ? (
            <Button href={briefAccess.action.href} variant="outline" className="self-start">
              <Lock size={16} aria-hidden="true" />
              {briefAccess.action.label}
            </Button>
          ) : (
            <Button href="/prepare" className="self-start">
              View Evidence Brief
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          )}
        </div>

        <StatGrid columns={3} className="mt-6">
          {report.symptoms.slice(0, 2).map((symptom) => (
            <Stat
              key={symptom.name}
              tone="accent"
              value={symptom.daysReported}
              unit="days"
              label={symptom.name}
              hint={`${roundTo(symptom.avgSeverity)} / 10 average`}
            />
          ))}
          <Stat
            value={lead ? roundTo(lead.avgSeverity) : "—"}
            unit="/ 10"
            label={lead ? `Average ${lead.name.toLowerCase()} severity` : "Average severity"}
            hint={lead ? `Highest recorded ${lead.maxSeverity} / 10` : null}
          />
        </StatGrid>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between gap-5 p-5">
          <div>
            <p className="eyebrow">Today&rsquo;s check-in</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              {loggedToday.length > 0 ? "You logged something today" : "How are you feeling today?"}
            </h2>
            <p className="hint mt-1">
              {loggedToday.length > 0
                ? `${loggedToday.length} ${loggedToday.length === 1 ? "entry" : "entries"} recorded for ${formatDate(today)}.`
                : `Nothing recorded for ${formatDate(today)} yet.`}
            </p>
            {loggedToday.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {loggedToday.slice(0, 3).map((entry) => (
                  <li key={entry.id} className="text-sm text-foreground">
                    <span className="font-medium">{entry.symptom}</span>{" "}
                    <span className="text-muted">
                      {entry.severity}/10 · {formatDuration(entry.duration_minutes)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Button href="/track" variant="outline" className="self-start">
            <NotebookPen size={16} aria-hidden="true" />
            Log symptoms
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-5 p-5">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              Practice
              {practiceLocked ? <Lock size={12} aria-hidden="true" /> : null}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">Rehearse before you go in</h2>
            <p className="hint mt-1">
              {practiceLocked
                ? practiceAccess.message
                : "Practise explaining your experience with an assistant that only uses your own records."}
            </p>
          </div>
          {practiceLocked ? (
            <Button href={practiceAccess.action.href} variant="outline" className="self-start">
              <Lock size={16} aria-hidden="true" />
              {practiceAccess.action.label}
            </Button>
          ) : (
            <Button href="/practice" variant="outline" className="self-start">
              <Sparkle size={16} aria-hidden="true" />
              Practice with Advoc8
            </Button>
          )}
        </Card>
      </div>

      {trendSeries.length > 0 ? (
        <section aria-labelledby="recent-trend">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="recent-trend" className="font-serif text-2xl font-semibold">
                Severity across the period
              </h2>
              <p className="hint">Highest severity recorded on each day you logged a symptom.</p>
            </div>
            <Badge tone="outline">
              <CalendarDays size={13} aria-hidden="true" />
              {report.range.label}
            </Badge>
          </div>
          <Card className="p-5">
            <SeverityTrendChart series={trendSeries} height={240} />
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="recent-entries">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 id="recent-entries" className="font-serif text-2xl font-semibold">
            Most recent entries
          </h2>
          <Link href="/track" className="text-sm font-medium text-accent-strong hover:underline">
            View all
          </Link>
        </div>

        {recent.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recent.map((entry) => (
              <li key={entry.id}>
                <Card className="h-full p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{entry.symptom}</p>
                      <p className="hint">{formatDate(entry.date)}</p>
                    </div>
                    <span className="font-serif text-2xl font-semibold tabular-nums text-accent-strong">
                      {entry.severity}
                      <span className="text-xs font-sans font-normal text-muted"> / 10</span>
                    </span>
                  </div>
                  {entry.notes ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{entry.notes}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={NotebookPen}
            title="No entries yet"
            description="Anything you log will appear here and feed your Evidence Brief."
            action={<Button href="/track">Log a symptom</Button>}
          />
        )}
      </section>

      <Disclaimer>
        <strong className="font-medium text-foreground">Advoc8 does not diagnose.</strong> Everything
        above is a count or an average calculated from entries you logged yourself. It is a record to
        read together, not a conclusion about what is going on.
      </Disclaimer>
    </PageContainer>
  );
}