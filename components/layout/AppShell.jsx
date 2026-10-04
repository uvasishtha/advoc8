"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, House, Lock, NotebookPen, Settings, Sparkle, User } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { FEATURE_IDS } from "@/lib/onboarding";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { UnlockModal } from "@/components/onboarding/FeatureLock";

// The four destinations, in the order the product is used. Practice is last
// because it is the rehearsal, not a step in building the record — it reads the
// brief, so it only makes sense once Track and Prepare have been done.
const NAV_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/track", label: "Track", icon: NotebookPen },
  { href: "/prepare", label: "Prepare", icon: ClipboardList, feature: FEATURE_IDS.BRIEF },
  { href: "/practice", label: "Practice", icon: Sparkle, feature: FEATURE_IDS.PRACTICE },
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const { user, access, isReady } = useAdvoc8();

  function navClass(active, locked) {
    return cn(
      "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-accent-soft text-accent-strong"
        : "text-muted hover:bg-secondary-bg hover:text-foreground",
      locked && "opacity-70",
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-medium"
      >
        Skip to content
      </a>

      <aside className="hidden w-60 shrink-0 flex-col border-b border-border bg-surface md:sticky md:top-0 md:flex md:h-screen md:border-b-0 md:border-r">
        <div className="border-b border-border px-6 py-5">
          <Logo />
        </div>

        <nav aria-label="Main" className="flex-1 px-3 py-5">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const locked = isReady && item.feature && !access.features[item.feature].unlocked;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={navClass(active, locked)}
                  >
                    <item.icon size={17} aria-hidden="true" />
                    {item.label}
                    {locked ? <Lock size={13} className="ml-auto text-muted" aria-hidden="true" /> : null}
                    {locked ? <span className="sr-only">(locked)</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            className={navClass(pathname === "/settings")}
          >
            <Settings size={17} aria-hidden="true" />
            Settings
          </Link>

          <Link
            href="/"
            className="mt-3 flex items-center gap-3 rounded-full bg-secondary-bg px-3 py-2 transition-colors hover:bg-accent-soft"
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-foreground"
            >
              {user.initials ? user.initials : <User size={14} />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {user.displayName}
              </span>
              <span className="block truncate text-xs text-muted">
                {user.isSample ? "Sample record" : "Your record"}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo />
            <Link href="/settings" className="rounded-full p-2 text-muted hover:text-foreground">
              <Settings size={18} aria-hidden="true" />
              <span className="sr-only">Settings</span>
            </Link>
          </div>
          <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const locked = isReady && item.feature && !access.features[item.feature].unlocked;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-accent-muted bg-accent-soft text-accent-strong"
                      : "border-border text-muted",
                  )}
                >
                  <item.icon size={15} aria-hidden="true" />
                  {item.label}
                  {locked ? <Lock size={12} aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </nav>
        </header>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <UnlockModal />
    </div>
  );
}

/** Standard page gutter and max width for authenticated screens. */
export function PageContainer({ children, className }) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8", className)}>
      {children}
    </div>
  );
}