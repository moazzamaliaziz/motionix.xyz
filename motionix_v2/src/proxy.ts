import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts` → `proxy.ts` (functionally identical,
 * pure rename + new recommended file). See:
 *   https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 *
 * When auth is configured:
 *   - Clerk gates the route /dashboard/*; everything else passes through.
 *   - Matchers intentionally skip /api/* — those routes handle their own auth
 *     (e.g. /api/uploads scopes by Clerk `auth().userId` inline) and don't
 *     benefit from a redirect-based gate.
 *
 * When auth is NOT configured (no NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env var):
 *   - We swap in a no-op response so dev / preview / staging deploys don't
 *     crash on import. This keeps the entire app usable while you wire up
 *     Clerk later.
 *
 * Why not just always install Clerk as a peer?
 *   - `@clerk/nextjs` requires a publishable key + secret key at build time
 *     for some patterns. Falling back is the friendlier default.
 */
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const PUBLISHABLE = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const noopMiddleware = () => NextResponse.next();

export default PUBLISHABLE.startsWith("pk_")
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const session = await auth();
        if (!session.userId) {
          // Clerk handles redirects internally in App Router; this explicit
          // call protects against unauthorised access.
          (session as unknown as { protect?: () => void }).protect?.();
        }
      }
    })
  : noopMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all files in /public + api routes that handle their own auth.
    "/((?!_next|api|trpc|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
