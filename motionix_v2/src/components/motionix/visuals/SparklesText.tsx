"use client";

import { cn } from "@/lib/cn";

/**
 * MagicUI-port SparklesText. Tiny CSS-only sparkle particles animate around text.
 * Styles are defined in globals.css — this component only renders the markup.
 */
export function SparklesText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="sparkle-dot top-0 left-[0%] [animation-delay:0.2s]" />
      <span aria-hidden className="sparkle-dot top-[10%] left-[33%] [animation-delay:0.6s]" />
      <span aria-hidden className="sparkle-dot top-[20%] left-[66%] [animation-delay:1.0s]" />
      <span aria-hidden className="sparkle-dot top-[35%] left-[20%] [animation-delay:1.4s]" />
    </span>
  );
}
