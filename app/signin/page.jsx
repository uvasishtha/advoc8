"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const router = useRouter();
  const { supabaseUser, isReady } = useAdvoc8();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAuthenticated = !!supabaseUser && !supabaseUser.is_anonymous;

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/home");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Redirecting…</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signin") {
        if (!supabase.auth.signInWithPassword) {
          throw new Error("Auth not configured. Check .env.local.");
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!supabase.auth.signUp) {
          throw new Error("Auth not configured. Check .env.local.");
        }
        if (password !== confirm) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = data?.error ?? `Sign up failed (${res.status}).`;
          if (res.status === 409) {
            setError(`${message} Switch to Sign In to log in.`);
            setTimeout(() => setMode("signin"), 2500);
          } else {
            throw new Error(message);
          }
          return;
        }

        setMessage("Account created. Signing you in…");

        const signInResult = await supabase.auth.signInWithPassword({ email, password });

        if (signInResult.error) {
          const message = signInResult.error.message ?? "";
          const notConfigured = !supabase.auth.signInWithPassword || message.includes("not configured");

          if (notConfigured) {
            setError("Account created. Please sign in below.");
            setMode("signin");
            return;
          }

          throw signInResult.error;
        }
      }

      for (let attempt = 1; attempt <= 10; attempt++) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          router.replace("/home");
          return;
        }
        if (attempt < 10) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      setError("Signed in, but the session was not ready yet. Refresh the page.");
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

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
        <div className="flex rounded-full border border-border bg-secondary-bg p-1">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors",
              mode === "signin" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
            )}
          >
            <LogIn size={15} aria-hidden="true" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors",
              mode === "signup" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
            )}
          >
            <UserPlus size={15} aria-hidden="true" />
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-strong"
            />
          </div>

          {mode === "signup" ? (
            <div>
              <label htmlFor="confirm" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-strong"
              />
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-warning">{error}</p>
          ) : null}
          {message ? (
            <p className="text-sm text-foreground">{message}</p>
          ) : null}

          <Button type="submit" loading={loading} disabled={loading} className="w-full">
            <Lock size={16} aria-hidden="true" />
            {mode === "signin" ? "Sign In" : "Create Account"}
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
      </main>
    </div>
  );
}
