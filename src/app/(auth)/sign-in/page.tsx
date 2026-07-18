"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { AuthSignInButton } from "@/components/motionix/auth/AuthShell";
import { isAuthEnabledServer } from "@/lib/auth-server";

/**
 * Sign-in page — Clerk-hosted when auth is configured, falls back to a
 * friendly "sign in to unlock history" explainer otherwise.
 */

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const next = params?.redirect ?? "/tools";

  if (isAuthEnabledServer()) {
    return (
      <Suspense>
        <main className="mx-auto max-w-md px-6 py-40 text-center">
          <p className="eyebrow-mono text-primary mb-2">Sign in</p>
          <h1 className="font-display text-4xl tracking-tight mb-6">Welcome back.</h1>
          <p className="text-foreground/60 mb-8">
            Sign in to keep your tools&apos; history, batch process, and pick up where you left off.
          </p>
          <AuthSignInButton />
        </main>
      </Suspense>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-40">
        <p className="eyebrow-mono text-primary mb-2">Sign in</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight">History is coming.</h1>
        <p className="mt-4 text-foreground/60">
          Motionix&apos;s account system isn&apos;t live on this site yet. We&apos;re staging it
          and it&apos;ll roll out within a week of launch. In the meantime, every
          tool is fully functional without an account — your files stay in
          your browser.
        </p>
        <Link
          href={next}
          className="inline-flex mt-8 items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-primary transition"
        >
          Use a tool now →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
