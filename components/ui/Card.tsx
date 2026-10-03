"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  border?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  border = true,
}: CardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        bg-white
        ${border ? "border border-border" : ""}
        rounded-lg
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
