# Motionix.xyz — Agent Context

## Project Identity
- **Name:** Motionix (motionix.xyz)
- **Repo:** `https://github.com/moazzamaliaziz/motionix.xyz.git` (private)
- **Stack:** Next.js 16.2.10 App Router + Turbopack + TypeScript strict + Tailwind v4 + OKLCH palette
- **Deploy:** Vercel (Hobby plan, max 1 cron job/day)
- **Runtime:** Node 24, npm 11

## Design System
- **Palette:** OKLCH "Aura pastels" on warm paper background (`oklch(0.985 0.008 80)`)
- **Tool pages:** Cream/ink neutrals via `[data-mode="tool"]` attribute
- **Fonts:** Inter (body), Inter Tight (display/headings), JetBrains Mono (code) — all via `next/font/google`, self-hosted
- **Animations:** CSS-only (no motion lib). Keyframes: fade-up, wash-in, float-y, marquee-x, pulse-ring, shimmer, sparkle, drift, orb-float
- **Rounded corners:** 1rem base radius, scale from sm to 3xl
- **Primary color:** `oklch(0.74 0.14 38)` (warm coral/amber)
- **Accessibility:** `:focus-visible` outlines, `prefers-reduced-motion` kills all animations, skip-to-content link

## Architecture
```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, Clerk, Analytics)
│   ├── globals.css             # Tailwind + OKLCH theme + keyframes
│   ├── [locale]/
│   │   ├── layout.tsx          # NextIntlClientProvider wrapper
│   │   ├── page.tsx            # Home page (Hero, Stats, Workflow, Pricing, FAQ, etc.)
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── cookies/page.tsx
│   │   ├── sitemap/page.tsx    # HTML sitemap
│   │   ├── blog/[slug]/page.tsx
│   │   └── tools/
│   │       ├── layout.tsx      # BackgroundRemovalPreloader
│   │       └── [slug]/page.tsx # Dynamic tool pages
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth pages with NextIntlClientProvider
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   └── api/
│       ├── contact/route.ts
│       ├── uploads/route.ts
│       ├── uploads/probe/route.ts
│       ├── downloads/[key]/route.ts
│       ├── history/route.ts
│       └── admin/cleanup/route.ts
├── components/
│   └── motionix/
│       ├── auth/               # OptionalClerkProvider
│       ├── analytics/          # AnalyticsProvider (GA4, Plausible, Clarity)
│       ├── layout/             # SiteHeader, SiteFooter, AnnouncementBar, LanguageSwitcher
│       ├── marketing/          # Hero, StatsMarquee, WorkflowGrid, PricingCards, etc.
│       └── tool/               # ToolSteps, ToolFaq, ToolUseCasesBento, ToolChain, RefineCanvas
├── hooks/
│   └── useBackgroundRemoval.ts # Singleton ONNX model hook (WebGPU detection)
├── i18n/
│   ├── config.ts               # locales, defaultLocale, localeNames, localeFlags
│   ├── request.ts              # getRequestConfig (dynamic import messages/{locale}.json)
│   ├── routing.ts              # defineRouting (localePrefix: "as-needed")
│   └── navigation.ts           # createNavigation (Link, redirect, usePathname, useRouter)
├── lib/
│   ├── tools.ts                # Tool definitions (8 tools, slugs, metadata, steps, FAQs)
│   ├── cn.ts                   # clsx + twMerge utility
│   ├── schema.ts               # JSON-LD structured data
│   └── rate-limit.ts           # In-memory sliding-window rate limiter
messages/
├── en.json                     # English dictionary (~590 lines)
├── fr.json                     # French ✅
├── de.json                     # German ✅
├── ja.json                     # Japanese ✅
├── zh-cn.json                  # Simplified Chinese ✅
└── hi.json                     # Hindi ❌ NOT CREATED YET
```

## 8 Tools — ALL Functional, ALL Client-Side

