import Link from "next/link";
import { ArrowRight, FileText, NotebookPen, Sparkle } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  {
    number: "01",
    icon: NotebookPen,
    title: "Track",
    body: "Log symptoms with severity, duration and notes. Add sleep, stress and cycle information for the same day. Ninety seconds per entry.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Analyze",
    body: "Advoc8 calculates frequency, averages, change over time and co-occurrence from your own records. Every number is checkable.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Evidence Brief",
    body: "Eight sections you can read in two minutes: what you wrote in your own words, the numbers, the patterns, and your questions.",
  },
  {
    number: "04",
    icon: Sparkle,
    title: "Practice",
    body: "Rehearse explaining yourself before you are in the room. The interviewer only uses the numbers from your own brief.",
  },
];

const EXAMPLES = [
  {
    label: "Observed",
    text: "Headache was logged on 8 of the 11 days you recorded fewer than 6 hours of sleep.",
  },
  {
    label: "Then",
    text: "Observed pattern: headache and short sleep frequently appeared together in your tracking history.",
  },
];

export default function LandingPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <Badge tone="accent">For anyone who has said “it&rsquo;s probably nothing”</Badge>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Turn &ldquo;something feels wrong&rdquo; into a record your doctor can actually read.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Symptoms that come and go are hard to describe in a ten-minute appointment. Advoc8 keeps
            the record, shows you the patterns in it, and helps you walk in with something concrete.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/dashboard" size="lg">
              Open the sample brief
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="/how-it-works" variant="outline" size="lg">
              See how it works
            </Button>
          </div>

          <p className="hint mt-4">
            The demo opens as Maya R with a month of sample tracking already in place.
          </p>
        </div>
      </section>

      <section aria-labelledby="how" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="how" className="max-w-2xl font-serif text-3xl font-semibold">
            Four steps, and the middle two are the point.
          </h2>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.number}>
                <Card className="h-full p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                      <step.icon size={16} aria-hidden="true" />
                    </span>
                    <span className="font-serif text-sm font-semibold text-accent-strong">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="language" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 id="language" className="font-serif text-3xl font-semibold">
              It tells you what your records show. Not what they mean.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              A lot of health apps cannot help themselves. They tell you that your sleep is causing
              your headaches, or worse, what condition you have. Advoc8 will not, because it has no
              business doing either.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              It reports what you logged and what kept appearing together. Deciding what that means
              is a conversation for a clinician who can examine you.
            </p>
            <Link
              href="/how-it-works"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
            >
              Read the full explanation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <Card className="p-6">
            <p className="eyebrow">What it says</p>
            {EXAMPLES.map((example) => (
              <div key={example.label} className="mt-4">
                <Badge tone={example.label === "Observed" ? "accent" : "outline"}>{example.label}</Badge>
                <p className="mt-2 leading-relaxed text-foreground">{example.text}</p>
              </div>
            ))}

            <div className="mt-6 border-t border-border pt-5">
              <p className="eyebrow">What it will not say</p>
              <p className="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-sm leading-relaxed text-warning">
                &ldquo;Your lack of sleep caused your headaches.&rdquo;
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-accent-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold">Ready to look at your own record?</h2>
            <p className="mt-4 leading-relaxed text-foreground">
              Start with the sample brief to see the shape of it, then log your own entries and watch
              the numbers appear.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/dashboard" size="lg">
                Open the demo
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button href="/signup" variant="outline" size="lg">
                Create an account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}