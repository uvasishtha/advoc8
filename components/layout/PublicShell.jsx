import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [{ href: "/dashboard", label: "Open the demo" }];

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
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="ml-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-strong hover:text-white"
            >
              Open the demo
            </Link>
          </nav>
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
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
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