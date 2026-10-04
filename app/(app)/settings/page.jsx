"use client";

import { useState } from "react";
import { RotateCcw, Trash2, UserRound } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Disclaimer } from "@/components/ui/Notice";
import { DAY_TO_DAY_OPTIONS, FIRST_NOTICED_OPTIONS } from "@/lib/onboarding";
import { formatDate } from "@/lib/format";

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

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? "—";
}

/**
 * Settings.
 *
 * Kept deliberately short: what Advoc8 knows, where it is stored, and the two
 * destructive actions. The appointment goal moved up into the brief, where it is
 * actually used.
 */
export default function SettingsPage() {
  const {
    user,
    access,
    report,
    symptomEntries,
    contextEntries,
    resetToSampleData,
    clearAllEntries,
    startFresh,
  } = useAdvoc8();

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
        <CardHeader
          title="Your profile"
          description="What Advoc8 knows about you. It comes from your setup survey, nothing else."
          action={
            <Badge tone={access.setupComplete ? "success" : "warning"}>
              {access.setupComplete ? "Setup complete" : "Setup not finished"}
            </Badge>
          }
        />

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Name", user.displayName],
            ["First noticed", optionLabel(FIRST_NOTICED_OPTIONS, user.firstNoticed)],
            ["Day-to-day impact", optionLabel(DAY_TO_DAY_OPTIONS, user.dayToDay)],
            ["Symptoms reported", user.symptoms.join(", ") || "—"],
            [
              "Cycle tracking",
              user.tracksCycle
                ? `Yes${user.cycleLength ? ` · ${user.cycleLength}-day cycle` : ""}${
                    user.lastPeriodStart ? ` · last started ${formatDate(user.lastPeriodStart)}` : ""
                  }`
                : "No",
            ],
            ["Account", "Prototype — nothing leaves this browser"],
          ].map(([term, value]) => (
            <div key={term} className="rounded-lg bg-secondary-bg p-3">
              <dt className="hint">{term}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <Button href="/setup" variant="outline">
            <UserRound size={16} aria-hidden="true" />
            {access.setupComplete ? "Redo setup" : "Complete Setup"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Your record"
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
            ["Days reported", report.range?.daysLogged ?? 0],
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
                run: () => resetToSampleData({ unlock: true }),
                title: "Open the sample brief?",
                description:
                  "Maya R's September tracking and profile will replace what is in this browser.",
                confirmLabel: "Open the sample brief",
              })
            }
          >
            <RotateCcw size={16} aria-hidden="true" />
            Open the sample brief
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setPendingAction({
                run: startFresh,
                title: "Start over as a new user?",
                description:
                  "Everything goes: your profile, every entry, your goal and your questions. You will be asked to set up again.",
                confirmLabel: "Start over",
              })
            }
          >
            <UserRound size={16} aria-hidden="true" />
            Start a new profile
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
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader title="What Advoc8 does and does not do" description="Worth knowing before you rely on any of this." />
        <ul className="mt-4 space-y-2.5">
          {[
            ["Does", "Describe what you recorded, and how often."],
            ["Does", "Point out what your record has not captured yet."],
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
        Entries stay in this browser. There is no account and no server, so clearing this browser&rsquo;s
        data clears your record with it.
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