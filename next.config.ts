import type { NextConfig } from "next";
import type { SentryBuildOptions } from "@sentry/nextjs";

/**
 * Core Next.js config. Conditionally wrapped with Sentry at runtime via
 * the `withSentryConfig()` helper below so we can skip the wrapper entirely
 * when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN are missing.
 *
 * The wrapper doesn't add significant build time when DSNs are absent;
 * however, leaving it always-on would attach Sentry's `runAfterProductionCompile`
 * hook unconditionally, which we want to avoid for now.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@paper-design/shaders-react",
      "motion",
    ] as never,
  },

  serverExternalPackages: ["mongodb"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.img.ly" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },

  async headers() {
    return [
      {
        // Default strict CSP — applies to everything except the ONNX tool routes below.
        source: "/((?!tools/background-remover|tools/passport-photo-maker).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.img.ly",
              "worker-src 'self' blob:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://cdn.img.ly",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // ONNX/WASM permissions tool pages.
        source: "/tools/(background-remover|passport-photo-maker)(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.img.ly",
              "worker-src 'self' blob:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://cdn.img.ly https://**.r2.cloudflarestorage.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

/* ------------------------------------------------------------------ */
/*  Sentry wrapper — only activates when an env var is set at build.   */
/* ------------------------------------------------------------------ */

const sentryDsn =
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
const sentryOrg = process.env.SENTRY_ORG ?? "";
const sentryProject = process.env.SENTRY_PROJECT ?? "";
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN ?? "";

let resolvePromise: Promise<NextConfig> | null = null;
function getWrappedConfig(): Promise<NextConfig> {
  if (resolvePromise) return resolvePromise;
  resolvePromise = (async () => {
    if (!sentryDsn) return nextConfig;
    const { withSentryConfig } = await import("@sentry/nextjs");
    const options: SentryBuildOptions = {
      org: sentryOrg || undefined,
      project: sentryProject || undefined,
      authToken: sentryAuthToken || undefined,
      sourcemaps: { disable: process.env.NODE_ENV !== "production" },
      silent: true,
      disableLogger: true,
      bundleSizeOptimizations: {
        excludeDebugStatements: true,
        excludeTracing: false,
      },
    };
    return withSentryConfig(nextConfig, options);
  })();
  return resolvePromise;
}

/**
 * Default export — Next.js calls this with `{ phase, defaultConfig }` and
 * expects a NextConfig object back. We `await` our cached wrapper so the
 * Sentry plugin is only loaded when at least one DSN env var is set.
 *
 * When Sentry is not configured (the common case during local dev), the
 * wrapper resolves immediately and we return `nextConfig` unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function resolveNextConfig(
  _phase: string,
  _defaults: { defaultConfig: NextConfig },
): Promise<NextConfig> {
  return await getWrappedConfig();
}

