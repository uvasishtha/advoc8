import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-full">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-foreground"
            >
              <span className="block h-2 w-2 rounded-full bg-foreground" />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Advoc8</span>
          </span>
        </Link>
      </header>

      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="text-center">
            <p className="eyebrow">Coming soon</p>
            <h1 className="mt-2 font-serif text-2xl font-semibold">Accounts are not enabled yet</h1>
            <p className="mt-2 hint">
              The demo is running with sample data. Supabase-backed sign-up and
              data sync are still in progress.
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-secondary-bg p-4 text-sm text-muted">
            <p className="font-medium text-foreground">What you can do now</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Open the sample demo</li>
              <li>Explore the dashboard, tracker, and Evidence Brief</li>
              <li>Check back soon for account creation</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button href="/home" className="w-full">
              Open sample demo
            </Button>
            <Button href="/" variant="outline" className="w-full">
              Back to home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
