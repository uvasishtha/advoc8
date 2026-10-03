import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="font-serif text-2xl font-bold tracking-tight">Advoc8</span>
        <Link href="/onboarding">
          <Button size="sm">Get started</Button>
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-foreground mb-6">
          Your health deserves to be heard.
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
          Track what you&apos;re experiencing, understand patterns over time, and walk into your next doctor&apos;s appointment with a clearer record.
        </p>
        <Link href="/onboarding">
          <Button size="lg">Get started</Button>
        </Link>
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-1">Private by design.</p>
          <p className="text-sm text-muted">Your health information is designed to stay on your device.</p>
        </div>
      </main>
    </div>
  );
}
