import type { NextConfig } from "next";
import type { SentryBuildOptions } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Core Next.js config. Conditionally wrapped with Sentry at runtime via
 * the `withSentryConfig()` helper below so we can skip the wrapper entirely
 * when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN are missing.
 */
const baseConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
    ] as never,
  },

  serverExternalPackages: ["mongodb", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.img.ly" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },

  async headers() {
    const onnxCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdn.img.ly https://staticimgly.com",
      "worker-src 'self' blob:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' blob: https://cdn.img.ly https://staticimgly.com https://*.r2.cloudflarestorage.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const onnxHeaders = [
      { key: "Content-Security-Policy", value: onnxCsp },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
    ];

    // ONNX tool slugs that need wasm-unsafe-eval + COOP/COEP
    const onnxSlugs = [
      "background-remover",
      "passport-photo-maker",
      "student-id-photo-maker",
      "resume-photo-maker",
    ];

    const onnxRoutes = onnxSlugs.flatMap((slug) => [
      // Without locale prefix (default locale)
      { source: `/tools/${slug}/:path*`, headers: onnxHeaders },
      // With locale prefix
      { source: `/:locale/tools/${slug}/:path*`, headers: onnxHeaders },
    ]);

    return [
      ...onnxRoutes,
      {
        // Default CSP — applies to all routes.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.img.ly https://staticimgly.com",
              "worker-src 'self' blob:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' blob: https://cdn.img.ly https://staticimgly.com https://*.r2.cloudflarestorage.com",
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
    const config = withNextIntl(baseConfig);
    if (!sentryDsn) return config;
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
    return withSentryConfig(config, options);
  })();
  return resolvePromise;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function resolveNextConfig(
  _phase: string,
  _defaults: { defaultConfig: NextConfig },
): Promise<NextConfig> {
  return await getWrappedConfig();
}
