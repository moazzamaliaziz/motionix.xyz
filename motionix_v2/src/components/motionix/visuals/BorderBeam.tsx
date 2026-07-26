import { cn } from "@/lib/cn";

/**
 * MagicUI-style BorderBeam — animated conic gradient stroke that travels around
 * the rounded container. Pure CSS, single-element.
 *
 * Use for primary cards in the bento grid (and trust-page cards).
 */
export function BorderBeam({
  className,
  duration = 8,
  size = 64,
  colorFrom = "var(--color-primary)",
  colorTo = "var(--color-mint)",
  thickness = 1,
}: {
  className?: string;
  duration?: number;
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  thickness?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        padding: thickness,
        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 80deg, ${colorTo} 160deg, transparent 260deg)`,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        animation: `border-spin ${duration}s linear infinite`,
      }}
    >
      <div style={{ width: size, height: size }} />
    </div>
  );
}
