"use client";

import { ArrowRight, FileText, MessagesSquare, BarChart2 } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FeatureLock } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/Notice";
import { PrintDoctorSummaryButton } from "@/components/brief/PrintDoctorSummaryButton";
import { QuestionsSection, StatementSection } from "@/components/brief/EditableSections";
import { ExperiencingSection, GapsSection, ConnectionsSection, NoticedSection } from "@/components/brief/ReportSections";
import { ProvenanceLegend } from "@/components/brief/Provenance";
import { SeverityTrendChart } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";

/**
 * Prepare is the product.
 *
 * Everything else in the app exists to fill this page in. It is ordered the way
 * the appointment goes rather than the way the data is stored: what I am here to
 * say, what my record shows, what I have not said yet, what I want discussed, and
 * what I need answered.
 *
 * Two things carry the page. The heading states the job, not the artefact —
 * nobody wants an "Evidence Brief", they want to be ready. And the provenance
 * tags separate what the person wrote from what Advoc8 read back, because the
 * difference between testimony and bookkeeping is the difference between
 * arguing for something you lived and something the app inferred.
 */
export default function PreparePage() {
  const {
    isReady,
    report,
    user,
    access,
    draft,
    connections,
    setStatement,
    setQuestions,
  } = useAdvoc8();

  if (!isReady) return null;

  const briefAccess = access.features[FEATURE_IDS.BRIEF];
  const isLocked = !briefAccess.unlocked;
  const isPracticeLocked = !access.features[FEATURE_IDS.PRACTICE].unlocked;

  // Declared once and rendered three times — as the scan nav, as the sections
  // themselves, and as the practice prompt — so the page cannot drift out of
  // sync with its own table of contents.
  const sections = [
    {
      number: "01",
      title: "What I've been experiencing",
      source: "mixed",
      description: "Your concern in your own words, then what you recorded.",
      body: <ExperiencingSection report={report} user={user} />,
    },
    {
      number: "02",
      title: "What I've noticed",
      source: "record",
      description: "The few things your record shows that are worth saying out loud.",
      body: <NoticedSection report={report} />,
    },
    {
      number: "06",
      title: "Patterns worth discussing",
      source: "record",
      description: "The strongest relationships between your symptoms and the context you have tracked.",
      body: <ConnectionsSection connections={connections} />,
    },
    {
      number: "03",
      title: "Make sure I mention…",
      source: "record",
      description: "What your record does not say yet, and what a clinician will probably ask about.",
      body: <GapsSection report={report} />,
    },
    {
      number: "04",
      title: "What I want to discuss",
      source: "yours",
      description: "Your words. This is the part a clinician reads first.",
      body: <StatementSection value={draft.statement} onChange={setStatement} />,
    },
    {
      number: "05",
      title: "Questions for my doctor",
      source: "yours",
      description:
        "Built from this brief. Edit, delete or add your own — the ones you would actually ask are the ones worth taking in.",
      body: <QuestionsSection questions={draft.questions} onChange={setQuestions} report={report} />,
    },
  ];

  return (
    <PageContainer className="max-w-4xl space-y-10">
      <header className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="eyebrow">Your appointment</p>
            <h1 className="mt-1.5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Prepare for Your Appointment
            </h1>
            <p className="mt-2.5 max-w-prose text-lg leading-relaxed text-muted">
              {isLocked
                ? briefAccess.message
                : "Your record and your own words, in the order you will want them. Read it, edit anything that is not quite right, and take it in."}
            </p>
          </div>

          {report.isEmpty ? null : (
            <div className="flex items-center gap-4">
              <PrintDoctorSummaryButton report={report} user={user} draft={draft} connections={connections} />
              <p className="text-sm text-muted whitespace-nowrap">
                A convenient way to bring your insights to your appointment
              </p>
            </div>
          )}
        </div>

        {report.isEmpty ? null : <BriefFacts report={report} className="mt-2" />}

        {report.isEmpty ? null : <SeverityTrendChartWrapper report={report} />}

        {report.isEmpty ? (
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Button href="/track">
              Track a symptom
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href="/setup" variant="outline">
              Tell Advoc8 what to track
            </Button>
          </div>
        ) : null}
      </header>

<FeatureLock featureId={FEATURE_IDS.BRIEF}>
        {report.isEmpty ? (
          <EmptyState
            icon={FileText}
            title="Nothing to review yet"
            description="Every section of this brief is built from entries you log. Log a few and it fills in on its own."
            action={<Button href="/track">Track a symptom</Button>}
          />
        ) : (
          <div className="space-y-10">
            <ProvenanceLegend className="mb-2" />

            <nav aria-label="Brief sections" className="mb-6">
              <ul className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <li key={section.number}>
                    <a
                      href={`#section-${section.number}`}
                      className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent-muted hover:bg-accent-soft hover:text-accent-strong"
                    >
                      <span aria-hidden="true" className="font-serif text-xs font-semibold">
                        {section.number}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-10">
              {sections.map((section) => (
                <Section
                  key={section.number}
                  number={section.number}
                  title={section.title}
                  description={section.description}
                  source={section.source}
                >
                  {section.body}
                </Section>
              ))}
            </div>

            <PracticeCallout locked={isPracticeLocked} />
          </div>
        )}
      </FeatureLock>
    </PageContainer>
  );
}

