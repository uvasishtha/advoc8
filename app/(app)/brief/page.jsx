"use client";

import { FileText, Lock, Printer } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FeatureLock } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/Notice";
import { Disclaimer } from "@/components/ui/Notice";
import { useBriefDraft } from "@/lib/use-brief-draft";
import {
  ChangesSection,
  OverviewSection,
  PatternsSection,
  TimelineSection,
  TrendsSection,
} from "@/components/brief/ReportSections";
import { QuestionsSection, StatementSection } from "@/components/brief/EditableSections";
import { BeforeAppointment } from "@/components/brief/BeforeAppointment";

function BriefSkeleton() {
  return (
    <PageContainer className="space-y-8">
      <div className="skeleton h-9 w-72" />
      <div className="skeleton h-32 w-full" />
      <div className="skeleton h-64 w-full" />
    </PageContainer>
  );
}

export default function BriefPage() {
  const { isReady, report, user, access } = useAdvoc8();
  const { draft, isReady: isDraftReady, setStatement, setAppointmentGoal, setQuestions } =
    useBriefDraft();

  if (!isReady) return <BriefSkeleton />;

  const isLocked = !access.features[FEATURE_IDS.BRIEF].unlocked;

  return (
    <PageContainer className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            Evidence Brief
            {isLocked ? <Lock size={13} aria-hidden="true" /> : null}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
            {isLocked || report.isEmpty ? "Evidence Brief" : report.range.label}
          </h1>
          <p className="hint mt-1.5 max-w-prose">
            {isLocked ? access.features[FEATURE_IDS.BRIEF].message : report.coverage}
          </p>
        </div>
        {!isLocked && !report.isEmpty ? (
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{report.range.entryCount} entries</Badge>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer size={15} aria-hidden="true" />
              Print
            </Button>
          </div>
        ) : null}
      </header>

      <FeatureLock featureId={FEATURE_IDS.BRIEF}>
        <div className="space-y-12">
          {report.isEmpty ? (
            <EmptyState
              icon={FileText}
              title="Your brief is empty"
              description="The Evidence Brief is built entirely from entries you log. Add a few and it will fill in."
              action={<Button href="/track">Log a symptom</Button>}
            />
          ) : (
            <>
              <p className="hint">{report.readiness.note}</p>

              <Disclaimer>
                Every number below is calculated from entries you logged. Nothing here is a
                diagnosis, and nothing here says what caused anything. Bring it to a clinician and
                let them interpret it.
              </Disclaimer>

              <Section number={1} title="What I've Been Experiencing">
                <OverviewSection report={report} user={user} />
              </Section>

              <Section
                number={2}
                title="Symptom Timeline"
                description="Every day you recorded something, and what you recorded."
              >
                <TimelineSection report={report} />
              </Section>

              <Section
                number={3}
                title="Quantitative Trends"
                description="Counts and averages, with the underlying dates visible."
              >
                <TrendsSection report={report} />
              </Section>

              <Section
                number={4}
                title="Patterns in My Data"
                description="Things that kept showing up together. Co-occurrence, not cause."
              >
                <PatternsSection report={report} />
              </Section>

              <Section
                number={5}
                title="Changes Over Time"
                description="First half of the period compared with the second half."
              >
                <ChangesSection report={report} />
              </Section>

              <Section
                number={6}
                title="What I Want My Doctor to Know"
                description="Your words, not generated ones. Edit it any time."
              >
                <StatementSection value={draft.statement} onChange={setStatement} />
              </Section>

              <Section
                number={7}
                title="Questions I Want to Ask"
                description="Generated from this brief. Edit, delete or add your own — yours is what gets printed."
              >
                {isDraftReady ? (
                  <QuestionsSection
                    questions={draft.questions}
                    onChange={setQuestions}
                    report={report}
                  />
                ) : (
                  <div className="skeleton h-40 w-full" />
                )}
              </Section>

              <BeforeAppointment
                report={report}
                user={user}
                statement={draft.statement}
                questions={draft.questions}
                appointmentGoal={draft.appointmentGoal}
                onAppointmentGoalChange={setAppointmentGoal}
              />
            </>
          )}
        </div>
      </FeatureLock>
    </PageContainer>
  );
}