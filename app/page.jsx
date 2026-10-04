"use client";

import Link from "next/link";
import { ArrowRight, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-serif text-xl font-semibold">Advoc8</span>
          <nav className="flex items-center gap-4">
            <Link href="/setup" className="text-sm font-medium text-muted hover:text-foreground">
              How it works
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-3xl w-full text-center space-y-12">
          <div className="space-y-4">
            <p className="eyebrow text-center">Turn &ldquo;something feels wrong&rdquo; into evidence</p>
            <h1 className="font-serif text-5xl font-semibold leading-tight sm:text-6xl">
              Track symptoms. See patterns. Be ready for your appointment.
            </h1>
            <p className="text-lg leading-relaxed text-muted max-w-2xl mx-auto">
              Log what you feel. Advoc8 finds what repeats, what changed, and what&rsquo;s
              missing &mdash; then builds a brief your doctor can actually use.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="p-8 text-left hover:border-accent-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <FileText size={20} aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-accent-strong">Your data</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-3">
                Start with your own entries
              </h2>
              <p className="text-muted mb-6">
                Pick up where you left off. Your tracking history, brief draft, and
                unlocked features stay with you.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "Your symptom log and context entries",
                  "Your written statement and questions",
                  "Progress toward unlocking the brief and practice",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted">
                    <CheckCircle2 size={14} className="text-accent-strong shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/prepare">
                <Button className="w-full" size="lg">
                  Continue to your brief
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-left border-accent-muted/50 hover:border-accent-strong/50 transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-0.5 text-xs font-medium bg-accent-strong text-white rounded-full">
                  Try the example
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <Sparkles size={20} aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-accent-strong">Sample data</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-3">
                Explore a filled-in brief
              </h2>
              <p className="text-muted mb-6">
                See how it works with Maya&rsquo;s month of tracking &mdash; headaches, fatigue,
                pelvic pain, and the brief that comes from it.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "30 days of symptoms, sleep, stress, cycle",
                  "Pre-written statement and generated questions",
                  "All sections populated: experience, observations, gaps",
                  "Full practice conversation unlocked",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted">
                    <CheckCircle2 size={14} className="text-accent-strong shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/prepare?sample=true">
                <Button className="w-full" size="lg" variant="outline">
                  Open the example brief
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </Card>
          </div>

          <p className="text-sm text-muted">
            Your data stays in your browser. Nothing is sent to a server unless you
            choose to share it.
          </p>
        </div>
      </div>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>Advoc8 does not diagnose. It is a record, not a conclusion.</p>
          <Link href="/setup" className="hover:underline">
            Learn more
          </Link>
        </div>
      </footer>
    </main>
  );
}