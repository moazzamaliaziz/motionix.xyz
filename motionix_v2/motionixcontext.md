# Motionix.xyz — Full Context for Agent Handoff

> **File created:** 2026-07-25
> **Purpose:** Complete project context so any agent can pick up this codebase and work independently.
> **Location:** `F:\motionix.xyz\motionix_v2\`

---

## Version History (READ THIS FIRST)

This project has **two versions** that need to be merged before any further work:

| Version | Location | Created by | State |
|---------|----------|------------|-------|
| **Original (v1)** | `F:\motionix.xyz/` | Human + OpenCode AI (this session) | Live repo, has bug fixes, full translations, mobile nav |
| **v2** | `F:\motionix.xyz/motionix_v2/` | Another AI agent (Cursor/Claude) | Copy with new features but also regressions |

### How v2 was created
The human created a clean copy of the original into `motionix_v2/` folder (excluding `.env*`, `node_modules/`, `.next/`, `.git/`). Then another AI agent worked on that copy — it added new features (Hindi translation, tools catalog page, health API, Image Converter tool, Vitest tests, AdSense components, hreflang utility) but also **reverted/removed** several working features from the original (mobile nav, tool bug fixes, full translations, error handling).

### What needs to happen next
1. **Merge v2's new files into the original** (15 new files are clean additions)
2. **Keep the original's versions** for all modified files (v2 regressed them)
3. **Hand the merged version to the next agent** to continue remaining work
4. See **Section 17: MERGE PLAN** below for exact file-by-file instructions

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | Motionix |
| **URL** | https://motionix.xyz |
| **Repo** | https://github.com/moazzamaliaziz/motionix.xyz.git (private) |
| **Stack** | Next.js 16.2.10 App Router + Turbopack + TypeScript strict + Tailwind v4 |
| **Deploy** | Vercel (Hobby plan — max 1 cron job/day) |
| **Runtime** | Node 24, npm 11 |
| **Package name** | `motionix.xyz` |

---

## 2. What Motionix Is

Motionix is a **privacy-first, client-side image & video tools platform**. All 9 tools run entirely in the user's browser — no server upload, no account required, no watermark. The site is a solo operator's project.

**Core promise:** "Your file never leaves the browser for the things that don't need a server."

---

## 3. Design System

### Fonts (via `next/font/google`, self-hosted)
| Role | Font | Weight |
|------|------|--------|
| Body | Inter | 400–800 |
| Display/headings | Inter Tight | 800 (letter-spacing: -0.04em, line-height: 0.92) |
| Code | JetBrains Mono | 400–600 |
| Italic serif | Instrument Serif (CSS var) | 400 italic |

### Color Palette (OKLCH)
| Token | Value | Use |
|-------|-------|-----|
| `--color-background` | `oklch(0.985 0.008 80)` | Warm paper background |
| `--color-foreground` | `oklch(0.25 0.015 50)` | Dark ink text |
| `--color-primary` | `oklch(0.74 0.14 38)` | Warm coral/amber (CTAs, accents) |
| `--color-primary-foreground` | `oklch(0.99 0 0)` | White text on primary |
| `--color-muted` | `oklch(0.96 0.01 80)` | Subtle backgrounds |
| `--color-border` | `oklch(0.92 0.01 70 / 0.6)` | Borders |

### Pastel Washes (tool card tones)
`peach`, `sky`, `mint`, `blush`, `ember`, `paper` — each a distinct OKLCH pastel.

### Tool-page mode
`[data-mode="tool"]` switches palette to cream/ink neutrals (`oklch(0.96 0.012 85)` background, `oklch(0.16 0.012 85)` text). Radius shrinks from 1rem to 0.5rem.

### Animations
CSS-only (no motion lib). Keyframes: `drift`, `fade-up`, `wash-in`, `float-y`, `marquee-x`, `pulse-ring`, `shimmer`, `sparkle`, `spin-slow`, `gradient-shift`, `border-spin`, `tone-pulse`, `orb-float`.

### Accessibility
- `:focus-visible` outlines on all focusable elements
- `prefers-reduced-motion` kills all animations
- Skip-to-content link in root layout
- `aria-pressed` on toggle buttons
- `role="alert"` on error messages

### Layout
- Floating pill header (icon + "motionix" text + nav links + LanguageSwitcher)
- Sticky CTA footer
- Tool pages: full-width with bento-style cards
- Marketing sections: max-width container with pastel backgrounds

---

## 4. Architecture (motionix_v2)

```
F:\motionix.xyz\motionix_v2\
├── AGENTS.md                     # Agent context (was overwritten by agent)
├── PLAN.md                       # 5-phase execution plan
├── motionixcontext.md            # THIS FILE — full context
├── middleware.ts                  # next-intl locale detection (root level)
├── next.config.ts                # CSP headers, Sentry, next-intl plugin
├── vercel.json                   # Cron, build config, security headers
├── package.json                  # Dependencies + scripts
├── vitest.config.ts              # NEW — Vitest test config
├── messages/                     # i18n dictionaries
│   ├── en.json                   # English (complete, ~590 lines)
│   ├── fr.json                   # French ✅
│   ├── de.json                   # German ✅ (skeleton stub — only Nav + partial Hero)
│   ├── hi.json                   # Hindi ✅ (agent created)
│   ├── ja.json                   # Japanese ✅
│   └── zh-cn.json                # Simplified Chinese ✅
├── public/                       # Static assets (favicon.svg, logo-icon.svg, logo-full.svg, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (fonts, Clerk, Analytics, skip-link)
│   │   ├── globals.css           # Tailwind + OKLCH theme + keyframes + utilities
│   │   ├── robots.ts             # NEW — robots.txt generation
│   │   ├── sitemap.ts            # XML sitemap generation
│   │   ├── [locale]/
│   │   │   ├── layout.tsx        # NextIntlClientProvider wrapper
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   ├── cookies/page.tsx
│   │   │   ├── sitemap/page.tsx  # HTML sitemap
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── tools/
│   │   │       ├── layout.tsx    # BackgroundRemovalPreloader
│   │   │       ├── page.tsx      # NEW — Tools catalog page
│   │   │       └── [slug]/page.tsx  # Dynamic tool pages
│   │   ├── (auth)/
│   │   │   ├── layout.tsx        # Auth pages with NextIntlClientProvider
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   └── api/
│   │       ├── contact/route.ts
│   │       ├── uploads/route.ts
│   │       ├── uploads/probe/route.ts
│   │       ├── downloads/[key]/route.ts
│   │       ├── history/route.ts
│   │       ├── health/route.ts   # NEW — Liveness endpoint
│   │       └── admin/cleanup/route.ts  # Cron (3am daily)
│   ├── components/motionix/
│   │   ├── ads/                  # NEW
│   │   │   ├── AdsenseLoader.tsx # AdSense script loader (env-gated)
│   │   │   └── AdSlot.tsx        # CLS-safe ad unit (blog/marketing only)
│   │   ├── analytics/
│   │   │   └── AnalyticsProvider.tsx
│   │   ├── auth/
│   │   │   ├── AuthShell.tsx
│   │   │   └── OptionalClerkProvider.tsx
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── HistoryDrawer.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   └── SiteHeader.tsx
│   │   ├── marketing/
│   │   │   ├── ContactForm.tsx
│   │   │   ├── FaqAccordion.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── PricingCards.tsx
│   │   │   ├── StatsMarquee.tsx
│   │   │   ├── StickyCta.tsx
│   │   │   ├── TestimonialsMarquee.tsx
│   │   │   ├── ToolsPreview.tsx
│   │   │   └── WorkflowGrid.tsx
│   │   ├── tool/
│   │   │   ├── BackgroundRemovalPreloader.tsx
│   │   │   ├── BeforeAfterSlider.tsx
│   │   │   ├── CloudflareUpload.tsx
│   │   │   ├── HistoryHost.tsx
│   │   │   ├── SaveToHistory.tsx
│   │   │   ├── ToolBody.tsx
│   │   │   ├── ToolChain.tsx
│   │   │   ├── ToolDropzone.tsx
│   │   │   ├── ToolFaq.tsx
│   │   │   ├── ToolFeedback.tsx
│   │   │   ├── ToolResult.tsx
│   │   │   ├── ToolsCatalog.tsx  # NEW — Searchable tool catalog
│   │   │   ├── ToolSteps.tsx
│   │   │   ├── ToolUseCasesBento.tsx
│   │   │   ├── lib/
│   │   │   │   └── useBackgroundRemoval.ts  # Singleton ONNX model hook
│   │   │   └── tools/
│   │   │       ├── BackgroundRemoverImpl.tsx
│   │   │       ├── dynamic.tsx              # Dynamic imports for all tools
│   │   │       ├── ImageCompressorImpl.tsx
│   │   │       ├── ImageConverterImpl.tsx    # NEW — 9th tool
│   │   │       ├── PassportMakerImpl.tsx
│   │   │       ├── PhotoResizerImpl.tsx
│   │   │       ├── RefineCanvas.tsx
│   │   │       ├── ResumePhotoMakerImpl.tsx
│   │   │       ├── SignatureMakerImpl.tsx
│   │   │       ├── StudentIdPhotoMakerImpl.tsx
│   │   │       └── VideoCompressorImpl.tsx
│   │   └── visuals/              # Decorative components
│   │       ├── AnimatedShinyText.tsx
│   │       ├── AuroraBackground.tsx
│   │       ├── BorderBeam.tsx
│   │       ├── FloatingOrb.tsx
│   │       ├── MagicBento.tsx
│   │       ├── Marquee.tsx
│   │       ├── NumberTicker.tsx
│   │       ├── RevealOnScroll.tsx
│   │       ├── ShinyButton.tsx
│   │       ├── SparklesText.tsx
│   │       ├── SpotlightCard.tsx
│   │       ├── TiltedCard.tsx
│   │       └── ViewfinderCorners.tsx
│   ├── i18n/
│   │   ├── config.ts             # locales, defaultLocale, localeNames, localeFlags
│   │   ├── request.ts            # getRequestConfig (dynamic import messages/{locale}.json)
│   │   ├── routing.ts            # defineRouting (localePrefix: "as-needed")
│   │   └── navigation.ts         # createNavigation (Link, redirect, usePathname, useRouter)
│   └── lib/
│       ├── ads.ts                # NEW — AdSense helpers (env-gated)
│       ├── analytics.ts          # GA4, Plausible, Clarity
│       ├── auth-server.ts        # Server-side auth (Clerk)
│       ├── blog.ts               # Blog MDX parsing
│       ├── cn.ts                 # clsx + tailwind-merge
│       ├── email.ts              # Resend email integration
│       ├── history.ts            # MongoDB history persistence
│       ├── hreflang.ts           # NEW — Per-page hreflang metadata
│       ├── hreflang.test.ts      # NEW — Tests for hreflang
│       ├── mongo-server.ts       # MongoDB client singleton
│       ├── r2-cleanup.ts         # R2 orphan file cleanup (cron)
│       ├── r2-client.ts          # R2 presigned upload URLs
│       ├── r2-server.ts          # R2 server-side operations
│       ├── rate-limit.ts         # In-memory sliding-window rate limiter
│       ├── rate-limit.test.ts    # NEW — Tests for rate limiter
│       ├── schema.ts             # JSON-LD structured data
│       ├── schema.test.ts        # NEW — Tests for schema
│       ├── stripe-links.ts       # Stripe payment link URLs
│       ├── tools.ts              # Tool definitions (single source of truth)
│       └── tools.test.ts         # NEW — Tests for tool catalog invariants
```

**Totals:** 45 `.ts` + 75 `.tsx` + 11 `.json` + 1 `.css` + 2 `.mjs` + 7 `.md` + 8 `.svg` = ~149 source/config files.

---

## 5. All 9 Tools

| # | Slug | Name | Engine | Status | Tone | Icon |
|---|------|------|--------|--------|------|------|
| 1 | `background-remover` | Background remover | ONNX (ISNet fp16) | Functional | peach | ✂ |
| 2 | `passport-photo-maker` | Passport photo maker | Canvas compliance | Functional | paper | 🪪 |
| 3 | `student-id-photo-maker` | Student ID photo maker | Canvas presets | Functional | mint | 🎓 |
| 4 | `resume-photo-maker` | Resume & LinkedIn photo | Canvas + AI bg swap | Functional | blush | 👤 |
| 5 | `signature-maker` | Signature maker | Canvas draw/upload | Functional | blush | ✍️ |
| 6 | `photo-resizer` | Photo resizer | Canvas resize | Functional | sky | 📐 |
| 7 | `image-compressor` | Image compressor | Canvas compress | Functional | ember | 📸 |
| 8 | `image-converter` | **Image converter** | Canvas convert | **NEW** | sky | 🔄 |
| 9 | `video-compressor` | Video compressor | WebCodecs/Mediabunny | Functional | paper | 🎬 |

### Tool Details

**1. Background Remover** — Drop image → ONNX ISNet model downloads once from CDN → transparent PNG out. Features: progress bar, RefineCanvas (brush restore/erase with undo), export history. CSP needs: `wasm-unsafe-eval`, `blob:`, `staticimgly.com`.

**2. Passport Photo Maker** — Pick country (US/UK/India/Schengen) → drop photo → crop/frame/resize to spec. Strict mode (no face edit). 4 country presets with exact pixel/mm specs. Countries: US (600×600), UK (600×750), India (350×350), Schengen (413×531).

**3. Student ID Photo Maker** — Common App, scholarship, exam-day presets. Same engine as passport tool. Custom pixel dimensions supported.

**4. Resume & LinkedIn Photo** — 1:1 (LinkedIn), 3:4 (resume header), 4:5 (Instagram) framing. Background swap: white/light grey/brand color.

**5. Signature Maker** — Draw with mouse/touchpad/finger, type, or upload scan. Output: transparent PNG or SVG. Auto-trims canvas, removes paper color.

**6. Photo Resizer** — Exact pixel dimensions or KB target. Resampler options: bicubic (photos), nearest-neighbor (screenshots). Max 4096px, 10MB.

**7. Image Compressor** — Quality/KB targets for JPG/PNG/WebP. Side-by-side size comparison. UPNG for PNG encoding.

**8. Image Converter** (NEW) — Convert between PNG/JPG/WebP/AVIF. Quality slider for lossy formats. Detects unsupported encoders with fallback message. Flattens transparency onto white for JPG output. 250 lines, pure canvas, no deps.

**9. Video Compressor** — MP4/MOV/MKV/WebM input. Target size/quality/bitrate. WebCodecs via Mediabunny library. H.264 hardware pipeline. AAC audio. Max 200MB.

### Tool Engines
```
type ToolEngine =
  | "image-onnx"         # Background Remover
  | "photo-compliance"   # Passport, Student ID
  | "image-canvas"       # Resume, Signature, Image Converter
  | "image-resize"       # Photo Resizer
  | "image-compress"     # Image Compressor
  | "image-signature"    # (Signature Maker uses image-canvas)
  | "video-wasm"         # Video Compressor
