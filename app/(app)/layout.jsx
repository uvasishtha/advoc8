import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }) {
  return (
    <OnboardingGate>
      <AppShell>{children}</AppShell>
    </OnboardingGate>
  );
}
