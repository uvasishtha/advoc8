"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const { supabaseUser, isReady } = useAdvoc8();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithOtp(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/home` : undefined,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the magic link.");
    }

    setLoading(false);
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const isAuthenticated = supabaseUser && !supabaseUser.is_anonymous;

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
        {isAuthenticated ? (
          <div className="text-center">
            <p className="eyebrow">Signed in</p>
            <h1 className="mt-2 font-serif text-2xl font-semibold">You are already signed in</h1>
            <p className="mt-2 hint">
              You can go straight to your dashboard, or sign in with a different email.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/home" className="w-full">
                Go to dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <p className="eyebrow">Welcome</p>
              <h1 className="mt-2 font-serif text-2xl font-semibold">Sign in to Advoc8</h1>
              <p className="mt-2 hint">
                Enter your email and we will send you a magic link. No password needed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-strong"
                />
              </div>

              {error ? (
                <p className="text-sm text-warning">{error}</p>
              ) : null}
              {message ? (
                <p className="text-sm text-foreground">{message}</p>
              ) : null}

              <Button type="submit" loading={loading} disabled={loading} className="w-full">
                <Mail size={16} aria-hidden="true" />
                Send magic link
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              By continuing, you agree to Advoc8&rsquo;s use of your data to provide the service.
              Your records are private and not shared.
            </p>

            <p className="mt-4 text-center text-sm text-muted">
              <Link href="/" className="text-accent-strong hover:underline">
                Back to home
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