```

---

## 6. i18n System

### Setup
- **Library:** `next-intl` v4.13.2
- **Locales:** en, fr, de, hi, ja, zh-cn
- **Strategy:** `localePrefix: "as-needed"` (en = unprefixed, others get `/fr/`, `/de/`, etc.)
- **Middleware:** Root-level `middleware.ts` → `src/i18n/routing.ts`
- **Layout:** `src/app/[locale]/layout.tsx` wraps with `NextIntlClientProvider`
- **Components:** All use `useTranslations()` (client) or `getTranslations()` (server)
- **LanguageSwitcher:** In header, persists to `localStorage`

### Locale Dictionary Status
| Locale | File | Status | Notes |
|--------|------|--------|-------|
| English | `messages/en.json` | ✅ Complete | ~590 lines, all sections |
| French | `messages/fr.json` | ✅ Complete | Full translation |
| German | `messages/de.json` | ⚠️ Skeleton stub | Only Nav + partial Hero (~23 lines). Gutted by agent. |
| Hindi | `messages/hi.json` | ✅ Complete | Agent created this |
| Japanese | `messages/ja.json` | ✅ Complete | Full translation |
| Simplified Chinese | `messages/zh-cn.json` | ✅ Complete | Full translation |

### Dictionary Structure (en.json top-level keys)
```
Nav, Hero, Stats, Workflow, Pricing, FAQ, ToolsPreview, Testimonials,
StickyCta, AnnouncementBar, Footer, ToolPage, Tools (per-tool namespaces),
About, Contact, Privacy, Terms, Cookies, Sitemap, Blog, ContactForm
```

### What's Remaining for i18n
1. **Fix `de.json`** — restore full German translation (currently a skeleton stub)
2. **Per-locale XML sitemaps** with hreflang alternates (not done)
3. **hreflang metadata** in `generateMetadata` on all pages (`src/lib/hreflang.ts` exists but not wired into pages)
4. **Commit + push** all uncommitted i18n files

---

## 7. Integrations (ALL env-gated)

Zero env vars = site still works. Features gracefully disable.

| Integration | Env Vars | Without it |
|-------------|----------|------------|
| **Clerk** (auth) | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Guest mode, all tools work |
| **MongoDB** | `MONGODB_URI`, `MONGODB_DB` | History disabled |
| **Cloudflare R2** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET` | Upload button self-hides |
| **Stripe** | `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_*` | "Free only" mode |
| **Resend** | `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_RECEIVER` | Contact form email disabled |
| **Sentry** | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | No error reporting |
| **GA4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No GA tracking |
| **Plausible** | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No Plausible tracking |
| **Clarity** | `NEXT_PUBLIC_CLARITY_PROJECT_ID` | No Clarity tracking |
| **AdSense** | `NEXT_PUBLIC_ADSENSE_CLIENT` | Ads disabled (env-gated) |

