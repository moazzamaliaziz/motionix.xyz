"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * MagicUI-port NumberTicker. Counts up to `value` when scrolled into view once.
 * IntersectionObserver-based, ~30 LOC, no animation lib.
 */
export function NumberTicker({
  value,
  duration = 1.4,
  format = (n) => Intl.NumberFormat("en", { notation: "compact" }).format(n),
  className,
  prefix,
  suffix,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let started = false;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || started) continue;
          started = true;
          const begin = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - begin) / (duration * 1000));
            const ease = 1 - Math.pow(1 - t, 3);
            setDisplay(value * ease);
            if (t < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration, value]);

  return (
    <span ref={ref} className={cn("tabular-nums tracking-tight", className)}>
      {prefix}
      {format(Number(display.toFixed(decimals)))}
      {suffix}
    </span>
  );
}
