"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const mainNav: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Track", href: "/track" },
  { label: "Insights", href: "/insights" },
  { label: "Doctor Visit", href: "/visit" },
  { label: "Report", href: "/report" },
];

const secondaryNav: NavItem[] = [
  { label: "Profile", href: "/profile" },
  { label: "Health Profile", href: "/settings" },
  { label: "Settings", href: "/settings" },
];

function navItemClasses(isActive: boolean) {
  return `
    flex items-center px-3 py-2 rounded-md text-sm font-medium
    transition-colors
    ${
      isActive
        ? "bg-secondary-bg text-foreground"
        : "text-muted hover:text-foreground hover:bg-secondary-bg/50"
    }
  `;
}

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex w-64 border-r border-border flex-col bg-white">
        <div className="p-6 border-b border-border">
          <Link href="/home" className="font-serif text-2xl font-bold tracking-tight">
            Advoc8
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={navItemClasses(isActive)}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <div className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={navItemClasses(isActive)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted">Private by design.</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden border-b border-border bg-white">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/home" className="font-serif text-xl font-bold tracking-tight">
              Advoc8
            </Link>
            <span className="text-xs text-muted">Private by design.</span>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
            {[...mainNav, ...secondaryNav].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-secondary-bg text-foreground" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
