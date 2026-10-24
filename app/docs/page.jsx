import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, FileText, NotebookPen, Sparkle } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SECTIONS = [
  { id: "getting-started", title: "Getting Started" },
  { id: "dashboard", title: "Dashboard Overview" },
  { id: "core-features", title: "Core Features" },
  { id: "how-to-use", title: "How to Use Advoc8" },
  { id: "demo-mode", title: "Demo Mode" },
  { id: "faq", title: "FAQ / Troubleshooting" },
];

export const metadata = {
  title: "Docs — Advoc8",
  description: "Learn how Advoc8 helps you track symptoms and build an Evidence Brief for your doctor.",
};

export default function DocsPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <Badge tone="accent">Documentation</Badge>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Advoc8 Docs
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Everything you need to know about tracking symptoms, understanding patterns, and building a clear Evidence Brief to bring to your appointment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard">
              Open sample demo
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href="/about" variant="outline">
              About Advoc8
            </Button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-xl border border-border bg-surface p-4">
              <p className="eyebrow px-2 pb-2">On this page</p>
              <ul className="space-y-1">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-secondary-bg hover:text-foreground">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 space-y-12">
            <Card className="p-6 sm:p-8" id="getting-started">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <BookOpen size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Getting Started</h2>
              </div>
              <p className="leading-relaxed text-muted">
                Advoc8 helps you turn recurring symptoms and notes into a clear, factual Evidence Brief you can bring to your doctor. It focuses on your own records—reporting what you logged and what kept appearing together, without making diagnoses or treatment recommendations.
              </p>
            </Card>

            <Card className="p-6 sm:p-8" id="dashboard">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <Calendar size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Dashboard Overview</h2>
              </div>
              <p className="leading-relaxed text-muted">
                The <Link href="/dashboard" className="text-accent-strong hover:underline">Dashboard</Link> gives you a quick snapshot of your tracking history.
              </p>
              <ul className="mt-4 space-y-2 text-muted">
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Greeting &amp; coverage:</strong> Shows who you're tracking for and the date range covered.</span></li>
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Evidence Brief status:</strong> See if your brief is ready and jump to it.</span></li>
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Key stats:</strong> Quick metrics from your logged data.</span></li>
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Recent entries &amp; trends:</strong> Review what you've logged and severity trends.</span></li>
              </ul>
            </Card>

            <Card className="p-6 sm:p-8" id="core-features">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <FileText size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Core Features</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card tone="quiet" className="p-5">
                  <div className="mb-2 flex items-center gap-2"><NotebookPen size={17} className="text-accent-strong" /><h3 className="font-semibold text-foreground">Track Symptoms</h3></div>
                  <p className="text-sm text-muted">Log on <Link href="/track" className="text-accent-strong hover:underline">/track</Link> with severity, duration, notes, and optional context.</p>
                </Card>
                <Card tone="quiet" className="p-5">
                  <div className="mb-2 flex items-center gap-2"><FileText size={17} className="text-accent-strong" /><h3 className="font-semibold text-foreground">Evidence Brief</h3></div>
                  <p className="text-sm text-muted">View on <Link href="/brief" className="text-accent-strong hover:underline">/brief</Link>. Add a personal statement and questions.</p>
                </Card>
                <Card tone="quiet" className="p-5">
                  <div className="mb-2 flex items-center gap-2"><Sparkle size={17} className="text-accent-strong" /><h3 className="font-semibold text-foreground">Practice Mode</h3></div>
                  <p className="text-sm text-muted">Rehearse on <Link href="/practice" className="text-accent-strong hover:underline">/practice</Link> using only your brief.</p>
                </Card>
                <Card tone="quiet" className="p-5">
                  <div className="mb-2 flex items-center gap-2"><Calendar size={17} className="text-accent-strong" /><h3 className="font-semibold text-foreground">Setup &amp; Settings</h3></div>
                  <p className="text-sm text-muted">Manage profile in <Link href="/setup" className="text-accent-strong hover:underline">Setup</Link> and data in <Link href="/settings" className="text-accent-strong hover:underline">Settings</Link>.</p>
                </Card>
              </div>
            </Card>

            <Card className="p-6 sm:p-8" id="how-to-use">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <NotebookPen size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">How to Use Advoc8</h2>
              </div>
              <div className="mb-6 overflow-x-auto">
                <div className="flex min-w-max items-center gap-2 text-sm">
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium">Log</div>
                  <ArrowRight size={14} className="text-muted" />
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium">Review</div>
                  <ArrowRight size={14} className="text-muted" />
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium">Build Brief</div>
                  <ArrowRight size={14} className="text-muted" />
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium">Practice</div>
                </div>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold">1</span><div><p className="font-medium">Start tracking</p><p className="mt-1 text-muted">Log symptoms on <Link href="/track" className="text-accent-strong hover:underline">/track</Link>.</p></div></li>
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold">2</span><div><p className="font-medium">Review patterns</p><p className="mt-1 text-muted">Check the <Link href="/dashboard" className="text-accent-strong hover:underline">Dashboard</Link> for stats and trends.</p></div></li>
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold">3</span><div><p className="font-medium">Build your Evidence Brief</p><p className="mt-1 text-muted">Open <Link href="/brief" className="text-accent-strong hover:underline">/brief</Link>, add your statement and questions.</p></div></li>
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold">4</span><div><p className="font-medium">Practice</p><p className="mt-1 text-muted">Rehearse on <Link href="/practice" className="text-accent-strong hover:underline">/practice</Link> using your brief.</p></div></li>
              </ol>
            </Card>

            <Card className="p-6 sm:p-8" id="demo-mode">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <Sparkle size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Demo Mode</h2>
              </div>
              <p className="leading-relaxed text-muted">Runs in demo mode with sample data stored in your browser. Accounts and cloud sync are not enabled yet.</p>
              <ul className="mt-4 space-y-2 text-muted">
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Sample data:</strong> Loaded by default so all features work.</span></li>
                <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span><strong className="text-foreground">Reset/Clear:</strong> Use <Link href="/settings" className="text-accent-strong hover:underline">Settings</Link> to load sample data or clear entries.</span></li>
              </ul>
            </Card>

            <Card className="p-6 sm:p-8" id="faq">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <BookOpen size={18} aria-hidden="true" />
                </span>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">FAQ / Troubleshooting</h2>
              </div>
              <div className="space-y-4">
                <div><p className="font-medium">Does Advoc8 diagnose or recommend treatment?</p><p className="mt-1 text-muted">No. It only reports what you logged and patterns in your records.</p></div>
                <div><p className="font-medium">Where is my data stored?</p><p className="mt-1 text-muted">In your browser's local storage in demo mode.</p></div>
                <div><p className="font-medium">Why can't I access some features?</p><p className="mt-1 text-muted">Check <Link href="/setup" className="text-accent-strong hover:underline">Setup</Link> or load sample data in <Link href="/settings" className="text-accent-strong hover:underline">Settings</Link>.</p></div>
                <div><p className="font-medium">Can I print my Evidence Brief?</p><p className="mt-1 text-muted">Yes, use the Print button on the <Link href="/brief" className="text-accent-strong hover:underline">Evidence Brief</Link> page.</p></div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
