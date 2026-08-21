# Motionix.xyz — Code Quality & Architecture Audit Report

**Date:** 2026-08-15
**Auditor:** MiMo (Code Quality & Architecture Auditor)
**Stack:** Next.js 16.2.10 · React 19.2.4 · TypeScript 5 · Tailwind CSS 4 · Vercel

---

## Executive Summary

Motionix is a well-structured Next.js 16 app with a clear separation between marketing/content surfaces and client-side tool implementations. The codebase demonstrates solid engineering fundamentals — proper use of server components, lazy-loaded tool implementations, env-gated integrations, and defense-in-depth error handling. However, the ESLint configuration is **dangerously permissive**, disabling nearly every safety rule. The test infrastructure is **broken** (vitest not installed), and several dependencies appear unused. This report identifies 34 issues across 8 categories.

| Category | Score | Grade |
|---|---|---|
| **Architecture & Organization** | 8.2 / 10 | A- |
| **TypeScript Quality** | 6.5 / 10 | C+ |
| **ESLint Configuration** | 3.0 / 10 | F |
| **Error Handling** | 7.8 / 10 | B+ |
| **React Best Practices** | 7.0 / 10 | B |
| **Dependency Management** | 5.5 / 10 | D+ |
| **Testing Infrastructure** | 2.0 / 10 | F |
| **Build & Deploy** | 7.5 / 10 | B |
| **Overall** | **5.9 / 10** | **D+** |

> **Verdict:** Production-viable for a Phase 1 solo-founder launch, but the disabled linting, missing test runner, and ny-heavy patterns will compound into real bugs as the codebase grows. Fix the ESLint config and install vitest before accepting external contributors.

---

## 1. TypeScript Quality

### 1.1 tsconfig.json — Strict Mode ✅

`json
"strict": true
`

Strict mode is fully enabled. This is the single most important TypeScript setting and it's correctly set. Additional good settings:

- "noEmit": true — defers to Next.js for compilation
- "isolatedModules": true — required for SWC/bundler compatibility
- "resolveJsonModule": true — allows direct JSON imports
- "moduleResolution": "bundler" — correct for Next.js 16

**Missing recommended flags:**

| Flag | Purpose | Impact |
|---|---|---|
| "noUncheckedIndexedAccess" | Adds undefined to index signatures | Prevents runtime crashes on array/object access |
| "exactOptionalPropertyTypes" | Distinguishes undefined from missing | Tighter type contracts |
| "forceConsistentCasingInImports" | Prevents case-mismatch imports | Cross-platform consistency |

### 1.2 ny Type Usage — 🔴 Critical

Despite strict: true, the codebase uses ny liberally because the ESLint rule is disabled. Found in **38+ locations** across the codebase:

| File | Line(s) | Context |
|---|---|---|
| src/lib/seo-config.ts | 52, 66, 69 | safeTranslate(t: any, ...) and Record<string, any> return types |
| src/lib/page-indexability.ts | 75 | safeTranslate(t: any, ...) — duplicated helper |
| src/lib/tools.ts | 39, 197, 286, 302, 364, 441, 477, 533, 549, 594, 627, 669, 746 | Tool content fields use implicit ny in type widening |
| src/lib/history.ts | 10, 13 | ny in sessionStorage fallback types |
| src/lib/email.ts | 145 | s any in fetch response |
| src/lib/analytics.ts | 80 | Record<string, unknown> cast through ny |
| src/lib/ads.ts | 7 | ny in env var typing |
| src/lib/r2-client.ts | 14, 55 | ny in R2 client configuration |
| src/lib/stripe-links.ts | 21, 97, 153 | ny in payment link config |
| src/lib/r2-cleanup.ts | — | Key! non-null assertion on S3 objects |
| src/components/seo/SchemaProvider.tsx | 4 | Record<string, any> for schema prop |
| src/components/motionix/tool/ToolDropzone.tsx | 54 | s unknown as FileList cast |
| src/components/motionix/tool/HistoryHost.tsx | 17, 34 | ny in history data |
| src/components/motionix/tool/tools/ImageCompressorImpl.tsx | 74, 98 | ny in UPNG processing |
| src/components/motionix/tool/tools/VideoCompressorImpl.tsx | 133 | ny in Mediabunny codec options |
| src/instrumentation.ts | 5 | ny in Sentry env extension |

