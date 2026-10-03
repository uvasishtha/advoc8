"use client";

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = 96, className = "" }: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(src) && !hasImageError;

  return (
    <div
      role="img"
      aria-label={name}
      style={{ width: size, height: size }}
      className={`
        flex-shrink-0 overflow-hidden rounded-full
        border border-border bg-secondary-bg
        flex items-center justify-center
        ${className}
      `}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt=""
          width={size}
          height={size}
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: Math.max(14, Math.round(size * 0.36)) }}
          className="font-serif font-semibold text-accent-dark select-none"
        >
          {getInitials(name) || "?"}
        </span>
      )}
    </div>
  );
}
