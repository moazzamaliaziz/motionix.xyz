"use client";

import { AuthSignUpButton } from "@/components/motionix/auth/AuthShell";

/**
 * Client wrapper because server components can't import the Clerk button.
 * Rendered only when auth is enabled (caller gates on `isAuthEnabledServer`).
 */
export function AuthSignUpButtonCta() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition">
      <AuthSignUpButton />
    </div>
  );
}
