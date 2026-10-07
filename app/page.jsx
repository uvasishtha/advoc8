import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Advoc8</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Helping women advocate for better care.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A simple, focused tool that turns your symptoms and notes into a clear
            Evidence Brief you can bring to your doctor.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Clean UI, straightforward tracking, and a readable summary — nothing
            flashy, just something that works.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/home" size="lg">
              Open sample demo
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Built for the HealthKit Hackathon. Currently in demo mode with sample
            data.
          </p>
        </div>
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