/**
 * The three numbers that tell someone whether this brief is worth reading, and
 * whether it is worth reading slowly. Deliberately not a dashboard: a stat tile
 * grid on the front page of the product turns the brief into a report about the
 * report.
 */
function BriefFacts({ report, className }) {
  const facts = [
    ["Tracking", report.range.label],
    ["Entries", String(report.range.entryCount)],
    [
      "Days reported",
      `${report.range.daysLogged} of ${report.range.totalDays}`,
    ],
  ];

  return (
    <dl className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {facts.map(([term, value]) => (
        <div key={term} className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="hint">{term}</dt>
          <dd className="mt-0.5 font-serif text-lg font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Practice lives inside the prepare flow rather than beside it, because the
 * rehearsal is only useful once there is a brief to rehearse from.
 */
function PracticeCallout({ locked }) {
  return (
    <section
      aria-labelledby="practice-heading"
      className={cn(
        "rounded-2xl border border-accent-muted bg-accent-soft/50 px-5 py-6 sm:px-7 sm:py-7",
      )}
    >
      <div className="flex items-start gap-3">
        <MessagesSquare size={20} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h2 id="practice-heading" className="font-serif text-xl font-semibold text-foreground">
            Practice your conversation
          </h2>
          <p className="mt-1.5 max-w-prose leading-relaxed text-foreground text-sm">
            Say it out loud once before you have to. Advoc8 plays the clinician, works only from the
            brief above, and asks you to put your experience into sentences. It will ask about the
            details you have not written down yet.
          </p>
          <div className="mt-4">
            {locked ? (
              <Button variant="outline" disabled className="w-full sm:w-auto">
                Log two entries to unlock practice
              </Button>
            ) : (
              <Button href="/practice" className="w-full sm:w-auto">
                Practice your conversation
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Wrapper that transforms the report's symptom data into the format
 * expected by SeverityTrendChart. Only renders when there's symptom data.
 */
function SeverityTrendChartWrapper({ report }) {
  if (!report.symptoms || report.symptoms.length === 0) return null;

  const series = report.symptoms.map((symptom) => ({
    name: symptom.name,
    points: symptom.dailySeries?.map((point) => ({
      date: point.date,
      value: point.severity,
    })) ?? [],
  }));

  return (
    <section
      aria-labelledby="severity-chart-heading"
      className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-muted" aria-hidden="true" />
          <h2 id="severity-chart-heading" className="font-serif text-lg font-semibold text-foreground">
            Severity over time
          </h2>
        </div>
        <p className="hint text-sm">
          One point per day. Gaps are days nothing was logged.
        </p>
      </div>
      <SeverityTrendChart series={series} height={240} showLegend={true} />
    </section>
  );
}
