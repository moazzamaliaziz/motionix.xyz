# Motionix.xyz

> Free, privacy-first image and video tools that work in your browser.

Motionix is a small suite of everyday media utilities — background remover,
passport photo maker, photo resizer, image compressor, signature maker,
student ID and resume photo maker, video compressor. Everything runs in the
browser; files never touch our server unless you explicitly ask for an
optional cloud upload (R2, gated on env).

## Stack

- **Next.js 16** App Router, Turbopack, React Server Components
- **TypeScript** strict mode
- **Tailwind v4** + custom OKLCH palette (cream / ink / paper)
- **Client-side tooling:** `@imgly/background-removal`, `mediabunny`,
  `upng-js`, browser Canvas + WebCodecs APIs.
- **Auth (optional):** Clerk — gracefully falls back to guest mode when not configured.
- **Storage (optional):** MongoDB for history, Cloudflare R2 for cloud uploads.
- **Payments (optional):** Stripe Payment Links (no Checkout Sessions).
- **Email (optional):** Resend for transactional mail.
- **Errors (optional):** Sentry.
- **Analytics (optional):** GA4 + Plausible + Microsoft Clarity, all gated.

## Architecture

```
src/
  app/              App Router pages, /api routes, blog ([slug])
  components/
    motionix/
      auth/         Clerk provider + AuthShell gate
      analytics/    AnalyticsProvider (GA4/Plausible/Clarity scripts)
      layout/       SiteHeader, SiteFooter, LenisProvider, HistoryDrawer
      marketing/    Landing-page sections
      tool/         ToolShell, ToolBody, ToolDropzone, drop-in buttons
        tools/      8 lazy-loaded tool implementations
      visuals/      13 design primitives (Aurora, BorderBeam, Spotlight…)
                  (we deleted 12 more than we needed in the ponytail audit)
  lib/              cn, tools (registry), schema (JSON-LD), auth-server,
                    history, mongo-server, r2-server, r2-client, r2-cleanup,
                    stripe-links, email, analytics, blog
  content/blog/     MDX posts (loaded at build time by lib/blog.ts)
public/og/          Branded OG images for the landing page + each tool
```

## Getting started

```bash
npm install
cp .env.example .env.local       # then fill in what you need (most are optional)
npm run dev
```

Open `http://localhost:3000`. Every tool works with zero env vars set.

## Adding a tool

1. Add the entry in `src/lib/tools.ts`. The registry drives the `/tools`
   index, the dynamic `/tools/[slug]` route, OG images, JSON-LD, and the
   sitemap in one place.
2. Create the implementation in `src/components/motionix/tool/tools/`.
   Use the existing impls as a reference; the `dynamic` wrapper handles
   code-splitting.
3. Add the tool to `src/components/motionix/tool/tools/dynamic.tsx` for
   lazy loading.
4. Drop an OG PNG at `public/og/tools/<slug>-og.png` (1200×630). The
   `generateStaticParams` in `/tools/[slug]/page.tsx` will pick it up.

Reusable bits already in place: `ToolDropzone`, `ToolResult`, `ToolFaq`,
`ToolSteps`, `ToolFeedback`, `ToolChain`, `SaveToHistory`,
`CloudflareUpload`. Drop these into the result panel rather than rebuilding
the same buttons per tool.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | `next dev` (Turbopack) |
| `npm run build` | `next build` |
| `npm run start` | `next start` (production) |
| `npm run lint` | `eslint .` |

The CI workflow (`.github/workflows/ci.yml`) runs all three on every PR.

## Deploy

The repo is wired for Vercel out of the box. See [Deploy](#deploy) below.

## Privacy stance

- Tools process files in your browser tab wherever possible. Nothing
  leaves your device unless you click an opt-in "Save to cloud" button.
- Server-side persistence (history, optional cloud upload) is gated on
  environment variables. Without R2/MongoDB configured, the site operates
  in pure ephemeral mode.
- We log nothing about tool runs unless analytics are explicitly enabled.
  See `src/lib/analytics.ts` for what's sent and to whom.

## License

MIT — see [LICENSE](./LICENSE).

---

Made with a small slice of pineapple pizza.