**Recommendation:** Create a shared safeTranslate utility in src/lib/i18n-utils.ts that properly types the next-intl translation function. Replace all Record<string, any> with Record<string, unknown> where possible.

### 1.3 Non-null Assertions (!) — 🟡 Warning

Found **6+ locations** with non-null assertions:

| File | Line | Expression |
|---|---|---|
| src/lib/r2-server.ts | — | process.env.R2_ACCESS_KEY_ID!, process.env.R2_SECRET_ACCESS_KEY! |
| src/lib/mongo-server.ts | — | process.env.MONGODB_URI! |
| src/lib/history.ts | — | canvas.getContext("2d")! |
| src/lib/r2-cleanup.ts | — | it.Key! on S3 list objects |

The env var assertions in 2-server.ts and mongo-server.ts are **safe** because they're guarded by isR2Enabled() / isMongoEnabled() checks that validate the env vars first. However, the canvas.getContext("2d")! in history.ts is **unsafe** — canvas context can return 
ull on some devices.

### 1.4 Type Definitions (src/types/)

Only one file exists: src/types/upng-js.d.ts. This is a hand-written ambient declaration for the upng-js library. The type definitions are minimal but functional. The src/lib/tools.ts file contains the primary domain types (Tool, ToolEngine, CountryPreset, etc.) — these are well-defined with JSDoc comments.

**Issue:** The upng-js.d.ts types are incomplete — they don't cover all UPNG APIs used in ImageCompressorImpl.tsx.

### 1.5 API Route Typing — 🟡 Warning

API routes use inline type assertions instead of shared schemas:

`	ypescript
// src/app/api/contact/route.ts
payload = (await req.json()) as typeof payload; // unsafe cast

// src/app/api/history/route.ts
body = (await req.json()) as Partial<HistoryEntry>; // unsafe cast
`

Only the contact/route.ts does manual field validation. Most API routes trust the s cast without runtime validation.

**Recommendation:** Use the installed zod library for request validation. It's already a dependency but unused in API routes.

---

## 2. ESLint Configuration — 🔴 Critical

### 2.1 Disabled Rules Audit

The eslint.config.mjs disables **22 rules**. This is extremely permissive and undermines the purpose of linting.

**Dangerous disables:**

| Rule | Status | Risk |
|---|---|---|
| @typescript-eslint/no-explicit-any: off | ❌ Should be warn | Allows untyped code throughout |
| eact-hooks/exhaustive-deps: off | ❌ Should be error | Causes stale closures, memory leaks |
| eact/jsx-key: off | ❌ Must be error | Causes React rendering bugs in lists |
| eact/jsx-no-undef: off | ❌ Must be error | Allows undefined component usage |
| @typescript-eslint/no-non-null-assertion: off | ⚠️ Should be warn | Allows unsafe ! assertions |
| @typescript-eslint/no-unused-expressions: off | ⚠️ Should be warn | Hides dead code |
| eact/no-array-index-key: off | ⚠️ Should be warn | Causes reconciliation bugs |
| prefer-const: off | ⚠️ Should be error | Basic code quality |

**Acceptable disables:**

| Rule | Status | Justification |
|---|---|---|
| @typescript-eslint/no-empty-object-type: off | ✅ OK | Used for component prop defaults |
| @typescript-eslint/no-namespace: off | ✅ OK | Used for type grouping |
| @next/next/no-img-element: off | ✅ OK | Tool preview images need raw <img> for blob URLs |
| eact/no-unescaped-entities: off | ✅ OK | Content-heavy pages with special chars |
| eact/self-closing-comp: off | ✅ OK | Style preference |
| eact/no-unknown-property: off | ✅ OK | JSX compatibility |

