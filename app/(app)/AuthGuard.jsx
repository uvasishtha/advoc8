"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdvoc8 } from "@/components/providers/DataProvider";

export function AuthGuard({ children }) {
  const { supabaseUser, isReady } = useAdvoc8();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const isAnonymous = !supabaseUser || supabaseUser.is_anonymous;
    if (isAnonymous) {
      router.replace("/signin");
    }
  }, [isReady, router, supabaseUser]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const isAnonymous = !supabaseUser || supabaseUser.is_anonymous;
  if (isAnonymous) return null;

  return children;
}
