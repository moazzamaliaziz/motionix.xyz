"use client";

import { cn } from "@/lib/cn";

/**
 * MagicUI-port SparklesText. Tiny CSS-only sparkle particles animate around text.
 */
export function SparklesText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="sparkle-dot top-0 left-[0%] [animation-delay:0.2s]" />
      <span aria-hidden className="sparkle-dot top-[10%] left-[33%] [animation-delay:0.6s]" />
      <span aria-hidden className="sparkle-dot top-[20%] left-[66%] [animation-delay:1.0s]" />
      <span aria-hidden className="sparkle-dot top-[35%] left-[20%] [animation-delay:1.4s]" />
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50%      { opacity: 1; transform: scale(1); }
        }
        .sparkle-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: var(--color-primary);
          box-shadow: 0 0 6px var(--color-primary);
          opacity: 0;
          animation: sparkle 3.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-dot { display: none; }
        }
      `}</style>
    </span>
  );
}
