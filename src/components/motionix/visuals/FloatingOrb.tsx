"use client";

/**
 * CSS-only FloatingOrb — a wireframe sphere that pulses via CSS animation.
 * Replaces the motion/react version (~35KB gz). The scroll-driven rotation
 * was decorative and not worth the bundle cost.
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
  return (
    <div
      className={`pointer-events-none relative animate-orb-float ${className ?? ""}`}
      style={{ color }}
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
    </div>
  );
}
