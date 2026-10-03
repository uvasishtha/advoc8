import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <Logo asLink={false} />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          <p>
            This is a hackathon prototype. Sign-in is not enforced and the demo opens straight into a
            shared sample account.
          </p>
          <Link href="/" className="mt-1 inline-block font-medium text-accent-strong hover:underline">
            Back to the home page
          </Link>
        </div>
      </footer>
    </div>
  );
}