import { AuthGuard } from "./AuthGuard";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <OnboardingGate>
        <AppShell>{children}</AppShell>
      </OnboardingGate>
    </AuthGuard>
  );
}
