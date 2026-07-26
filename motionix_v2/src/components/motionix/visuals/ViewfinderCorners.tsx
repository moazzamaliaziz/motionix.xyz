import { cn } from "@/lib/cn";

/**
 * 4 corner-tick border — viewfinder look. Aurora-style.
 * Used to frame the tool dropzone (the "this is where your file goes" hint).
 */
export function ViewfinderCorners({
  className,
  thickness = 1,
  length = 16,
  gap = 16,
  color = "var(--color-foreground)",
}: {
  className?: string;
  thickness?: number;
  length?: number;
  gap?: number;
  color?: string;
}) {
  const half = length / 2;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {[
        { t: `${gap}px`, l: `${gap}px`, br: "border-t border-l", tr: `translate(${half}, ${half})` },
        { t: `${gap}px`, r: `${gap}px`, br: "border-t border-r", tr: `translate(-${half}, ${half})` },
        { b: `${gap}px`, l: `${gap}px`, br: "border-b border-l", tr: `translate(${half}, -${half})` },
        { b: `${gap}px`, r: `${gap}px`, br: "border-b border-r", tr: `translate(-${half}, -${half})` },
      ].map((corner, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute"
          style={{
            top: corner.t,
            left: corner.l,
            right: corner.r,
            bottom: corner.b,
            width: length,
            height: length,
            borderColor: color,
            borderStyle: "solid",
            borderTopWidth: corner.br?.includes("border-t") ? thickness : undefined,
            borderBottomWidth: corner.br?.includes("border-b") ? thickness : undefined,
            borderLeftWidth: corner.br?.includes("border-l") ? thickness : undefined,
            borderRightWidth: corner.br?.includes("border-r") ? thickness : undefined,
          }}
        />
      ))}
    </div>
  );
}
