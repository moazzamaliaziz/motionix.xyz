/**
 * Server-safe helpers that mirror what AuthShell.tsx exposes on the client.
 * Server components can't import `'use client'` modules, so the small
 * `isAuthEnabled()` predicate lives here too.
 */

export function isAuthEnabledServer(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_"),
  );
}
