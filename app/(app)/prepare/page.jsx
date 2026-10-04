"use client";

import { FileText, MessagesSquare } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FeatureLock } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/Notice";
import { AppointmentGoal } from "@/components/brief/AppointmentGoal";
import { QuestionsSection, StatementSection } from "@/components/brief/EditableSections";
import { ExperiencingSection, GapsSection, NoticedSection } from "@/components/brief/ReportSections";

/**
 * The Evidence Brief, under the name for what it is actually for.
 *
 * Everything below this heading is the artefact a person takes into the room,
 * so it is ordered the way the appointment goes: what I am here to say, what my
 * record shows, what I have not said yet, what I want discussed, and what I
 * need answered.
 */
export default function PreparePage() {
  const {
    isReady,
    report,
    user,
    access,
    draft,
    setStatement,
    setAppointmentGoal,
    setQuestions,
    toggleGoal,
  } = useAdvoc8();

  if (!isReady) return null;

  const isLocked = !access.features[FEATURE_IDS.BRIEF].unlocked;

  return (
    <PageContainer className="max-w-3xl space-y-12">
      <header>
        <p className="eyebrow">Evidence Brief</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
          Prepare for your appointment
        </h1>
        <p className="hint mt-1.5 max-w-prose">
          {isLocked
            ? access.features[FEATURE_IDS.BRIEF].message
            : "Your own record, in the order you will want it: what you have been experiencing, what your entries show, and what is still missing from the story."}
        </p>
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
          <div className="space-y-12">
            <AppointmentGoal
              value={draft.appointmentGoal}
              selected={draft.goalIds}
              onToggle={toggleGoal}
              onChange={setAppointmentGoal}
            />

            <p className="hint">{report.readiness.note}</p>

            <Section
              number="01"
              title="What I've been experiencing"
              description="Your concern in your own words, then what you recorded."
            >
              <ExperiencingSection report={report} user={user} />
            </Section>

            <Section
              number="02"
              title="What I've noticed"
              description="The few things your record shows that are worth saying out loud."
            >
              <NoticedSection report={report} />
            </Section>

            <Section
              number="03"
              title="Make sure I mention…"
              description="What your record does not say yet, and what a clinician will probably ask about."
            >
              <GapsSection report={report} />
            </Section>

            <Section
              number="04"
              title="What I want to discuss"
              description="Your words. This is the part a clinician reads first."
            >
              <StatementSection value={draft.statement} onChange={setStatement} />
            </Section>

            <Section
              number="05"
              title="Questions for my doctor"
              description="Built from this brief. Edit, delete or add your own — the ones you would actually ask are the ones worth taking in."
            >
              <QuestionsSection questions={draft.questions} onChange={setQuestions} report={report} />
            </Section>

            <PracticeCallout locked={!access.features[FEATURE_IDS.PRACTICE].unlocked} />
          </div>
        )}
      </FeatureLock>
    </PageContainer>
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
      className="rounded-2xl border border-accent-muted bg-accent-soft/50 px-5 py-7 sm:px-7"
    >
      <MessagesSquare size={20} className="text-accent-strong" aria-hidden="true" />
      <h2 id="practice-heading" className="mt-3 font-serif text-2xl font-semibold text-foreground">
        Practice your conversation
      </h2>
      <p className="mt-2 max-w-prose leading-relaxed text-foreground">
        Say it out loud once before you have to. Advoc8 plays the clinician, works only from the
        brief above, and asks you to put your experience into sentences. It will ask about the
        details you have not written down yet.
      </p>
      <div className="mt-5">
        {locked ? (
          <Button variant="outline" disabled>
            Log two entries to unlock practice
          </Button>
        ) : (
          <Button href="/practice">Practice your conversation</Button>
        )}
      </div>
    </section>
  );
}