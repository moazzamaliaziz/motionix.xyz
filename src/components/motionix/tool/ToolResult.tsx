"use client";

import { cn } from "@/lib/cn";

export function ToolResult({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-foreground/10 bg-white/70 p-6 md:p-8 space-y-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
