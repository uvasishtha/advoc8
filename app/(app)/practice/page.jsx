"use client";

import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FeatureLock } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Disclaimer } from "@/components/ui/Notice";
import { PracticeChat } from "@/components/practice/PracticeChat";
import { useBriefDraft } from "@/lib/use-brief-draft";

export default function PracticePage() {
  const { isReady, report, access } = useAdvoc8();
  const { draft } = useBriefDraft();

  const isLocked = !access.features[FEATURE_IDS.PRACTICE].unlocked;

  return (
    <PageContainer className="space-y-6">
      <header>
        <p className="eyebrow">Practice</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
          Practise the appointment
        </h1>
        <p className="hint mt-1.5 max-w-prose">
          {isLocked
            ? access.features[FEATURE_IDS.PRACTICE].message
            : "Say it out loud before you have to. The interviewer works only from your Evidence Brief and asks you to put your own experience into words."}
        </p>
      </header>

      <FeatureLock featureId={FEATURE_IDS.PRACTICE}>
        {isReady ? <PracticeChat report={report} questions={draft.questions} /> : <div className="skeleton h-[32rem] w-full" />}
      </FeatureLock>

      <Disclaimer>
        Advoc8&rsquo;s practice mode is a communication aid. It will not name a condition, suggest a
        treatment, or tell you what is causing your symptoms.
      </Disclaimer>
    </PageContainer>
  );
}