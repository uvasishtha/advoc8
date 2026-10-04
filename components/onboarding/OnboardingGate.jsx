"use client";

import { usePathname } from "next/navigation";
import { SetupSurvey } from "@/components/onboarding/SetupSurvey";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { SETUP_STATUS } from "@/lib/onboarding";

/**
 * First-run gate. Until the survey is answered or explicitly skipped, a new
 * user sees the setup survey instead of the app. Once it is skipped they are
 * let straight in — the reminder banner and the feature locks take over from
 * there, which is a much lighter nudge than blocking them again.
 */
export function OnboardingGate({ children }) {
  const { isReady, onboarding } = useAdvoc8();
  const pathname = usePathname();

  const isSetupRoute = pathname.startsWith("/setup");
  const mustAnswer = isReady && onboarding.status === SETUP_STATUS.PENDING;

  if (!mustAnswer || isSetupRoute) return children;

  return <SetupSurvey />;
}