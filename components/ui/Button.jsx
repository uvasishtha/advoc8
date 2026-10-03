"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-accent text-foreground hover:bg-accent-strong hover:text-white border border-transparent",
  solid: "bg-accent-strong text-white hover:bg-[#A8276B] border border-transparent",
  soft: "bg-accent-soft text-accent-strong hover:bg-accent-muted border border-transparent",
  outline: "bg-transparent text-foreground border border-border-strong hover:bg-secondary-bg",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-secondary-bg border border-transparent",
  danger: "bg-transparent text-warning border border-warning/40 hover:bg-warning-soft",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2.5 text-[0.9375rem] gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  className,
  ...rest
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = loading ? <span className="sr-only">Working…</span> : children;

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={classes} {...rest}>
      {content}
    </button>
  );
}