**Duplicate disable:**
- eact-hooks/exhaustive-deps: off appears **twice** (lines 28 and 35)

**Ignored file that doesn't exist:**
- src/components/motionix/visuals/ShaderSurface.tsx is in globalIgnores but the file doesn't exist

### 2.2 CI Lint Configuration

`yaml
# .github/workflows/ci.yml
- name: Lint
  run: npm run lint -- --max-warnings=999  # lint is best-effort: warnings don't block PRs
`

Lint warnings are explicitly allowed to pass CI. Combined with the disabled rules, this means **zero effective lint enforcement**.

**Recommendation:**
1. Re-enable critical rules: eact/jsx-key, eact/jsx-no-undef, eact-hooks/exhaustive-deps, prefer-const
2. Set @typescript-eslint/no-explicit-any to warn with a plan to tighten to error
3. Remove --max-warnings=999 from CI — set a real budget (e.g., 50) that decreases over time
4. Remove the duplicate exhaustive-deps disable
5. Remove the ShaderSurface.tsx from global ignores (file doesn't exist)

---

## 3. Architecture & Code Organization

### 3.1 Directory Structure ✅

`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (Clerk)
│   ├── admin/              # Admin dashboard (Supabase auth)
│   ├── api/                # API routes
│   └── [locale]/           # i18n locale routes
├── components/
│   ├── admin/              # Admin dashboard components
│   ├── motionix/           # Main app components
│   │   ├── ads/            # AdSense components
│   │   ├── analytics/      # Analytics providers
│   │   ├── auth/           # Clerk auth wrappers
│   │   ├── layout/         # Header, footer, navigation
│   │   ├── marketing/      # Landing page components
│   │   ├── tool/           # Tool implementations
│   │   └── visuals/        # Reusable visual components
│   └── seo/                # SEO/Schema components
├── i18n/                   # Internationalization config
├── lib/                    # Shared utilities
└── types/                  # Type declarations
`

**Strengths:**
- Clear domain-based organization under components/motionix/
- Tool implementations are properly lazy-loaded via dynamic.tsx
- Server-only code guarded by import "server-only" (r2-server, mongo-server, email, blog)
- i18n is cleanly separated with next-intl

### 3.2 Component Organization — 🟡 Good with Issues

**Strengths:**
- ToolBody.tsx uses a clean switch-case router for tool dispatch
- dynamic.tsx centralizes all lazy imports with loading states
- Visual components (src/components/motionix/visuals/) are well-factored

**Issues:**

| Issue | Severity | File |
|---|---|---|
| ImageConverterImpl.tsx exists but is **never imported** — dead code | 🟡 Low | src/components/motionix/tool/tools/ImageConverterImpl.tsx |
| Duplicate safeTranslate helper in both seo-config.ts and page-indexability.ts | 🟡 Medium | Both files |
| ToolBody.tsx imports 8 separate dynamic components from the same module on 8 separate lines | 🟡 Low | src/components/motionix/tool/ToolBody.tsx |
| cn.ts contains ormatCompact and TOOLS_SITE_URL — mixed concerns | 🟡 Low | src/lib/cn.ts |

### 3.3 Circular Dependencies — ✅ None Detected

Import graph analysis shows no circular dependencies. The dependency flow is:

`
app/ → components/ → lib/ → (no back-edges)
`

### 3.4 Code Duplication — 🟡 Warning

**Duplicated safeTranslate function:**
- src/lib/seo-config.ts:52 — unction safeTranslate(t: any, key: string): string
- src/lib/page-indexability.ts:75 — unction safeTranslate(t: any, key: string): string

Identical implementations, identical ny typing. Should be extracted to a shared utility.

**Duplicated ALLOWED_TYPES / MAX_BYTES constants:**
- src/app/api/uploads/route.ts defines ALLOWED_TYPES and MAX_BYTES
- src/app/api/uploads/probe/route.ts defines the same constants independently

The probe route even has a comment: "Allowed types must mirror the route at /api/uploads — if you change one, change both." — yet they're duplicated, not shared.

### 3.5 Dead Code

| File | Status |
|---|---|
| src/components/motionix/tool/tools/ImageConverterImpl.tsx | Never imported, no tool slug references it |
| src/components/motionix/visuals/ShaderSurface.tsx | Referenced in ESLint ignores but doesn't exist |
| src/lib/stripe-links.ts | All loadLink() calls return 
ull (no env vars set) — the entire module is effectively dead code in the current deployment |

---

## 4. Dependency Management

### 4.1 package.json Audit

**33 dependencies, 9 devDependencies**

#### Potentially Unused Dependencies

| Package | Status | Notes |
|---|---|---|
| class-variance-authority | ❌ **Unused** | Zero imports found in entire codebase |
| @imgly/background-removal | ✅ Used | Used in useBackgroundRemoval.ts |
| @next/mdx | ⚠️ Questionable | No direct imports found; may be used implicitly by 
ext-mdx-remote |
| onnxruntime-web | ✅ Used | Used via @imgly/background-removal dependency chain |
| echarts | ✅ Used | Admin dashboard charts only |
| esend | ⚠️ Unused import | email.ts uses raw etch to Resend API instead of the SDK |

#### Duplicate Functionality

| Concern | Packages | Recommendation |
|---|---|---|
| **Icon libraries** | lucide-react + eact-icons | Both are used — eact-icons/lu in tool components, lucide-react in admin. Could consolidate to one. |
| **Supabase clients** | @supabase/ssr + @supabase/supabase-js | Both needed — SSR for cookie-based auth, JS for admin service role |
| **MDX** | @next/mdx + 
ext-mdx-remote | 
ext-mdx-remote is the one actually used; @next/mdx may be removable |
| **Email** | esend (SDK) | Installed but email.ts uses raw etch — use the SDK or remove the dep |

#### Missing devDependencies

| Package | Purpose |
|---|---|
| itest | Test runner — test files exist but vitest is not installed |
| @testing-library/react | Component testing |
| @testing-library/jest-dom | DOM matchers |

### 4.2 Version Currency

| Package | Installed | Latest (Aug 2026) | Status |
|---|---|---|---|
| 
ext | 16.2.10 | 16.x | ✅ Current major |
| eact | 19.2.4 | 19.x | ✅ Current |
| 	ypescript | ^5 | 5.x | ✅ Current |
| @sentry/nextjs | ^10.65.0 | 10.x | ✅ Current |
| zod | ^4.4.3 | 4.x | ✅ Current |
| mongodb | ^7.5.0 | 7.x | ✅ Current |

Versions are generally current. No outdated major versions detected.

### 4.3 devDependencies vs Dependencies

| Package | Currently | Should Be | Reason |
|---|---|---|---|
| echarts | dependencies | dependencies | ✅ Correct (used in admin UI) |
| @dietrichgebert/ponytail | devDependencies | devDependencies | ✅ Correct |
| gray-matter | dependencies | dependencies | ✅ Correct (server blog loader) |

Placement is correct for all packages.

---

## 5. Error Handling

### 5.1 API Routes — ✅ Generally Good

All API routes follow a consistent pattern:

`	ypescript
export async function POST(req: Request) {
  // 1. Rate limit check
  // 2. Parse + validate body
  // 3. Business logic
  // 4. Return structured response
}
`

**Strengths:**
- Rate limiting on all endpoints (different limits per route)
- Honeypot spam protection on contact form
- Consistent error response shape: { ok: false, hint: "..." } or { error: "..." }
- R2 routes check isR2Enabled() before any S3 operations
- orce-dynamic on all API routes that need it

**Issues:**

| Issue | Severity | File |
|---|---|---|
| nalytics/events/route.ts has no rate limiting | 🟡 Medium | src/app/api/analytics/events/route.ts |
| nalytics/sync/route.ts has no rate limiting or auth | 🔴 High | src/app/api/analytics/sync/route.ts |
| dmin/flags/route.ts has **no auth check** — anyone can toggle feature flags | 🔴 High | src/app/api/admin/flags/route.ts |
| dmin/media/route.ts has **no auth check** — anyone can upload files | 🔴 High | src/app/api/admin/media/route.ts |
| history/route.ts imports from AuthShell.tsx (a 'use client' module) in a server route | 🟡 Medium | src/app/api/history/route.ts:4 |

### 5.2 try/catch Patterns — ✅ Good

- mongo-server.ts has a 4-second serverSelectionTimeoutMS to prevent hanging
- email.ts catches fetch errors and returns structured results
- 2-server.ts wraps S3 operations in try/catch
- log.ts handles missing directories gracefully
- history.ts falls back to sessionStorage when API fails

### 5.3 Unhandled Promises — ✅ None Detected

All async operations are either awaited or have .catch() handlers. The preloadBackgroundRemoval() function uses fire-and-forget with an explicit .catch(() => {}).

### 5.4 Sentry Integration — ✅ Well-Architected

The Sentry integration is env-gated and cleanly structured:

- sentry-config.ts — shared init options
- sentry.server.config.ts — server init
- sentry.edge.config.ts — edge init
- instrumentation.ts — Next.js 16 instrumentation hook
- instrumentation-client.ts — browser init

**Issue:** sentry.edge.config.ts uses getBrowserDSN() instead of getServerDSN():

`	ypescript
// sentry.edge.config.ts
const dsn = getBrowserDSN(); // ❌ Should be getServerDSN()
`

The edge runtime should use the server DSN (SENTRY_DSN), not the browser DSN (NEXT_PUBLIC_SENTRY_DSN).

---

## 6. React Best Practices

### 6.1 'use client' vs Server Components — 🟡 Good

- **68 client components** out of 129 .tsx files (53%)
- All tool implementations are correctly client-only (need browser APIs)
- Layout, SEO, and data-fetching components are server components
- dynamic.tsx correctly uses ssr: false for ONNX/canvas tools

**Issue:** Some components that could be server components are marked 'use client':
- src/components/seo/SchemaProvider.tsx — just renders a <script> tag, could be a server component

### 6.2 Array Key Props — 🟡 Warning

Array index keys (key={i}) found in **12 locations**:

| File | Context |
|---|---|
| src/app/[locale]/tools/[slug]/page.tsx | ld.map((obj, i) => <script key={i} ...>) |
| src/components/motionix/tool/ToolFaq.tsx | FAQ items |
| src/components/motionix/tool/ToolExamples.tsx | Example items |
| src/components/motionix/tool/ToolLimitations.tsx | Limitation items |
| src/components/motionix/marketing/FaqAccordion.tsx | FAQ accordion |
| src/components/motionix/marketing/Hero.tsx | Hero features |
| src/components/motionix/visuals/MagicBento.tsx | Bento grid items |

For static lists that never reorder, array index keys are acceptable. But for the JSON-LD scripts in the tool page, using the schema @type as a key would be more stable.

### 6.3 Custom Hooks — ✅ Good

- useBackgroundRemoval.ts — proper singleton memoization, SSR-safe
- useAuthEnabled() in AuthShell.tsx — graceful fallback when Clerk is unconfigured
- useHistory() in HistoryHost.tsx — session + server merge pattern

### 6.4 <img> vs <Image> — 🟡 Warning

9 instances of raw <img> usage found. The ESLint rule @next/next/no-img-element is disabled. Most are justified (blob URLs for tool previews can't use Next.js <Image>), but the SiteHeader logo could use <Image>.

---

## 7. Testing Infrastructure — 🔴 Critical

### 7.1 Test Files

4 test files exist:

| File | Tests | Status |
|---|---|---|
| src/lib/tools.test.ts | 10 tests | ✅ Well-written |
| src/lib/rate-limit.test.ts | 9 tests | ✅ Well-written, uses fake timers |
| src/lib/schema.test.ts | 6 tests | ✅ Well-written |
| src/lib/hreflang.test.ts | 6 tests | ✅ Well-written |

**Total: 31 tests across 4 files**

### 7.2 Test Runner — ❌ Not Installed

- Test files import from itest but **vitest is not in package.json** (neither dependencies nor devDependencies)
- No itest.config.ts exists
- No 	est script in package.json
- Tests **cannot be run**

`json
// package.json — missing:
"scripts": {
  "test": "vitest run"  // ← does not exist
}
`

### 7.3 Test Coverage

- **0% of API routes** have tests
- **0% of components** have tests
- **0% of hooks** have tests
- Only lib/ utilities have tests (4 out of 16 lib files = **25% coverage of lib/**)

**Recommendation:**
1. Install vitest: 
pm install -D vitest @vitest/coverage-v8
2. Create itest.config.ts
3. Add "test": "vitest run" script
4. Add tests for API routes (especially auth and rate limiting)
5. Add integration tests for tool implementations

---

## 8. Build & Deploy

### 8.1 next.config.ts — ✅ Good

**Strengths:**
- eactStrictMode: true enabled
- serverExternalPackages correctly lists MongoDB and AWS SDK
- Image optimization with AVIF + WebP formats
- Comprehensive CSP headers with per-route overrides for ONNX tools
- Conditional Sentry wrapping (no build cost when Sentry is disabled)
- optimizePackageImports for lucide-react and react-icons

**Issues:**

| Issue | Severity | File |
|---|---|---|
| experimental.optimizePackageImports typed as s never to suppress type error | 🟡 Low | 
ext.config.ts:22 |
| Tool page has both generateStaticParams() and dynamic = "force-dynamic" — contradictory | 🟡 Medium | src/app/[locale]/tools/[slug]/page.tsx |
| CSP allows 'unsafe-inline' and 'unsafe-eval' globally | 🟡 Medium | 
ext.config.ts |

### 8.2 vercel.json — ✅ Clean

- Single region deployment (iad1)
- Daily cron for R2 cleanup at 03:00 UTC
- Security headers applied globally
- No unnecessary overrides

### 8.3 CI/CD Pipeline — 🟡 Adequate

`yaml
# .github/workflows/ci.yml
steps:
  - Typecheck: npx tsc --noEmit        # ✅
  - Lint: npm run lint -- --max-warnings=999  # ❌ Effectively disabled
  - Build: npm run build               # ✅
`

**Missing:**
- No test step (because vitest isn't installed)
- No E2E tests
- No dependency audit (
pm audit)
- No bundle size checks

---

## 9. Security Findings

### 9.1 Critical

| Finding | File | Description |
|---|---|---|
| **Admin API routes unprotected** | src/app/api/admin/flags/route.ts | No auth check — anyone can toggle feature flags |
| **Admin API routes unprotected** | src/app/api/admin/media/route.ts | No auth check — anyone can upload files to Supabase storage |

### 9.2 Medium

| Finding | File | Description |
|---|---|---|
| Sentry edge uses browser DSN | src/sentry.edge.config.ts | Should use getServerDSN() |
| History route imports client module | src/app/api/history/route.ts | Imports from 'use client' AuthShell |
| No CSRF protection on POST routes | src/app/api/*/route.ts | Relying on CORS + rate limiting only |
| nalytics/sync has no auth | src/app/api/analytics/sync/route.ts | Anyone can trigger sync operations |

### 9.3 Low

| Finding | File | Description |
|---|---|---|
| CSP allows unsafe-eval | 
ext.config.ts | Required for ONNX but applies globally |
| prefer-const disabled | eslint.config.mjs | Allows mutable bindings |

---

## 10. Prioritized Recommendations

### P0 — Fix Immediately (Security / Correctness)

| # | Action | Effort |
|---|---|---|
| 1 | **Add auth checks to dmin/flags and dmin/media API routes** — verify Supabase session + admin_users role | 1h |
| 2 | **Add auth check to nalytics/sync route** | 30m |
| 3 | **Install vitest** and add 	est script — 
pm i -D vitest @vitest/coverage-v8 | 30m |
| 4 | **Fix sentry.edge.config.ts** — change getBrowserDSN() to getServerDSN() | 5m |

### P1 — Fix Soon (Code Quality)

| # | Action | Effort |
|---|---|---|
| 5 | **Re-enable critical ESLint rules** — eact/jsx-key, eact/jsx-no-undef, eact-hooks/exhaustive-deps, prefer-const | 2h |
| 6 | **Set @typescript-eslint/no-explicit-any to warn** and fix the top 10 offenders | 3h |
| 7 | **Extract shared safeTranslate** to src/lib/i18n-utils.ts | 30m |
| 8 | **Extract shared ALLOWED_TYPES/MAX_BYTES** to src/lib/upload-config.ts | 30m |
| 9 | **Remove --max-warnings=999** from CI lint step | 5m |
| 10 | **Use zod for API request validation** (already installed, unused) | 2h |
| 11 | **Remove unused dep** class-variance-authority | 5m |
| 12 | **Remove @next/mdx** if not used (verify first) | 10m |

### P2 — Fix When Convenient (Hygiene)

| # | Action | Effort |
|---|---|---|
| 13 | **Delete dead code** ImageConverterImpl.tsx | 5m |
| 14 | **Remove ShaderSurface.tsx from ESLint ignores** (file doesn't exist) | 2m |
| 15 | **Remove duplicate exhaustive-deps: off** in ESLint config | 2m |
| 16 | **Add 
oUncheckedIndexedAccess** to tsconfig | 1h |
| 17 | **Fix canvas.getContext("2d")!** in history.ts — add null guard | 10m |
| 18 | **Consolidate icon libraries** — pick one of lucide-react or eact-icons | 2h |
| 19 | **Use esend SDK** instead of raw fetch in email.ts, or remove the dep | 1h |
| 20 | **Add rate limiting to nalytics/events** | 15m |
| 21 | **Fix TOOLS_SITE_URL** placement — move from cn.ts to src/lib/constants.ts | 15m |
| 22 | **Add itest.config.ts** with path aliases matching tsconfig | 15m |
| 23 | **Resolve generateStaticParams + orce-dynamic contradiction** in tool pages | 30m |
| 24 | **Replace s never cast** in 
ext.config.ts experimental config | 10m |

---

## 11. Architecture Score Breakdown

| Metric | Value | Notes |
|---|---|---|
| Total source files | 177 | 129 .tsx + 48 .ts |
| Client components | 68 | 53% of .tsx files |
| Server components | 61 | 47% of .tsx files |
| API routes | 10 | All properly structured |
| Test files | 4 | 31 tests total (cannot run) |
| ny usages | 38+ | Mostly i18n + type widening |
| Non-null assertions | 6+ | Mostly env-guarded |
| Dead files | 1 | ImageConverterImpl.tsx |
| Duplicate code | 2 sites | safeTranslate, upload config |
| Missing auth | 3 routes | admin/flags, admin/media, analytics/sync |

---

## 12. What's Done Well

Credit where it's due — the project has strong fundamentals:

1. **Env-gated integrations** — Every external service (Clerk, Sentry, Resend, MongoDB, R2) gracefully degrades when unconfigured
2. **Client-side tool architecture** — ONNX models and canvas processing run entirely in-browser with proper lazy loading
3. **Rate limiting** — In-memory sliding window with per-route limits, constant-time secret comparison
4. **Security headers** — Comprehensive CSP with per-route overrides for WASM tools
5. **Server-only guards** — import "server-only" prevents accidental client bundling of server code
6. **Blog content system** — Clean MDX pipeline with gray-matter frontmatter
7. **i18n** — 6 locales with proper hreflang, indexability checks, and translation completeness gating
8. **R2 lifecycle management** — Daily cleanup cron with dry-run support and detailed reporting
9. **Graceful auth degradation** — Works in guest mode when Clerk is unconfigured
10. **Accessibility** — Skip-to-content link, proper ARIA labels on interactive elements

---

*End of audit. Generated by MiMo on 2026-08-15.*