| # | Slug | Engine | Key Features |
|---|------|--------|-------------|
| 1 | `background-remover` | ONNX (ISNet fp16) | Progress bar, refine canvas (brush restore/erase), undo, export history |
| 2 | `passport-photo-maker` | Canvas compliance | US/UK/India/Schengen presets, strict mode (no face edit), AI mode |
| 3 | `student-id-photo-maker` | Canvas presets | Common App, scholarship, exam-day specs |
| 4 | `resume-photo-maker` | Canvas + AI bg swap | LinkedIn/ resume/ CV framing, neutral backgrounds |
| 5 | `signature-maker` | Canvas draw/upload | Draw, type, or upload scan → transparent PNG/SVG |
| 6 | `photo-resizer` | Canvas resize | Exact pixel dimensions + KB target |
| 7 | `image-compressor` | Canvas compress | Quality/KB targets, side-by-side preview |
| 8 | `video-compressor` | WebCodecs/Mediabunny | Target size/quality, H.264 hardware pipeline |

**ONNX tools** (1-4) need special CSP headers (`wasm-unsafe-eval`, `blob:`, `staticimgly.com`) and COOP/COEP headers. Configured in `next.config.ts` with path wildcards.

## i18n (next-intl)
- **Locales:** en, fr, de, hi, ja, zh-cn
- **Strategy:** `localePrefix: "as-needed"` (en = unprefixed, others get `/fr/`, `/de/`, etc.)
- **Middleware:** `src/i18n/routing.ts` → `middleware.ts` (ROOT level)
- **Components:** All use `useTranslations()` (client) or `getTranslations()` (server)
- **LanguageSwitcher:** In header, persists to localStorage

### What's done:
- English dictionary: `messages/en.json` (complete, ~590 lines, all sections)
- fr.json, de.json, ja.json, zh-cn.json: Written to disk but NOT committed
- All pages moved to `[locale]/` directory
- All components use translations

### What's TODO:
1. **Create `hi.json`** (Hindi/Devanagari translation of en.json)
2. **Per-locale XML sitemaps** with hreflang alternates
3. **hreflang metadata** in `generateMetadata` on all pages
4. **Commit + push** all uncommitted i18n files
5. **Verify Vercel deploy** builds successfully

## Integrations (ALL env-gated — zero env vars = site still works)
- **Clerk:** Auth (sign-in/sign-up). Without key → guest mode, all tools work
- **MongoDB:** History persistence. Without URI → history disabled
- **Cloudflare R2:** Cloud uploads. Without keys → upload button self-hides
- **Stripe:** Payment links. Without keys → "free only" mode
- **Resend:** Transactional email (contact form). Without key → email disabled
- **Sentry:** Error tracking. Without DSN → no error reporting
- **Analytics:** GA4, Plausible, Clarity. Without IDs → no tracking

## CSP Headers
- **Default:** Standard security headers (nosniff, strict-origin, permissions-policy)
- **ONNX routes** (`/tools/background-remover/*`, etc.): Additional `wasm-unsafe-eval`, `blob:`, COOP/COEP
- **Locale-prefixed routes** (`/:locale/tools/background-remover/*`): Same ONNX headers

## Build & Deploy
- `npm run build` → Turbopack production build
- `npm run lint` → ESLint
- Vercel auto-deploys from `main` branch
- Cron: `/api/admin/cleanup` at 3am daily (Hobby plan)

## Key Files to Read Before Making Changes
1. `src/lib/tools.ts` — Tool definitions (single source of truth)
2. `messages/en.json` — Translation dictionary structure
3. `src/i18n/config.ts` — Locale configuration
4. `next.config.ts` — CSP headers, Sentry, next-intl plugin
5. `src/app/globals.css` — Design tokens, animations, utilities
6. `src/hooks/useBackgroundRemoval.ts` — ONNX model management
7. `middleware.ts` — Locale detection routing

## Git Hygiene
- `.gitignore` covers `.env*`, `.next/`, `*.log`, `*.out`, `*.tmp`, `*.tsbuildinfo`, `node_modules/`
- Never commit env files, secrets, or personal information
- Private repo — all changes go through `main` branch
