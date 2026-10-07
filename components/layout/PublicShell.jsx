import Link from "next/link";
import { Logo } from "./Logo";

export function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-medium"
      >
        Skip to content
      </a>

      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <Logo asLink={false} />
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-sm">
              <Logo asLink={false} />
              <p className="hint mt-3">
                Advoc8 helps you turn recurring symptoms into an organised record you can bring to a
                medical appointment.
              </p>
            </div>

            <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
              <p className="eyebrow">Explore</p>
              <Link href="/about" className="text-muted hover:text-foreground">
                About us
              </Link>
              <Link href="/track" className="text-muted hover:text-foreground">
                Log a symptom
              </Link>
              <Link href="/practice" className="text-muted hover:text-foreground">
                Practice
              </Link>
              <Link href="/settings" className="text-muted hover:text-foreground">
                Settings
              </Link>
            </nav>

            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow">Contact</p>
              <a
                href="mailto:advoc8care.co@gmail.com"
                className="text-lg font-medium text-foreground hover:text-accent-strong"
              >
                advocates8care.co@gmail.com
              </a>
              <a
                href="https://instagram.com/advoc8care"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground"
              >
                @advoc8care on Instagram
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs leading-relaxed text-muted">
              Advoc8 is a communication and documentation tool. It does not diagnose conditions,
              recommend treatment, or provide medical advice. Only a qualified healthcare professional
              can diagnose a medical condition.
            </p>
            <p className="mt-3 text-xs text-subtle">Built as a hackathon prototype. Sample data only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}