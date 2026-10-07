import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, asLink = true, href = "/" }) {
  const mark = (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center">
        <img src="/advoc8-logo.png" alt="Advoc8" className="h-8 w-8 object-contain" />
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Advoc8</span>
    </span>
  );

  if (!asLink) return mark;

  return (
    <Link href={href} className="rounded-full">
      {mark}
    </Link>
  );
}
