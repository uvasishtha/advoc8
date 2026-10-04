"use client";

import { ArrowLeft } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Disclaimer } from "@/components/ui/Notice";
import { PracticeChat } from "@/components/practice/PracticeChat";
import { ConnectionsToBringUp } from "@/components/brief/ConnectionsToBringUp";

/**
 * Practice your conversation.
 *
 * The last step of the prepare flow, not a place you live, so the back link to
 * the brief is deliberate.
 */
export default function PracticePage() {
  const { isReady, report, draft, connections } = useAdvoc8();

  return (
    <PageContainer className="max-w-4xl space-y-6">
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
          Advoc8 plays the clinician and works only from your brief. It asks you to put your
          experience into sentences, and it asks about the details your entries have not captured
          yet.
        </p>
      </header>

      {isReady ? (
        <div className="space-y-6">
          <ConnectionsToBringUp connections={connections} />
          <PracticeChat report={report} questions={draft.questions} connections={connections} />
        </div>
      ) : null}

      <Disclaimer>
        This is a communication aid, not a consultation. Advoc8 will not name a condition, suggest a
        treatment, or tell you what is causing your symptoms — and neither should you expect it to
        agree with whatever you tell it.
      </Disclaimer>
    </PageContainer>
  );
}