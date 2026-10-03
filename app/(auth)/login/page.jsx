"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maya.r@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords are at least six characters.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Card className="p-6 sm:p-8">
      <Badge tone="accent">Prototype</Badge>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Welcome back</h1>
      <p className="hint mt-2">
        Sign-in is not wired up yet. Anything valid will take you into the demo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          hint="Six characters minimum."
        />

        {error ? (
          <p role="alert" className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full">
          Sign in
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </form>

      <p className="hint mt-6 text-center">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-accent-strong hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}