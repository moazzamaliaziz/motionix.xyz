"use client";

import { useEffect, useRef } from "react";
import { adsenseClient, adsEnabled } from "@/lib/ads";

/**
 * A single reserved-height AdSense slot.
 *
 * Placement rule (privacy promise, en.json Pricing/FAQ a5): ads render ONLY on
 * blog and marketing surfaces — NEVER inside tool workspaces. Do not mount this
 * under /tools/*.
 *
 * CLS safety: the container reserves a fixed min-height before the ad fills in,
 * so the ad arriving never shifts surrounding content.
 *
 * When NEXT_PUBLIC_ADSENSE_CLIENT is unset, the component renders nothing.
 */
export function AdSlot({
  slot,
  minHeight = 280,
  className,
  label = "Advertisement",
}: {
  /** AdSense ad-unit slot id (data-ad-slot). */
  slot: string;
  /** Reserved height in px to prevent layout shift. */
  minHeight?: number;
  className?: string;
  label?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled() || pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense not ready yet — it retries on next mount. */
    }
  }, []);

  if (!adsEnabled()) return null;

  return (
    <aside
      aria-label={label}
      className={className}
      style={{ minHeight, display: "block", overflow: "hidden" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={adsenseClient()}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
