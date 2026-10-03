import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="font-serif text-2xl font-bold tracking-tight">Advoc8</span>
        <div className="flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            How Advoc8 works
          </Link>
          <Link href="/onboarding">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-foreground mb-6">
                Your health deserves to be heard.
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
                Track what you&apos;re experiencing, understand patterns over time,
                and walk into your next doctor&apos;s appointment with a clearer record.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/onboarding">
                  <Button size="lg">Get started</Button>
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                  How Advoc8 works
                </Link>
              </div>
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-1">Private by design.</p>
                <p className="text-sm text-muted">Your health information is designed to stay on your device.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    September 30
                  </span>
                  <span className="text-xs text-muted">Journal entry</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-serif text-lg font-semibold">Pelvic pain</span>
                      <span className="text-sm font-medium text-muted">7 / 10</span>
                    </div>
                    <p className="text-sm text-muted">Lower abdomen</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-serif text-lg font-semibold">Heavy bleeding</span>
                      <span className="text-sm font-medium text-muted">6 / 10</span>
                    </div>
                    <p className="text-sm text-muted">Affected school — Yes</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-accent text-white p-4 rounded-lg shadow-sm max-w-xs">
                <p className="text-sm font-medium mb-1">Patterns worth discussing</p>
                <p className="text-xs opacity-90">Pelvic pain has appeared 6 times in the last 30 days.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border bg-secondary-bg/30">
          <div className="max-w-7xl mx-auto px-8 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div>
                <span className="text-xs font-medium text-muted uppercase tracking-wider mb-4 block">
                  01 — Track
                </span>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  Your symptoms deserve a record.
                </h3>
                <p className="text-muted leading-relaxed">
                  Quickly log symptoms, severity, timing, location, cycle information,
                  medications, and impact on daily life.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-muted uppercase tracking-wider mb-4 block">
                  02 — Understand
                </span>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  See patterns, not just isolated symptoms.
                </h3>
                <p className="text-muted leading-relaxed">
                  Advoc8 compares logged information with trusted medical sources
                  to surface patterns worth discussing with your healthcare provider.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-muted uppercase tracking-wider mb-4 block">
                  03 — Advocate
                </span>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  Walk into the appointment prepared.
                </h3>
                <p className="text-muted leading-relaxed">
                  Organize questions, summarize your history, and bring a concise
                  report to your next visit.
                </p>
              </div>
            </div>

            <div className="mt-24 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Start building your health record.
              </h2>
              <Link href="/onboarding">
                <Button size="lg">Get started</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
