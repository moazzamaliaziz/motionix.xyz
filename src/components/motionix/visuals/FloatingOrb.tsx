"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Fourmula-inspired FloatingOrb — a wireframe sphere that rotates + drifts
 * with scroll, no Three.js.
 */
export function FloatingOrb({
  className,
  size = 180,
  color = "currentColor",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div ref={ref} className={`pointer-events-none relative ${className ?? ""}`}>
      <motion.div
        style={{ rotate, y, color }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-current via-current/80 to-current/40 blur-2xl opacity-30" />
        <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
          <defs>
            <linearGradient id="orb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={`h${i}`}
              cx="100"
              cy="100"
              rx="80"
              ry={10 + i * 9}
              fill="none"
              stroke="url(#orb-grad)"
              strokeWidth="0.6"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={`v${i}`}
              cx="100"
              cy="100"
              rx={10 + i * 9}
              ry="80"
              fill="none"
              stroke="url(#orb-grad)"
              strokeWidth="0.6"
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
