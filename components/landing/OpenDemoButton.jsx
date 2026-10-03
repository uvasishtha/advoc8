"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/Button";

/**
 * Landing-page entry into the demo.
 *
 * Loads Maya R's sample profile and September tracking — which also marks setup
 * as complete, so every feature is already unlocked on arrival — then walks the
 * visitor into the dashboard with something to look at.
 */
export function OpenDemoButton({ children, size = "lg", variant = "primary" }) {
  const router = useRouter();
  const { resetToSampleData } = useAdvoc8();

  function openDemo() {
    resetToSampleData();
    router.push("/dashboard");
  }

  return (
    <Button size={size} variant={variant} onClick={openDemo}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Button>
  );
}