"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { isAuthEnabled } from "@/components/motionix/auth/AuthShell";

/**
 * Wraps the children in a ClerkProvider if and only if a publishable key is
 * configured. When the key is missing, we render children directly — that's
 * the "guest-only" mode shown to the public during Phase 3 rollout.
 */
export function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!isAuthEnabled()) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
}
