"use client";

import Script from "next/script";
import { adsenseClient, adsEnabled } from "@/lib/ads";

/**
 * Loads the AdSense script once, only when NEXT_PUBLIC_ADSENSE_CLIENT is set.
 * Mirrors AnalyticsProvider's env-gated, afterInteractive loading so ads never
 * block first paint or hurt Core Web Vitals. No-op when unconfigured.
 */
export function AdsenseLoader() {
  if (!adsEnabled()) return null;
  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient()}`}
      crossOrigin="anonymous"
    />
  );
}
