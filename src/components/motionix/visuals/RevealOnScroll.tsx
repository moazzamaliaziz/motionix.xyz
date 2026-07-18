"use client";

import { useEffect, useRef, type ElementType, type RefObject, createElement } from "react";
import { cn } from "@/lib/cn";

/**
 * Aura-port Reveal. Wraps children; the wrapper fades up + moves into place
 * once it has 12% visibility. Single IntersectionObserver per element.
 *
 * Avoid hydration mismatches by starting in the visible (final) state and
 * only animating if JS hydrates and the element hasn't been seen yet.
 */
export function RevealOnScroll({
  children,
  as: As = "div",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity 0.9s var(--ease-out-expo) ${delay}ms, transform 0.9s var(--ease-out-expo) ${delay}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return createElement(
    As,
    Object.assign(
      { ref: ref as RefObject<HTMLElement>, className: cn(className) },
      {},
    ),
    children,
  );
}
