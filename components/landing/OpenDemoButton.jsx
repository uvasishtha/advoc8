"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/Button";

/**
 * Landing-page entry into the sample data.
 *
 * `unlock` picks what the visitor lands on:
 *   - true  — the developer override: sample profile included, so every feature
 *             is unlocked and a dev can see the finished app immediately.
 *   - false — the same tracking rows with the locks left as they are, for
 *             reviewing the gated states against real data.
 */
export function OpenDemoButton({ children, size = "lg", variant = "primary", unlock = true }) {
  const router = useRouter();
  const { resetToSampleData } = useAdvoc8();

  function openDemo() {
    resetToSampleData({ unlock });
    router.push("/dashboard");
  }

  return (
    <Button size={size} variant={variant} onClick={openDemo}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Button>
  );
}