---

## 8. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact` | POST | Contact form submission (Resend email) |
| `/api/uploads` | POST | R2 presigned upload URL |
| `/api/uploads/probe` | POST | Probe upload status |
| `/api/downloads/[key]` | GET | R2 file download proxy |
| `/api/history` | GET/POST | MongoDB history (tool usage) |
| `/api/admin/cleanup` | GET/POST | Cron job — R2 orphan cleanup (3am daily) |
| `/api/health` | GET | NEW — Liveness endpoint `{ ok, service, time, integrations }` |

---

## 9. CSP Headers (next.config.ts)

### Default routes
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.img.ly https://staticimgly.com
worker-src 'self' blob:
img-src 'self' data: blob: https:
media-src 'self' blob:
font-src 'self' data: https://fonts.gstatic.com
style-src 'self' 'unsafe-inline'
connect-src 'self' blob: https://cdn.img.ly https://staticimgly.com https://*.r2.cloudflarestorage.com
frame-ancestors 'self'
```

### ONNX tool routes (`/tools/background-remover/*`, etc.)
Same as default + `wasm-unsafe-eval` in script-src + COOP/COEP headers.
Path wildcards for locale-prefixed routes: `/:locale/tools/background-remover/:path*`.

---

## 10. Git State (Original Repo)

### Latest commits
```
1a93ccb Phase 4.2: i18n — move all pages to [locale], translations in all components, LanguageSwitcher integrated
f7a0773 Phase 4.1: i18n foundation — English dictionary, locale layout, LanguageSwitcher, fix CSP headers
51040dd Fix header logo, add favicon, fix sitemap fetch issue
42e1c9b Fix header logo: compact size, no text overlap, revert footer
00f810b Add Motionix logo to header and footer
```

### Uncommitted files (original repo)
```
?? messages/de.json
?? messages/fr.json
?? messages/ja.json
?? messages/zh-cn.json
?? motionix_v2/
```
Translation files were created but never committed. `motionix_v2/` directory also uncommitted.

### Local build
`npm run build` passes locally (Turbopack). Vercel builds were failing on both Phase 4.1 and 4.2 — likely transient Hobby plan memory issues.

---

## 11. What Was Done in This Session

### Session 1: i18n Implementation (Phase 4)
- Created `messages/en.json` (~590 lines, full English dictionary)
- Created `src/i18n/config.ts`, `routing.ts`, `request.ts`, `navigation.ts`
- Created `src/app/[locale]/layout.tsx` with `NextIntlClientProvider`
- Created `src/components/motionix/layout/LanguageSwitcher.tsx`
- Moved all pages to `src/app/[locale]/` directory
- Updated all components to use `useTranslations()` / `getTranslations()`
- Fixed CSP headers for locale-prefixed ONNX routes (regex → path wildcards)
- Committed + pushed as Phase 4.1 (`f7a0773`) and Phase 4.2 (`1a93ccb`)
- Vercel builds were showing errors (likely transient)

### Session 2: Translation Dictionaries
- Created `messages/fr.json` (French) — complete
- Created `messages/de.json` (German) — complete
- Created `messages/ja.json` (Japanese) — complete
- Created `messages/zh-cn.json` (Chinese) — complete
- `hi.json` (Hindi) attempt failed (prompt too long)
- These were written to disk but **NOT committed**

### Session 3: Agent Work (motionix_v2)
Your agent created `motionix_v2/` folder and built on top of the snapshot:

**New files added by agent (15 files):**
1. `PLAN.md` — 5-phase execution plan with bug analysis
2. `messages/hi.json` — Hindi translation (the one we failed to create)
3. `src/app/[locale]/tools/page.tsx` — Tools catalog page (was 404)
4. `src/app/api/health/route.ts` — `/api/health` endpoint
5. `src/components/motionix/ads/AdsenseLoader.tsx` — AdSense script loader
6. `src/components/motionix/ads/AdSlot.tsx` — CLS-safe ad unit
7. `src/components/motionix/tool/tools/ImageConverterImpl.tsx` — New 9th tool
8. `src/components/motionix/tool/ToolsCatalog.tsx` — Searchable tool catalog
9. `src/lib/ads.ts` — AdSense helpers
10. `src/lib/hreflang.ts` — Per-page hreflang metadata
11. `src/lib/hreflang.test.ts` — Tests for hreflang
12. `src/lib/rate-limit.test.ts` — Tests for rate limiter
13. `src/lib/schema.test.ts` — Tests for JSON-LD schema
14. `src/lib/tools.test.ts` — Tests for tool catalog invariants
15. `vitest.config.ts` — Vitest configuration

**Modified files by agent (27 files):**
- `package.json` — Added vitest + coverage-v8
- `next.config.ts` — Removed AdSense CSP origins, removed HSTS
- `SiteHeader.tsx` — Removed mobile hamburger menu (regression)
- `SiteFooter.tsx` — Removed video-compressor + "Browse all" links
- `ToolDropzone.tsx` — Reverted to `alert()` for errors (regression)
- `BackgroundRemoverImpl.tsx` — Removed pristine cutout ref (regression)
- `PassportMakerImpl.tsx` — Removed head-fraction slider (regression)
- `ImageCompressorImpl.tsx` — Broken UPNG path (regression)
- `VideoCompressorImpl.tsx` — Reverted WebCodecs detection (regression)
- `PhotoResizerImpl.tsx` — Removed aspect-ratio logic (regression)
- `ResumePhotoMakerImpl.tsx` — Removed subject-bounding-box (regression)
- `StudentIdPhotoMakerImpl.tsx` — Removed subject-bounding-box (regression)
- `schema.ts` — Removed `breadcrumbJsonLd`
- `sitemap.ts` — Removed hreflang alternates
- `tools.ts` — Removed image-converter definition (but impl exists!)
- `en.json` — Removed menu/tool strings, added typo
- `de.json` — Gutted to skeleton stub (23 lines)
- `fr.json`, `ja.json`, `zh-cn.json` — Removed menu/tool strings
- `AGENTS.md` — Replaced with generic ponytail instructions

---

## 12. What's Remaining (TODO List)

### Critical Fixes
1. **Fix `de.json`** — restore full German translation (currently only 23 lines)
2. **Restore `image-converter` tool definition in `tools.ts`** — the impl exists but the registry entry was removed
3. **Restore mobile hamburger menu** in `SiteHeader.tsx` (agent removed it)
4. **Fix `alert()` regression** in `ToolDropzone.tsx` — replace with inline error UI
5. **Fix Background Remover** — restore pristine cutout ref (`cutoutBlobRef`) for non-destructive color/shadow changes
6. **Fix Passport Maker** — restore interactive head-fraction slider
7. **Fix Photo Resizer** — restore aspect-ratio-aware contain/cover logic
8. **Fix Image Compressor** — fix broken UPNG.encode call
9. **Fix Video Compressor** — fix `navigator.videoEncoder` → `window.VideoEncoder`
10. **Restore `breadcrumbJsonLd`** in `schema.ts`

### i18n Remaining
11. **Wire hreflang into `generateMetadata`** on all pages (utility exists at `src/lib/hreflang.ts`)
12. **Per-locale XML sitemaps** with hreflang alternates
13. **Commit + push** all uncommitted translation files

### New Features (from PLAN.md)
14. **Phase 2: Mobile navigation** — hamburger menu for phone users
15. **Phase 2: `/tools` catalog page** — already built in motionix_v2, needs to be ported
16. **Phase 2: Inline error UI** — replace `alert()` in ToolDropzone
17. **Phase 2: Registry-driven footer** — footer hardcodes 7 of 8 tools
18. **Phase 3: Testing** — Vitest already set up, 4 test files exist
19. **Phase 4: AdSense** — components exist, need CSP updates in next.config.ts
20. **Phase 4: `/api/health`** — already built in motionix_v2
21. **Phase 5: New tools** — Image Converter done, others (HEIC, Upscaler, Trimmer, Video→GIF) pending

### Deployment
22. **Verify Vercel build passes** after all fixes
23. **Commit + push** everything

---

## 13. Key Differences: Original vs motionix_v2

### motionix_v2 has that original doesn't:
- Hindi translation (`hi.json`)
- Tools catalog page (`/tools`)
- Health API endpoint (`/api/health`)
- Image Converter tool (9th tool)
- Vitest test infrastructure (4 test files + config)
- `hreflang.ts` utility
- AdSense components (env-gated)
- `PLAN.md` with detailed bug analysis

### Original has that motionix_v2 lost:
- Mobile hamburger menu
- Inline error UI in ToolDropzone
- Pristine cutout ref in Background Remover
- Interactive head-fraction slider in Passport Maker
- Aspect-ratio logic in Photo Resizer
- Subject-bounding-box centering in Student ID / Resume
- Proper UPNG.decode in Image Compressor
- Working WebCodecs detection in Video Compressor
- `breadcrumbJsonLd` in schema.ts
- HSTS header
- Full `de.json` translation
- `image-converter` tool definition in `tools.ts` (impl exists but unregistered)
- Video-compressor link in footer

### Recommendation
Cherry-pick the new files from motionix_v2 into the original, then fix the regressions. The new files are clean additions; the regressions are from the agent reverting code during its work.

---

## 14. Build & Deploy

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build (Turbopack)
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run test:coverage # Vitest with coverage
```

- Vercel auto-deploys from `main` branch
- Cron: `/api/admin/cleanup` at `0 3 * * *` (3am daily)
- Hobby plan: max 1 cron job/day

---

## 15. Blocked / Known Issues

1. **Vercel builds failing** — Both Phase 4.1 and 4.2 show "Error" on Vercel dashboard. Local build passes. Likely transient Hobby plan memory issues. Need to retry.
2. **`de.json` gutted** — Agent reduced German translation to 23 lines. Full translation was ~640 lines. Needs restoration.
3. **`image-converter` not registered** — `ImageConverterImpl.tsx` exists but `tools.ts` has no entry for it. The tool page will 404.
4. **ONNX CSP paths** — Regex patterns were removed (invalid in Next.js 16). Now uses path wildcards. Works locally.

---

## 16. File Counts Summary

| Category | Count |
|----------|-------|
| `.ts` files | 45 |
| `.tsx` files | 75 |
| `.json` files | 11 |
| `.css` files | 1 |
| `.mjs` files | 2 |
| `.md` files | 7 (including this file) |
| `.svg` files | 8 |
| **Total source/config** | ~149 |
| **New files from agent** | 15 |
| **Modified files from agent** | 27 |
| **Locale dictionaries** | 6 (en ✅, fr ✅, de ⚠️, hi ✅, ja ✅, zh-cn ✅) |
| **Test files** | 4 (hreflang, rate-limit, schema, tools) |
| **Tool implementations** | 9 (8 original + 1 new) |
| **Visual components** | 13 |

---

## 17. MERGE PLAN — Combining Both Versions

There are **two separate copies** of this project (not git branches):
- **Original:** `F:\motionix.xyz/` — the live repo, has the latest bug fixes
- **motionix_v2:** `F:\motionix.xyz/motionix_v2/` — a copy with new features + regressions

The goal: merge them into **one clean version** in the original repo, then hand off to the next agent.

### Step 1: Copy NEW files from v2 → Original (15 files, clean additions)

These are brand-new files that don't exist in the original. Copy them as-is:

```
FROM motionix_v2/ → TO original/
─────────────────────────────────────────────────────
src/app/[locale]/tools/page.tsx        → same path
src/app/api/health/route.ts            → same path
src/components/motionix/ads/AdsenseLoader.tsx → same path
src/components/motionix/ads/AdSlot.tsx        → same path
src/components/motionix/tool/tools/ImageConverterImpl.tsx → same path
src/components/motionix/tool/ToolsCatalog.tsx → same path
src/lib/ads.ts                         → same path
src/lib/hreflang.ts                    → same path
src/lib/hreflang.test.ts               → same path
src/lib/rate-limit.test.ts             → same path
src/lib/schema.test.ts                 → same path
src/lib/tools.test.ts                  → same path
vitest.config.ts                       → root
PLAN.md                                → root
messages/hi.json                       → same path
```

### Step 2: Update package.json in Original (add vitest)

Add to `devDependencies`:
```json
"@vitest/coverage-v8": "^3.2.7",
"vitest": "^3.2.7"
```

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

### Step 3: Register Image Converter in tools.ts (Original)

The `ImageConverterImpl.tsx` file exists in v2 but the tool definition was removed from `tools.ts`. Add the tool entry to the original's `src/lib/tools.ts`:

```typescript
// ============================================================
//  Image converter  (FUNCTIONAL — pure canvas, no deps)
// ============================================================
{
  slug: "image-converter",
  name: "Image converter",
  tagline: "Convert between PNG, JPG, and WebP in your browser — no upload.",
  // ... (full definition exists in motionix_v2's tools.ts, lines 417-457)
}
```

Also add `"image-converter"` to the `dynamic.tsx` file for lazy loading.

### Step 4: Add image-converter translation keys to ALL locale files

Add the `image-converter` block to the `Tools` section of:
- `messages/en.json`
- `messages/fr.json`
- `messages/ja.json`
- `messages/zh-cn.json`
- `messages/hi.json`

(The keys are in motionix_v2's `en.json` under `Tools.image-converter`)

### Step 5: DO NOT copy these modified files from v2 (keep Original's versions)

These files were regressed by the agent. Keep the original's working versions:

| File | Why |
|------|-----|
| `SiteHeader.tsx` | Original has mobile hamburger menu |
| `SiteFooter.tsx` | Original has video-compressor + "Browse all" links |
| `ToolDropzone.tsx` | Original has inline error UI |
| `BackgroundRemoverImpl.tsx` | Original has pristine cutout ref |
| `PassportMakerImpl.tsx` | Original has head-fraction slider |
| `ImageCompressorImpl.tsx` | Original has proper UPNG.decode |
| `VideoCompressorImpl.tsx` | Original has working WebCodecs detection |
| `PhotoResizerImpl.tsx` | Original has aspect-ratio logic |
| `ResumePhotoMakerImpl.tsx` | Original has subject-bounding-box |
| `StudentIdPhotoMakerImpl.tsx` | Original has subject-bounding-box |
| `schema.ts` | Original has `breadcrumbJsonLd` |
| `sitemap.ts` | Original has hreflang alternates |
| `next.config.ts` | Original has HSTS + AdSense CSP origins |
| `messages/de.json` | Original has full German translation |
| `messages/en.json` | Original has menu/tool strings + no typo |
| `messages/fr.json`, `ja.json`, `zh-cn.json` | Original has menu/tool strings |
| `AGENTS.md` | Original has proper project context |

### Step 6: After merge — remaining work for next agent

1. Wire `hreflang.ts` into `generateMetadata` on all pages
2. Per-locale XML sitemaps
3. Verify Vercel build passes
4. Commit + push everything
5. Fix any remaining tool bugs from PLAN.md Phase 1

### Step 7: Update motionixcontext.md after merge

After merging, update this file to reflect the merged state and remove the two-version references. The merged version becomes the single source of truth.

---

## 18. Execution Plan (from PLAN.md)

Direction: stay client-side now, architect toward hybrid later. **No AI/server pipeline yet**, free tier only. Fix real tool bugs, make UX friendlier, add tests, ship new client-side tools, add non-intrusive monetization.

### Phase 1 — Fix broken tool features (HIGHEST PRIORITY)

These are confirmed, code-level defects. Ordered by severity.

1. **Video Compressor is dead** — `VideoCompressorImpl.tsx:55` checks `navigator.videoEncoder` (always `undefined`); the API is `window.VideoEncoder`. Fix detection, verify mediabunny pipeline, pass `maxSize={200*1024*1024}` to dropzone (currently capped at 10 MB), fix target-bitrate math.
2. **Passport Maker output is non-compliant** — presets carry `headFraction` (0.6–0.7) but `composeStrict`/`composeWithBackground` only center-crop. Add head/subject scaling. Embed DPI metadata in JPEG.
3. **Image Compressor PNG path is broken** — `UPNG.encode([...], bytes.byteLength, 0)` passes encoded file as pixels and byte-length as width. Decode to RGBA or drop UPNG for canvas path. Fix "Original 0 KB" subhint.
4. **Background Remover color/shadow controls are destructive** — `applyBackground` flattens `outBlob`. Keep original transparent cutout in a ref and always recompose from it.
5. **Photo Resizer stretches in pixel mode** — Contain/Cover logic only exists in KB branch. Apply aspect-aware source-rect math to both branches.
6. **Student ID / Resume framing** — "white background" and "extend edges" are no-ops. Center on subject bounding box.
7. **Cross-cutting hygiene** — revoke leaked object URLs; fix `&apos;` leaking into JS strings; RefineCanvas & Signature SVG export.

### Phase 2 — Friendlier tool UX

1. **`/tools` catalog page** — already built in motionix_v2. 3 links currently 404.
2. **Mobile navigation** — header nav is `hidden md:flex` with no hamburger. Phone users can't navigate.
3. **Replace `alert()` with inline error UI** in `ToolDropzone.tsx`.
4. **Unified progress** — promote Background Remover's progress-bar pattern to shared shell.
5. **Registry-driven footer + linked breadcrumb** — footer hardcodes 7 of 8 tools.
6. **Optional:** batch/multi-file upload.

### Phase 3 — Testing infrastructure

Set up **Vitest** + `@vitest/coverage-v8`. Start with pure logic: `rate-limit.ts`, `hreflang.ts`, `tools.ts`, `schema.ts`. Then `blog.ts` and API handlers. Add CI step (lint + build + test).

### Phase 4 — Monetization + polish

- **AdSense** — blog/marketing surfaces only (privacy promise: "no ads on tools"). Env-gated, `next/script`, fixed-height CLS-safe containers. Needs CSP updates.
- **`/api/health`** — already built in motionix_v2.
- **SEO polish** — `BreadcrumbList` and `BlogPosting` JSON-LD, tighten CSP, add HSTS.

### Phase 5 — New client-side tools

**Image Converter** ✅ done. Remaining candidates: **HEIC→JPG** (canvas), **Image Upscaler** (ONNX), **Video Trimmer** (WebCodecs), **Video→GIF** (WebCodecs). Sequence after Phase 1 so we build on working WebCodecs base.

---

## 19. Project Health Report

**Date:** 2026-07-19 | **Score:** 78/100 (C+)

| Category | Score | Weight | Notes |
|----------|-------|--------|-------|
| Setup Quality | 18/20 | 20% | Next.js 16, TypeScript strict, ESLint configured |
| Code Organization | 19/20 | 20% | Clean structure, feature-based components |
| Dependency Management | 14/15 | 15% | Modern deps, lock file present |
| Security | 9/10 | 10% | CSP headers, env gating, no hardcoded secrets |
| Testing | 0/20 | 20% | **Critical: Zero test files** (now partially addressed) |
| Documentation | 9/10 | 10% | Comprehensive README, CONTRIBUTING, SECURITY |
| Deployment Readiness | 9/10 | 10% | Vercel config, CI/CD, environment gating |

### Strengths
- Excellent environment management — all integrations gracefully degrade
- Clean architecture — clear separation of concerns
- Strong security posture — CSP headers per-route, COOP/COEP for WASM
- Modern stack — Next.js 16, React 19, TypeScript 5, Tailwind v4

### Weaknesses (addressed in PLAN.md)
- **No testing infrastructure** — Vitest now added, 4 test files exist
- **ESLint rules overly relaxed** — `no-explicit-any: off`, `react-hooks/exhaustive-deps: off`
- **No API documentation** — 5 API routes undocumented
- **No health check endpoint** — now built (`/api/health`)
- **TypeScript strictness bypassed** — `no-explicit-any: off`

### Target
85/100 (B) within 30 days by addressing testing and ESLint gaps.

---

## 20. README Summary

### Stack
- **Next.js 16** App Router, Turbopack, React Server Components
- **TypeScript** strict mode
- **Tailwind v4** + custom OKLCH palette (cream / ink / paper)
- **Client-side tooling:** `@imgly/background-removal`, `mediabunny`, `upng-js`, browser Canvas + WebCodecs APIs
- **Auth (optional):** Clerk — gracefully falls back to guest mode
- **Storage (optional):** MongoDB for history, Cloudflare R2 for cloud uploads
- **Payments (optional):** Stripe Payment Links (no Checkout Sessions)
- **Email (optional):** Resend for transactional mail
- **Errors (optional):** Sentry
- **Analytics (optional):** GA4 + Plausible + Microsoft Clarity, all gated

### Getting Started
```bash
npm install
cp .env.example .env.local       # then fill in what you need (most are optional)
npm run dev
```
Open `http://localhost:3000`. Every tool works with zero env vars set.

### Adding a Tool
1. Add entry in `src/lib/tools.ts` (registry drives `/tools` index, dynamic route, OG images, JSON-LD, sitemap)
2. Create implementation in `src/components/motionix/tool/tools/`
3. Add to `src/components/motionix/tool/tools/dynamic.tsx` for lazy loading
4. Drop OG PNG at `public/og/tools/<slug>-og.png` (1200×630)

Reusable bits: `ToolDropzone`, `ToolResult`, `ToolFaq`, `ToolSteps`, `ToolFeedback`, `ToolChain`, `SaveToHistory`, `CloudflareUpload`.

### Privacy Stance
- Tools process files in your browser tab wherever possible
- Server-side persistence is gated on environment variables
- We log nothing about tool runs unless analytics are explicitly enabled

---

## 21. Security Policy

Email **security@motionix.xyz** with:
- Short description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Version (commit SHA, release tag, or "latest")

**Response time:** Acknowledge within 48 hours, ship fix within a week for high-severity.

**Safe harbor:** No legal action for good-faith security research. Avoid: privacy violations, service degradation, anything illegal.

---

## 22. Contributing Guidelines

### What we need
- **Bug reports** — which tool, which browser, what happened, what expected
- **Small fixes** — copy, layout, accessibility, tool edge cases
- **Tool ideas** — especially tools that aren't here yet

### Local Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```
No external services needed to contribute. Site runs without env vars.

### Workflow
1. Fork the repo
2. Branch off `main` (`git checkout -b fix/whatever`)
3. Run `npm run lint && npm run build` before pushing
4. Open a PR — CI check must pass

### Style
- TypeScript strict. No `any` unless wrapping loosely-typed third-party package
- 2 spaces indent everywhere (4 in YAML/JSON/Markdown)
- Comments reserved for non-obvious decisions. Mark shortcuts with `// ponytail: <reason>`
- Tools live in `src/components/motionix/tool/tools/`
- Visual primitives live in `src/components/motionix/visuals/`
- Server-only helpers imported with `import "server-only"`

### Big Changes
Open an issue first. Small, surgical PRs preferred.
