"use client";

import { ArrowLeft } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { FeatureLock } from "@/components/onboarding/FeatureLock";
import { FEATURE_IDS } from "@/lib/onboarding";
import { Disclaimer } from "@/components/ui/Notice";
import { PracticeChat } from "@/components/practice/PracticeChat";

/**
 * Practice your conversation.
 *
 * Reached from Prepare rather than from the nav, because the rehearsal is only
 * worth doing once there is a brief to rehearse from. The back link is
 * deliberate: this is the last step of the prepare flow, not a place you live.
 */
export default function PracticePage() {
  const { isReady, report, access, draft } = useAdvoc8();

  const isLocked = !access.features[FEATURE_IDS.PRACTICE].unlocked;

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <a
        href="/prepare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to your Evidence Brief
      </a>

      <header>
        <p className="eyebrow">Prepare</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
          Practice your conversation
        </h1>
        <p className="hint mt-1.5 max-w-prose">
          {isLocked
            ? access.features[FEATURE_IDS.PRACTICE].message
            : "Advoc8 plays the clinician and works only from your brief. It asks you to put your experience into sentences, and it asks about the details your entries have not captured yet."}
        </p>
      </header>

      <FeatureLock featureId={FEATURE_IDS.PRACTICE}>
        {isReady ? (
          <PracticeChat report={report} questions={draft.questions} />
        ) : null}
      </FeatureLock>

      <Disclaimer>
        This is a communication aid, not a consultation. Advoc8 will not name a condition, suggest a
        treatment, or tell you what is causing your symptoms — and neither should you expect it to
        agree with whatever you tell it.
      </Disclaimer>
    </PageContainer>
  );
}