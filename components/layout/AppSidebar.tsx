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
  { label: "Health Profile", href: "/settings" },
  { label: "Settings", href: "/settings" },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border flex flex-col bg-white">
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? "bg-secondary-bg text-foreground"
                        : "text-muted hover:text-foreground hover:bg-secondary-bg/50"
                    }
                  `}
                >
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
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-secondary-bg text-foreground"
                          : "text-muted hover:text-foreground hover:bg-secondary-bg/50"
                      }
                    `}
                  >
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

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
