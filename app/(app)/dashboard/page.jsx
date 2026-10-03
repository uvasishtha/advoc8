"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Lock, NotebookPen, Sparkle } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { GatedButton } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stat, StatGrid } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Notice";
import { Disclaimer } from "@/components/ui/Notice";
import { SeverityTrendChart } from "@/components/charts/Charts";
import { formatDate, formatDuration, roundTo, todayIso } from "@/lib/format";

function DashboardSkeleton() {
  return (
    <PageContainer className="space-y-8">
      <div className="space-y-3">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
      <StatGrid>
        {[0, 1, 2].map((key) => (
          <div key={key} className="skeleton h-24" />
        ))}
      </StatGrid>
      <div className="skeleton h-64 w-full" />
    </PageContainer>
  );
}

export default function DashboardPage() {
  const { user, isReady, report, symptomEntries, access } = useAdvoc8();

  if (!isReady) return <DashboardSkeleton />;

  const today = todayIso();
  const loggedToday = symptomEntries.filter((entry) => entry.date === today);
  const lead = report.symptoms[0] ?? null;
  const briefLocked = !access.features[FEATURE_IDS.BRIEF].unlocked;
  const practiceLocked = !access.features[FEATURE_IDS.PRACTICE].unlocked;
  const trendsLocked = !access.features[FEATURE_IDS.TRENDS].unlocked;

  const trendSeries = report.symptoms.slice(0, 3).map((symptom) => ({
    name: symptom.name,
    points: symptom.dailySeries.map((day) => ({
      date: day.date,
      value: day.severity,
    })),
  }));

  const recent = [...symptomEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  if (report.isEmpty) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold">{user.greeting}</h1>
          <p className="hint mt-1">Nothing logged yet. Your Evidence Brief builds itself as you track.</p>
        </div>
        <EmptyState
          icon={NotebookPen}
          title="Your record is empty"
          description="Log your first symptom to start building the record you will bring to your doctor."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/track">Log a symptom</Button>
              <Button href="/settings" variant="outline">
                Load sample data
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <header>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">{user.greeting}</h1>
        <p className="hint mt-1.5">{report.coverage}</p>
      </header>

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
                ? access.features[FEATURE_IDS.BRIEF].message
                : `${report.range.entryCount} entries across ${report.range.daysLogged} days`}
            </p>
          </div>
          <GatedButton featureId={FEATURE_IDS.BRIEF} href="/brief">
            {briefLocked ? (
              <Lock size={16} aria-hidden="true" />
            ) : (
              <ArrowRight size={16} aria-hidden="true" />
            )}
            View Evidence Brief
          </GatedButton>
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
            <h2 className="mt-1 font-serif text-xl font-semibold">
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
            <h2 className="mt-1 font-serif text-xl font-semibold">Rehearse before you go in</h2>
            <p className="hint mt-1">
              {practiceLocked
                ? access.features[FEATURE_IDS.PRACTICE].message
                : "Practise explaining your experience with an assistant that only uses your own records."}
            </p>
          </div>
          <GatedButton
            featureId={FEATURE_IDS.PRACTICE}
            href="/practice"
            variant="outline"
            className="self-start"
          >
            {practiceLocked ? (
              <Lock size={16} aria-hidden="true" />
            ) : (
              <Sparkle size={16} aria-hidden="true" />
            )}
            Practice with Advoc8
          </GatedButton>
        </Card>
      </div>

      {trendSeries.length > 0 ? (
        <section aria-labelledby="recent-trend">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="recent-trend" className="flex items-center gap-2 font-serif text-xl font-semibold">
                Severity across the period
                {trendsLocked ? <Lock size={15} className="text-muted" aria-hidden="true" /> : null}
              </h2>
              <p className="hint">Highest severity recorded on each day you logged a symptom.</p>
            </div>
            <Badge tone="outline">
              <CalendarDays size={13} aria-hidden="true" />
              {report.range.label}
            </Badge>
          </div>
          <Card className="p-5">
            {trendsLocked ? (
              <p className="py-10 text-center text-sm leading-relaxed text-muted">
                <Lock size={16} className="mx-auto mb-3 text-accent-strong" aria-hidden="true" />
                {access.features[FEATURE_IDS.TRENDS].message}
                <span className="mt-3 block">
                  <Button href="/setup" size="sm">
                    Complete Setup
                  </Button>
                </span>
              </p>
            ) : (
              <SeverityTrendChart series={trendSeries} height={240} />
            )}
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="recent-entries">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 id="recent-entries" className="font-serif text-xl font-semibold">
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
                    <span className="font-serif text-xl font-semibold tabular-nums text-accent-strong">
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