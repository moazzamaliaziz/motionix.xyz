"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { pageview, gaEnabled, plausibleEnabled, clarityEnabled } from "@/lib/analytics";

/**
 * AnalyticsProvider — drops the appropriate script tags when the matching
 * env vars are set, and emits a `pageview` event on every route change.
 *
 * Stays a no-op when no providers are configured.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    pageview(pathname);
  }, [pathname]);

  return (
    <>
      {gaEnabled() ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { send_page_view: false });`}
          </Script>
        </>
      ) : null}

      {plausibleEnabled() ? (
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}

      {clarityEnabled() ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");`}
        </Script>
      ) : null}
    </>
  );
}
