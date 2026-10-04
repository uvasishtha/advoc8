import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, asLink = true }) {
  const mark = (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-foreground"
      >
        <span className="block h-2 w-2 rounded-full bg-foreground" />
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Advoc8</span>
    </span>
  );

  if (!asLink) return mark;

  return (
    <Link href="/" className="rounded-full">
      {mark}
    </Link>
  );
}