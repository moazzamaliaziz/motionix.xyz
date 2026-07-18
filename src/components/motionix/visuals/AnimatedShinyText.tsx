"use client";

import { cn } from "@/lib/cn";

export function AnimatedShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-background via-ember to-background bg-clip-text text-transparent [background-size:200%_auto] animate-shimmer",
        className,
      )}
    >
      {children}
    </span>
  );
}
