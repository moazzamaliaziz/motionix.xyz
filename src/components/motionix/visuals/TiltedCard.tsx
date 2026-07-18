"use client";

import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Fourmula-inspired Tilt3D port. On pointermove, the card tilts in 3D with a soft
 * spring; on leave, it returns to flat. Uses motion springs, no per-frame JS.
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
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sy = useSpring(ry, { stiffness: 220, damping: 18 });
  const rotX = useTransform(sx, (v) => -v);
  const rotY = useTransform(sy, (v) => v);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(x * intensity);
    rx.set(y * intensity);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transformPerspective: 1400,
        rotateX: rotX,
        rotateY: rotY,
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn("relative will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
