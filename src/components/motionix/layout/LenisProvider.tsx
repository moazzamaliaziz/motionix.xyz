"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps the entire app in a Lenis smooth-scroll provider.
 * Shuts down on /tools/* routes so drag-drop precision isn't impacted by
 * momentum scrolling. Re-enabled immediately on every other route.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      <RouteAwareGate>{children}</RouteAwareGate>
    </ReactLenis>
  );
}

function RouteAwareGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisCtx = useLenis();

  useEffect(() => {
    // `useLenis()` returns the Lenis instance in 1.3.x
    const instance: any = (lenisCtx as any)?.lenis ?? lenisCtx;
    if (!instance?.stop || !instance?.start) return;
    if (pathname?.startsWith("/tools")) instance.stop();
    else instance.start();
  }, [pathname, lenisCtx]);

  return <>{children}</>;
}
