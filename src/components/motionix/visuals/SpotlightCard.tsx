"use client";

import { cn } from "@/lib/cn";

/**
 * Neo-brutalist-style callout card with a hard offset shadow. Used on trust
 * pages for pronouncement-style notes ("we don't build features that need to
 * sell your data").
 */
export function SpotlightCard({
  children,
  className,
  tone = "primary",
  offset = 4,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "primary" | "sky" | "peach" | "mint" | "blush" | "ember" | "paper";
  offset?: number;
}) {
  const tones: Record<typeof tone, string> = {
    primary: "bg-primary/30 hover:bg-primary/40",
    sky: "bg-sky/70",
    peach: "bg-peach",
    mint: "bg-mint",
    blush: "bg-blush",
    ember: "bg-ember",
    paper: "bg-paper",
  };
  return (
    <div
      className={cn(
        "relative border-2 border-foreground rounded-xl p-6 transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--offset-up)_var(--offset-up)_0_var(--color-foreground)]",
        tones[tone],
        className,
      )}
      style={{
        boxShadow: `${offset}px ${offset}px 0 var(--color-foreground)`,
      }}
      onMouseMove={() => {
        /* keep the inline offset in sync with hover since we shift via -translate */
      }}
    >
      {children}
    </div>
  );
}
