"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

const PROMISES = [
  "Your entries stay in your own account",
  "Every number is calculated from what you logged",
  "Nothing is used to suggest a diagnosis",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Tell us what to call you.";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email address.";
    if (form.password.length < 6) nextErrors.password = "Six characters minimum.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    router.push("/dashboard");
  }

  return (
    <Card className="p-6 sm:p-8">
      <Badge tone="accent">Prototype</Badge>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Create your account</h1>
      <p className="hint mt-2">
        Account creation is not wired up yet. This form takes you straight into the demo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TextField
          label="First name"
          required
          autoComplete="given-name"
          value={form.name}
          onChange={update("name")}
          error={errors.name}
          placeholder="Maya"
        />

        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          hint="Six characters minimum."
        />

        <Button type="submit" size="lg" className="w-full">
          Create account
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </form>

      <ul className="mt-6 space-y-2 border-t border-border pt-6">
        {PROMISES.map((promise) => (
          <li key={promise} className="flex gap-2.5 text-sm leading-relaxed text-muted">
            <Check size={14} className="mt-1 shrink-0 text-accent-strong" aria-hidden="true" />
            {promise}
          </li>
        ))}
      </ul>

      <p className="hint mt-6 text-center">
        Already set up?{" "}
        <Link href="/login" className="font-medium text-accent-strong hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}