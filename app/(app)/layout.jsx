import { DataProvider } from "@/components/providers/DataProvider";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }) {
  return (
    <DataProvider>
      <OnboardingGate>
        <AppShell>{children}</AppShell>
      </OnboardingGate>
    </DataProvider>
  );
}