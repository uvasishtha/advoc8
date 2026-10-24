"use client";

import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Notice";
import { ExperiencingSection, NoticedSection, GapsSection } from "@/components/brief/ReportSections";
import { ConnectionsToBringUp } from "@/components/brief/ConnectionsToBringUp";
import { StatementSection, QuestionsSection } from "@/components/brief/EditableSections";
import { PrintDoctorSummaryButton } from "@/components/brief/PrintDoctorSummaryButton";
import { findSymptomConnections } from "@/lib/analytics/connections";
import { useBriefDraft } from "@/lib/use-brief-draft";

export default function PreparePage() {
  const {
    isReady,
    user,
    report,
    symptomEntries = [],
    contextEntries = [],
  } = useAdvoc8();

  const {
    draft,
    setStatement,
    setQuestions,
  } = useBriefDraft();

  if (!isReady) {
    return (
      <PageContainer>
        <p className="hint">Loading your Evidence Brief…</p>
      </PageContainer>
    );
  }

  const connections = findSymptomConnections({
    symptomEntries,
    contextEntries,
  });

  return (
    <PageContainer className="max-w-4xl space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Prepare</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
            Your Evidence Brief
          </h1>
          <p className="hint mt-2 max-w-prose">
            A summary of what you have recorded, what you have noticed, and
            what you may want to discuss at your appointment.
          </p>
        </div>

        <PrintDoctorSummaryButton
          report={report}
          user={user}
          draft={draft}
          connections={connections}
        />
      </header>

      <Card className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="eyebrow">01 · Your record</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            What I have been experiencing
          </h2>
        </div>
        <ExperiencingSection report={report} user={user} />
      </Card>

      <section className="space-y-5">
        <div>
          <p className="eyebrow">02 · Observations</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            What I have noticed
          </h2>
        </div>
        <NoticedSection report={report} />
      </section>

      <section className="space-y-5">
        <div>
          <p className="eyebrow">03 · Appointment preparation</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            What I want to discuss
          </h2>
        </div>
        <StatementSection
          value={draft.statement}
          onChange={setStatement}
        />
        <GapsSection report={report} />
      </section>

      <section className="space-y-5">
        <div>
          <p className="eyebrow">04 · Questions</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            Questions for my doctor
          </h2>
        </div>
        <QuestionsSection
          questions={draft.questions ?? []}
          onChange={setQuestions}
          report={report}
        />
      </section>

      <section className="space-y-5">
        <div>
          <p className="eyebrow">05 · Patterns</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            Patterns worth discussing
          </h2>
        </div>
        <ConnectionsToBringUp connections={connections} />
      </section>

      <Disclaimer>
        This brief summarizes your own tracking records. It does not diagnose
        conditions or establish what caused your symptoms. Review it and correct
        anything that does not reflect your experience before sharing it.
      </Disclaimer>
    </PageContainer>
  );
}
