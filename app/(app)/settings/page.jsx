"use client";

import { useState } from "react";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/Field";
import { Disclaimer } from "@/components/ui/Notice";
import { useBriefDraft } from "@/lib/use-brief-draft";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmLabel }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default function SettingsPage() {
  const { user, isReady, report, symptomEntries, contextEntries, resetToSampleData, clearAllEntries } =
    useAdvoc8();
  const { draft, setAppointmentGoal } = useBriefDraft();

  const [pendingAction, setPendingAction] = useState(null);

  function runAction() {
    pendingAction?.run();
    setPendingAction(null);
  }

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Settings</h1>
      </header>

      <Card className="p-5 sm:p-6">
        <CardHeader title="Account" description="This prototype runs on a shared sample account." />
        <dl className="mt-5 space-y-3">
          {[
            ["Name", user.displayName],
            ["Email", user.email],
            ["Account type", "Prototype — sign-in is not enforced"],
          ].map(([term, value]) => (
            <div key={term} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
              <dt className="hint">{term}</dt>
              <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Your appointment goal"
          description="Shown at the end of your Evidence Brief and used to frame practice."
        />
        <div className="mt-4">
          <TextArea
            label="What do you want to walk out of this appointment with?"
            rows={3}
            value={draft.appointmentGoal}
            onChange={(event) => setAppointmentGoal(event.target.value)}
          />
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Your data"
          description="Everything is stored in this browser for the prototype."
          action={
            <Badge tone="outline">
              {symptomEntries.length} symptom · {contextEntries.length} context
            </Badge>
          }
        />

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Tracking period", report.range?.label ?? "—"],
            ["Days logged", report.range?.daysLogged ?? 0],
            ["Total entries", report.range?.entryCount ?? 0],
          ].map(([term, value]) => (
            <div key={term} className="rounded-lg bg-secondary-bg p-3">
              <dt className="hint">{term}</dt>
              <dd className="mt-0.5 font-serif text-lg font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              setPendingAction({
                run: resetToSampleData,
                title: "Restore sample data?",
                description: "Your current entries will be replaced with the September sample set.",
                confirmLabel: "Restore sample data",
              })
            }
          >
            <RotateCcw size={16} aria-hidden="true" />
            Restore sample data
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              setPendingAction({
                run: clearAllEntries,
                title: "Delete everything?",
                description:
                  "Every symptom and context entry will be removed from this browser. This cannot be undone.",
                confirmLabel: "Delete all entries",
              })
            }
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete all entries
          </Button>

          <Button
            variant="ghost"
            disabled
            title="Connect Supabase to enable server-side export"
          >
            <Download size={16} aria-hidden="true" />
            Export to Supabase
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="What Advoc8 does and does not do"
          description="Worth knowing before you rely on any of this."
        />
        <ul className="mt-4 space-y-2.5">
          {[
            ["Does", "Calculate counts, averages and co-occurrence from the entries you log."],
            ["Does", "Help you write questions and practise explaining your experience."],
            ["Does not", "Diagnose conditions or name what you might have."],
            ["Does not", "Recommend treatments, medication or dosages."],
            ["Does not", "Claim that one thing you logged caused another."],
          ].map(([label, text]) => (
            <li key={text} className="flex gap-3 text-sm">
              <Badge tone={label === "Does" ? "success" : "warning"}>{label}</Badge>
              <span className="text-muted">{text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Disclaimer>
        Entries stay in this browser. Connecting Supabase moves them to your own database — nothing
        is sent anywhere in the meantime.
      </Disclaimer>

      <ConfirmDialog
        isOpen={pendingAction != null}
        onClose={() => setPendingAction(null)}
        onConfirm={runAction}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
        confirmLabel={pendingAction?.confirmLabel ?? "Confirm"}
      />
    </PageContainer>
  );
}