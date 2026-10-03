import Link from "next/link";
import { ArrowRight, Ban, Check } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";

const METRICS = [
  ["Symptom frequency", "How many days you logged it, out of all the days you tracked."],
  ["Average and highest severity", "Your own 0–10 ratings, averaged and peaked."],
  ["Severity over time", "A daily picture that leaves unrecorded days blank rather than guessing."],
  ["First half vs second half", "Whether your average moved, and by how much."],
  ["Co-occurrence", "How often a symptom showed up on days you also recorded short sleep, high stress, or a particular cycle phase."],
  ["Trend direction", "Increasing, decreasing or steady, with the threshold stated."],
];

const DOES = [
  "Calculate counts and averages from entries you logged",
  "Point out what kept appearing together, with the numbers attached",
  "Write questions you can ask your own clinician",
  "Let you rehearse explaining yourself before the appointment",
  "Hand you a document to bring to the appointment",
];

const DOES_NOT = [
  "Diagnose a condition or name what you might have",
  "Suggest a treatment, medication or dosage",
  "Claim that one logged factor caused a symptom",
  "Tell you how worried you should be",
  "Replace any part of seeing a clinician",
];

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <header>
          <p className="eyebrow">How it works</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            The record is the product.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Everything Advoc8 shows you comes out of entries you logged yourself. There is no
            database of symptoms being matched against yours, and no model guessing at what is wrong.
          </p>
        </header>

        <div className="mt-14 space-y-12">
          <Section number={1} title="Tracking" description="Ninety seconds an entry, in your own wording.">
            <p className="leading-relaxed text-muted">
              Each entry records a date, a symptom, a severity from 0 to 10, how long it lasted, and
              anything you want to note about it. Alongside that you can record the day&rsquo;s sleep,
              stress level, and cycle day. Those context fields are what make patterns visible later,
              but every one of them is optional.
            </p>
          </Section>

          <Section
            number={2}
            title="Analysis"
            description="Deterministic arithmetic over your rows. No model involved."
          >
            <Card className="overflow-hidden">
              <ul className="divide-y divide-border">
                {METRICS.map(([term, definition]) => (
                  <li key={term} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
                    <span className="font-medium text-foreground sm:w-56 sm:shrink-0">{term}</span>
                    <span className="text-sm leading-relaxed text-muted">{definition}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card tone="soft" className="mt-4 p-5">
              <p className="eyebrow">Worked example</p>
              <p className="mt-2 leading-relaxed text-foreground">
                You logged fewer than six hours of sleep on 11 days. You recorded a headache on 8 of
                those days.
              </p>
              <p className="mt-3 leading-relaxed text-foreground">
                Advoc8 writes: &ldquo;Headache was logged on 8 of the 11 days you recorded fewer than 6
                hours of sleep&rdquo;, then adds: &ldquo;Observed pattern: headache and short sleep
                frequently appeared together in your tracking history.&rdquo;
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                It also shows the baseline: headache appeared on 47% of all your tracked days, against
                73% of the short-sleep days. You can check every part of that against your own log.
              </p>
            </Card>
          </Section>

          <Section number={3} title="The Evidence Brief" description="Eight sections, printable and downloadable.">
            <ol className="grid gap-2 sm:grid-cols-2">
              {[
                "What I've Been Experiencing",
                "Symptom Timeline",
                "Quantitative Trends",
                "Patterns in My Data",
                "Changes Over Time",
                "What I Want My Doctor to Know",
                "Questions I Want to Ask",
                "Before My Appointment",
              ].map((title, index) => (
                <li
                  key={title}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="font-serif text-sm font-semibold text-accent-strong">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-foreground">{title}</span>
                </li>
              ))}
            </ol>
            <p className="hint mt-4">
              Sections 06 and 07 are yours to edit. Anything generated is a draft until you say
              otherwise.
            </p>
          </Section>

          <Section number={4} title="Practice" description="Rehearsal, not advice.">
            <p className="leading-relaxed text-muted">
              The interviewer starts by asking you to describe what has been happening in your own
              words. It then asks about when it started, how often it happens, how severe it is, how
              long it lasts, and what it does to your day. Where your brief has the answer, it offers
              it back to you — &ldquo;your records show your first recorded headache was September
              3&rdquo; — so you can decide whether to say it out loud.
            </p>
          </Section>

          <Section number={5} title="What Advoc8 will never do">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-success">
                  <Check size={16} aria-hidden="true" />
                  It will
                </p>
                <ul className="mt-3 space-y-2">
                  {DOES.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <Check size={14} className="mt-1 shrink-0 text-success" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                  <Ban size={16} aria-hidden="true" />
                  It will not
                </p>
                <ul className="mt-3 space-y-2">
                  {DOES_NOT.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <Ban size={14} className="mt-1 shrink-0 text-warning" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card tone="soft" className="mt-4 p-5">
              <p className="leading-relaxed text-foreground">
                If you are experiencing symptoms that worry you, please contact a qualified healthcare
                professional. Do not use Advoc8 to work out what you have.
              </p>
            </Card>
          </Section>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-border pt-10">
          <Badge tone="accent">Ready?</Badge>
          <p className="font-serif text-xl font-semibold">See it with real numbers.</p>
          <Button href="/dashboard" className="ml-auto">
            Open the sample brief
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>

        <p className="hint mt-6">
          Prefer to read the privacy position first?{" "}
          <Link href="/settings" className="font-medium text-accent-strong hover:underline">
            See what is stored and why
          </Link>
          .
        </p>
      </div>
    </PublicShell>
  );
}