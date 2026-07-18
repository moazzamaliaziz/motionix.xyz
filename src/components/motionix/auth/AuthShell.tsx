"use client";

import Link from "next/link";
import {
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  useAuth as clerkUseAuth,
} from "@clerk/nextjs";

/**
 * Auth-aware header right-hand segment. Wraps Clerk's primitives behind
 * a guard: when no Clerk publishable key is set we render nothing rather
 * than crash on import time.
 */

const PUBLISHABLE = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function isAuthEnabled(): boolean {
  return PUBLISHABLE.startsWith("pk_");
}

export const AuthSignInButton = (props: { className?: string; children?: React.ReactNode }) =>
  isAuthEnabled() ? (
    <span className={props.className}>
      <ClerkSignInButton>{props.children ?? "Sign in"}</ClerkSignInButton>
    </span>
  ) : null;

export const AuthSignUpButton = (props: { className?: string; children?: React.ReactNode }) =>
  isAuthEnabled() ? (
    <span className={props.className}>
      <ClerkSignUpButton>{props.children ?? "Sign up"}</ClerkSignUpButton>
    </span>
  ) : null;

/**
 * Renders children only when the user is signed in. When Clerk isn't
 * configured we render the children unconditionally (guest-mode).
 */
export function AuthSignedIn({ children }: { children: React.ReactNode }) {
  if (!isAuthEnabled()) return <>{children}</>;
  // Use useAuth gate inline to avoid missing `SignedIn`/`SignedOut` exports.
  return <SignInGateSigned>{children}</SignInGateSigned>;
}

function SignInGateSigned({ children }: { children: React.ReactNode }) {
  const auth = clerkUseAuth();
  if (!auth.isSignedIn) return null;
  return <>{children}</>;
}

export function AuthUserButton(props: { className?: string }) {
  if (!isAuthEnabled()) return null;
  // Clerk v7 UserButton uses a different prop surface; wrap with a span for sizing.
  return (
    <span className={props.className}>
      <ClerkUserButton />
    </span>
  );
}

export function useAuthEnabled() {
  if (!isAuthEnabled()) {
    return { isSignedIn: false, isLoaded: true, userId: null } as const;
  }
  const auth = clerkUseAuth();
  return {
    isSignedIn: auth.isSignedIn ?? false,
    isLoaded: auth.isLoaded ?? true,
    // Clerk v7: useUser for actual id; here we just provide a presence flag
    userId: auth.isSignedIn ? "self" : null,
  } as const;
}

export function AuthStatusBadge() {
  if (!isAuthEnabled()) {
    return (
      <Link
        href="/about"
        className="text-[12px] text-foreground/45 px-3 hover:text-foreground/70 transition"
        aria-label="Auth not configured"
      >
        guest mode
      </Link>
    );
  }
  return null;
}
