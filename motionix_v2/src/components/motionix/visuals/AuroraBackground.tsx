import type { ComponentPropsWithoutRef } from "react";

/**
 * CSS-only aurora background — blurred radial gradients drifting in the background.
 * No JS, zero cost. Used as a section backdrop.
 */
export function AuroraBackground({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 ${className ?? ""}`}
      {...props}
    >
      <div className="absolute top-[-20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-sky/60 blur-[140px] animate-drift" />
      <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-peach/70 blur-[130px] animate-drift" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-[50%] left-[20%] w-[55%] h-[55%] rounded-full bg-mint/55 blur-[140px] animate-drift" style={{ animationDelay: "-8s" }} />
      <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-blush/55 blur-[140px] animate-drift" style={{ animationDelay: "-12s" }} />
    </div>
  );
}
