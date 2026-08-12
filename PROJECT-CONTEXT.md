# Motionix.xyz — Complete Project Context & Plan

## Project Overview

**Motionix.xyz** is a privacy-first, browser-based image and video tool suite with 8 tools:
1. Background Remover (ONNX AI)
2. Passport Photo Maker (Canvas compliance)
3. Student ID Photo Maker
4. Resume Photo Maker
5. Signature Maker
6. Photo Resizer
7. Image Compressor
8. Video Compressor (WebCodecs)

**Stack:** Next.js 16, TypeScript, Tailwind v4, Supabase (Postgres), next-intl (6 locales), Vercel deployment

---

## Issues Faced & Resolved

### 1. Sitemap Issues
- **Problem:** Google Search Console showing "Sitemap could not be read"
- **Root Cause:** Old sitemap had `alternates` with `xhtml:link` hreflang maps that Google couldn't parse
- **Fix:** Simplified sitemap to 20 clean English URLs, removed alternates, added `lastmod`

### 2. Build Failures
- **Problem:** Vercel build failing with various errors
- **Root Causes:**
  - `motionix_v2/` sub-project with vitest imports (removed)
  - `vitest.config.ts` not in dependencies (removed)
  - `src/proxy.ts` conflicting with `middleware.ts` (removed proxy.ts)
  - TypeScript type errors in `sitemap-data.ts` (fixed `MetadataRoute.Sitemap` type)
  - JSX nesting errors in 5 static pages (fixed closing tags)
- **Fix:** All addressed through multiple commits

### 3. Missing SEO Namespace
- **Problem:** Non-English pages showing raw translation keys like `SEO.home.title` in browser tabs
- **Root Cause:** Only `en.json` had the `SEO` namespace; de, fr, hi, ja, zh-cn were missing it
- **Fix:** Added complete SEO namespace to all 5 non-English locale files with proper translations

### 4. hreflang & HTML lang Mismatch
- **Problem:** Ahrefs audit showing pages with different language codes in HTML lang vs hreflang
- **Root Cause:** Root layout had hardcoded `lang="en"`
- **Fix:** Used `getLocale()` from next-intl to dynamically set `<html lang={locale}>`

### 5. Broken Links
- **Problem:** Ahrefs showing `/sign-in` and `/cdn-cgi/l/email-protection` as broken
- **Root Cause:** `/sign-in` from Clerk (disabled), `/cdn-cgi/l/email-protection` from Cloudflare email obfuscation
- **Fix:** Removed `/sign-in` link from HistoryDrawer

### 6. Admin Panel Issues
- **Problem:** `/admin/login` returning 404, then redirect loop
- **Root Cause:** next-intl middleware intercepting `/admin` paths; admin layout auth check creating redirect loop for login page
- **Fix:**
  - Added `admin` to middleware matcher exclusion
  - Restructured admin routes using Next.js route groups: `(auth)/login` (no auth) and `(dashboard)/*` (auth required)

### 7. Supabase Connection
- **Problem:** "Failed to fetch" error when accessing admin panel
- **Root Cause:** Supabase API keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) not set in Vercel environment variables
- **Status:** User needs to add these 3 env vars to Vercel

---

## Current State

### What's Working
- ✅ Site live at motionix.xyz
- ✅ All 8 tool pages functional
- ✅ Blog with 4 posts
- ✅ i18n with 6 locales (en, fr, de, hi, ja, zh-cn)
- ✅ Sitemap.xml generating correctly (20 URLs)
- ✅ robots.txt configured
- ✅ Ahrefs analytics integrated
- ✅ Google Analytics integrated
- ✅ Google site verification file added
- ✅ Admin panel layout built (route groups, sidebar, header)

### What's Not Working
- ❌ Admin panel can't connect to Supabase (env vars missing in Vercel)
- ❌ Supabase database tables not created (SQL schema ready but not executed)

### What's Pending
- ⏳ Admin panel functionality (needs Supabase connection)
- ⏳ Phase C: 10 blog clusters (40 blog posts)
- ⏳ Phase D: Full admin panel modules

---

## Remaining Plan

### Phase D: Complete Admin Panel (Current)

**Step 1: Fix Supabase Connection**
- Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- Redeploy

**Step 2: Create Database Tables**
- Run `supabase/schema.sql` in Supabase SQL Editor (22 tables)
- Create admin user in Supabase Auth → SQL: `INSERT INTO admin_users...`

**Step 3: Verify Admin Panel**
- Login at `/admin/login`
- Test Dashboard, Tools Manager, Blog Manager, Translation Manager, SEO Manager, Analytics

**Step 4: Remaining Admin Modules**
- Users & Roles management
- Media Library
- Feature Flags
- Site Settings
- Activity Logs
- Redirect Manager
- Sitemap Manager
- Robots.txt Manager

### Phase C: 10 Blog Clusters (After Phase D)

| # | Cluster | Pillar Article | Supporting |
|---|---------|---------------|------------|
| 1 | Background Removal | Complete Guide | 4 articles |
| 2 | Passport Photos | Requirements by Country | 4 articles |
| 3 | Image Compression | Compress Without Losing Quality | 4 articles |
| 4 | Photo Resizing | Resize for Any Platform | 3 articles |
| 5 | Digital Signatures | Create Digital Signature | 3 articles |
| 6 | Video Compression | Compress for Email | 3 articles |
| 7 | Privacy & Security | Browser vs Cloud Tools | 3 articles |
| 8 | Image Formats | JPG vs PNG vs WebP vs AVIF | 2 articles |
| 9 | Student & Academic | Student ID Photo Guide | 2 articles |
| 10 | Resume & Career | Professional Headshot Guide | 2 articles |

**Total: 10 pillar + 30 supporting = 40 blog posts**

### Phase E: Future Enhancements
- Google Search Console API integration
- GA4 analytics dashboard
- Keyword rank tracking
- SEO audit scanner
- AI SEO assistant
- Feature flags
- Monetization preparation

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Dynamic sitemap generation |
| `src/lib/sitemap-data.ts` | Sitemap entries logic |
| `src/lib/page-indexability.ts` | Indexability checks |
| `src/lib/seo-config.ts` | SEO metadata generation |
| `src/lib/hreflang.ts` | Hreflang/canonical |
| `src/lib/schema.ts` | JSON-LD schema |
| `src/lib/tools.ts` | Tool registry (8 tools) |
| `src/lib/supabase.ts` | Supabase client |
| `supabase/schema.sql` | Database schema (22 tables) |
| `messages/*.json` | Translations (6 locales) |
| `src/app/admin/*` | Admin panel pages |

---

## Environment Variables Needed in Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://qgroslpmtvjjninvmqkv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncm9zbHBtdHZqam5pbnZtcWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzE3NDAsImV4cCI6MjEwMjA0Nzc0MH0.0MGebP6AVqYCDNZqY9JOFPbWb4IcJGJv0grm2j1ZZLw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncm9zbHBtdHZqam5pbnZtcWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ3MTc0MCwiZXhwIjoyMTAyMDQ3NzQwfQ.qz9hBczn7abtXs23iGp-VqU2h0Fa8WFHQtJhoD0I_TM
```
