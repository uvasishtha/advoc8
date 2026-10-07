import { PublicShell } from "@/components/layout/PublicShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <Badge tone="accent">About Advoc8</Badge>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Built to help women advocate for better care.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A simple, focused tool that turns recurring symptoms into a clear Evidence Brief
            you can bring to your doctor.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">What it does</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Advoc8 helps you track symptoms, sleep, stress, and cycle information over time.
              It then analyzes your own records and builds a readable Evidence Brief you can
              hand to your clinician.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">What it does not do</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Advoc8 does not diagnose conditions, recommend treatment, or provide medical
              advice. It reports what you logged and what kept appearing together. Deciding
              what that means is a conversation for a clinician who can examine you.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">Why it exists</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Symptoms that come and go are hard to describe in a short appointment. Advoc8
              keeps the record, shows you the patterns in it, and helps you walk in with
              something concrete.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">Status</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Built as a HealthKit Hackathon prototype. Currently in demo mode with sample
              data. Account creation and cloud sync are planned but not yet enabled.
            </p>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            Our team
          </h2>
          <div className="mt-8 flex justify-center">
            <img
              src="/team.png"
              alt="Advoc8 team"
              className="w-full max-w-3xl rounded-2xl border border-border object-cover shadow-sm"
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            Watch the pitch
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border">
              <iframe
                src="https://www.youtube.com/watch?v=iS6Buit68B0"
                title="Advoc8 pitch video"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Get in touch
          </h2>
          <p className="mt-3 text-muted">
            <a
              href="mailto:advoc8care.co@gmail.com"
              className="text-accent-strong hover:underline"
            >
              advocates8care.co@gmail.com
            </a>
          </p>
          <p className="mt-3 text-muted">
            <a
              href="https://instagram.com/advoc8care"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-strong hover:underline"
            >
              @advoc8care on Instagram
            </a>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}