import { ArrowRight, CalendarDays, FileText, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/layout/Logo";

const FEATURES = [
  {
    icon: NotebookPen,
    title: "Track what matters",
    description:
      "Log symptoms, sleep, stress, and cycle in under a minute. Your record stays yours.",
  },
  {
    icon: CalendarDays,
    title: "See the pattern",
    description:
      "Advoc8 reads your own entries and surfaces the relationships you would otherwise miss.",
  },
  {
    icon: FileText,
    title: "Walk in prepared",
    description:
      "A readable Evidence Brief — your words, your record, and the gaps a clinician should know about.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <Button href="/signin" size="sm">
          Sign in
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Advoc8</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Turn “something feels wrong” into evidence
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Track recurring symptoms, find patterns in your own records, and build
              an Evidence Brief to bring to your doctor.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/signin" size="lg">
                Get started
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <Button href="/home" variant="outline" size="lg">
                See sample brief
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-t border-border bg-secondary-bg">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="features-heading" className="font-serif text-3xl font-semibold sm:text-4xl">
                Built around one thing: your record
              </h2>
              <p className="mt-3 hint">
                Most apps ask for data. Advoc8 gives something back — a readable summary
                you can hand to a clinician, built only from what you logged.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} tone="surface" className="p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                    <feature.icon size={20} className="text-accent-strong" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 hint text-sm leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="how-heading" className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-heading" className="font-serif text-3xl font-semibold sm:text-4xl">
                How it works
              </h2>
            </div>

            <ol className="mx-auto mt-12 grid max-w-2xl gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Log your symptoms",
                  description:
                    "Pick the symptom, rate the severity, and add any notes. Takes under a minute.",
                },
                {
                  step: "02",
                  title: "Add context",
                  description:
                    "Sleep, stress, cycle — the things that turn a list of symptoms into a pattern.",
                },
                {
                  step: "03",
                  title: "Generate your brief",
                  description:
                    "Advoc8 builds a readable summary with gaps, trends, and questions for your appointment.",
                },
              ].map((item) => (
                <li key={item.step} className="relative">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
                    {item.step}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 hint text-sm leading-relaxed">{item.description}</p>
                </li>
              ))}
            </ol>

            <div className="mx-auto mt-14 flex justify-center">
              <Button href="/signin" size="lg">
                Get started
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted">
            <strong className="font-medium text-foreground">Advoc8 does not diagnose.</strong>{" "}
            Everything in the Evidence Brief is calculated from entries you logged yourself.
            It is a record to read together, not a conclusion about what is going on.
          </p>
        </div>
      </footer>
    </div>
  );
}
