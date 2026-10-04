"use client";

import { Lock, NotebookPen, UserRound } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

const SETUP_STEPS = [
  "Answer five short questions about what you want to keep track of.",
  "Your Evidence Brief opens with your own words instead of a blank page.",
  "The rehearsal gets a lead symptom to work from.",
];

const TRACKING_STEP = "Log at least two symptom entries so there is a pattern to practise with.";

/**
 * Shown when a locked feature is clicked. Every lock in the app routes through
 * here, so a locked button always explains itself instead of doing nothing.
 */
export function UnlockModal() {
  const { lockedFeature, closeFeaturePrompt } = useAdvoc8();

  if (!lockedFeature) return null;

  const needsSetup = lockedFeature.requirement === "setup";

  return (
    <Modal
      isOpen
      onClose={closeFeaturePrompt}
      title={`${lockedFeature.title} is locked`}
      description={lockedFeature.message}
      size="sm"
    >
      <div className="space-y-5">
        <ul className="space-y-2.5">
          {(needsSetup ? SETUP_STEPS : [TRACKING_STEP]).map((step) => (
            <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-strong"
              />
              {step}
            </li>
          ))}
        </ul>

        <p className="hint flex items-center gap-2">
          <NotebookPen size={14} aria-hidden="true" />
          Logging symptoms stays open either way.
        </p>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="ghost" onClick={closeFeaturePrompt}>
            Not now
          </Button>
          {lockedFeature.action?.href === "/setup" ? (
            <Button href="/setup" onClick={closeFeaturePrompt}>
              <UserRound size={16} aria-hidden="true" />
              {lockedFeature.action.label}
            </Button>
          ) : (
            <Button href={lockedFeature.action.href} onClick={closeFeaturePrompt}>
              {lockedFeature.action.label}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Page-level lock. Keeps the page's own heading so navigation still reads as
 * navigation, and replaces the content with the requirement.
 */
export function FeatureLock({ featureId, children }) {
  const { access } = useAdvoc8();
  const feature = access.features[featureId];

  if (!feature || feature.unlocked) return children;

  const needsSetup = feature.requirement === "setup";

  return (
    <Card tone="quiet" className="px-5 py-8 text-center sm:px-6">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
        <Lock size={19} className="text-accent-strong" aria-hidden="true" />
      </span>

      <p className="mt-4 font-serif text-xl font-semibold text-foreground">{feature.title}</p>
      <p className="hint mx-auto mt-1.5 max-w-md">{feature.message}</p>

      {needsSetup ? (
        <p className="hint mx-auto mt-3 max-w-md">
          Five short questions. You can skip them and come back later.
        </p>
      ) : null}

      {feature.action ? (
        <Button href={feature.action.href} className="mt-5">
          {feature.action.label}
        </Button>
      ) : null}
    </Card>
  );
}
