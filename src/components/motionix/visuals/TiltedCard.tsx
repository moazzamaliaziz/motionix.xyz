"use client";

import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * CSS-only 3D tilt card. On pointermove, the card tilts via CSS transform;
 * on leave, it springs back. No animation library — just inline style updates
 * and CSS transitions. ~35KB gz lighter than the motion/react version.
 */
export function TiltedCard({
  children,
  className,
  intensity = 12,
  scaleOnHover = 1.02,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  scaleOnHover?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(1400px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale(${scaleOnHover})`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        willChange: "transform",
        ...style,
      }}
      className={cn("relative", className)}
    >
      {children}
    </div>
  );
}
