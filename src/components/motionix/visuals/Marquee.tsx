import { cn } from "@/lib/cn";

/**
 * Infinite horizontal marquee. Render any number of children and they'll scroll
 * left at the same speed; render twice to keep the seam invisible.
 */
export function Marquee({
  children,
  className,
  speed = "fast",
}: {
  children: React.ReactNode;
  className?: string;
  speed?: "fast" | "normal";
}) {
  const animation = speed === "fast" ? "animate-marquee-fast" : "animate-marquee";
  return (
    <div className={cn("group relative flex overflow-hidden w-full", className)}>
      <div className={cn("flex shrink-0 items-center gap-12 pr-12", animation)}>
        {children}
      </div>
      <div className={cn("flex shrink-0 items-center gap-12 pr-12", animation)} aria-hidden>
        {children}
      </div>
      {/* edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
