"use client";

import { Lock, NotebookPen } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";


/**
 * Shown when a locked feature is clicked. Every lock in the app routes through
 * here, so a locked button always explains itself instead of doing nothing.
 */
export function UnlockModal() {
  const { lockedFeature, closeFeaturePrompt } = useAdvoc8();

  if (!lockedFeature) return null;

  return (
    <Modal
      isOpen
      onClose={closeFeaturePrompt}
      title={`${lockedFeature.title} is locked`}
      description={lockedFeature.message}
      size="sm"
    >
      <div className="space-y-5">
        <p className="hint">
          A few days is the smallest amount of history that can honestly be called a pattern. One
          bad afternoon logged three times is not a record.
        </p>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="ghost" onClick={closeFeaturePrompt}>
            Not now
          </Button>
          <Button href={lockedFeature.action.href} onClick={closeFeaturePrompt}>
            <NotebookPen size={16} aria-hidden="true" />
            {lockedFeature.action.label}
          </Button>
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

  return (
    <Card tone="quiet" className="px-5 py-8 text-center sm:px-6">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
        <Lock size={19} className="text-accent-strong" aria-hidden="true" />
      </span>

      <p className="mt-4 font-serif text-xl font-semibold text-foreground">{feature.title}</p>
      <p className="hint mx-auto mt-1.5 max-w-md">{feature.message}</p>

      {feature.action ? (
        <Button href={feature.action.href} className="mt-5">
          {feature.action.label}
        </Button>
      ) : null}
    </Card>
  );
}
