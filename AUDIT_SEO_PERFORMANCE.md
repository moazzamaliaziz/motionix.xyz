# Motionix.xyz — SEO & Performance Audit Report

**Auditor:** MiMo (Automated)
**Date:** 2026-08-15
**Stack:** Next.js 16.2.10 · React 19.2.4 · next-intl 4.x · Tailwind CSS 4
**Live URL:** https://motionix.xyz

---

## Executive Summary

| Category | Score | Status |
|---|---|---|
| Technical SEO | 7.5 / 10 | 🟡 Mostly solid, a few misconfigurations |
| Structured Data / Schema.org | 7 / 10 | 🟡 Good on tools, gaps on blog/about/contact |
| Metadata & Open Graph | 5.5 / 10 | 🔴 Title duplication, missing OG images on most pages |
| Performance | 7 / 10 | 🟡 Font loading is good, but force-dynamic hurts caching |
| Content & i18n SEO | 8.5 / 10 | 🟢 All 6 locales fully translated, hreflang mostly correct |
| Blog SEO | 6.5 / 10 | 🟡 Good content, missing images, no pagination |
| Core Web Vitals Indicators | 7.5 / 10 | 🟢 Server components, font swap, reduced-motion support |
| Security Headers | 8 / 10 | 🟢 CSP, HSTS, referrer-policy all present |

**Overall: 7.2 / 10** — A well-architected site with several fixable SEO gaps that are likely suppressing search performance.

---

## 1. Technical SEO

### 1.1 robots.txt — ✅ Mostly Correct

**File:** src/app/robots.ts

`	ypescript
rules: [{ userAgent: "*", allow: ["/"], disallow: ["/api/", "/admin/", "/_next/"] }],
sitemap: ${TOOLS_SITE_URL}/sitemap.xml,
`

**Live response** includes Cloudflare-managed content signals (AI training blocks) + the app-generated rules. Both merge correctly.

| Check | Status |
|---|---|
| Allow / | ✅ |
| Disallow /api/, /admin/, /_next/ | ✅ |
| Sitemap reference | ✅ Points to https://motionix.xyz/sitemap.xml |
| AI bot blocking (GPTBot, ClaudeBot, etc.) | ✅ Cloudflare-managed |

**⚠️ Issue R1:** The robots.ts rules are duplicated by Cloudflare's managed robots.txt. The Cloudflare version already blocks AI crawlers. If Cloudflare is removed, the custom rules still work — this is fine but worth noting.

### 1.2 sitemap.xml — ✅ Correct & Complete

**File:** src/app/sitemap.ts → src/lib/sitemap-data.ts

**Live sitemap:** 336 URLs total — 56 per locale × 6 locales.

| Content Type | Per Locale | Total | Status |
|---|---|---|---|
| Static pages (home, tools, about, contact, privacy, terms, cookies, blog) | 8 | 48 | ✅ |
| Tool pages | 8 | 48 | ✅ |
| Blog posts | 40 | 240 | ✅ |
| **Total** | **56** | **336** | ✅ |

All 6 locales (en, fr, de, hi, ja, zh-cn) have equal coverage. Blog posts include <lastmod> dates.

**⚠️ Issue R2:** The HTML sitemap page (/sitemap) is NOT in sitemap.xml but IS indexable (no noindex). This is a minor inconsistency — the HTML sitemap page should either be in the sitemap or have noindex.

**⚠️ Issue R3:** The HTML sitemap page (src/app/[locale]/sitemap/page.tsx) has:
- No generateMetadata function
- No canonical URL
- Title defaults to root layout: Motionix — Free AI Tools for Images & Video
- robots: index, follow (should be 
oindex since it's a utility page)

### 1.3 hreflang — ✅ Mostly Correct, One Bug

**File:** src/lib/hreflang.ts

All 6 locales + x-default are served via HTTP Link headers (not <link> tags in HTML). Verified live:

`
hreflang="en"  → https://motionix.xyz/en/tools/background-remover
hreflang="fr"  → https://motionix.xyz/fr/tools/background-remover
hreflang="de"  → https://motionix.xyz/de/tools/background-remover
hreflang="hi"  → https://motionix.xyz/hi/tools/background-remover
hreflang="ja"  → https://motionix.xyz/ja/tools/background-remover
hreflang="zh-CN" → https://motionix.xyz/zh-cn/tools/background-remover
hreflang="x-default" → https://motionix.xyz/tools/background-remover  ← BUG
`

**🔴 Issue R4 — x-default missing locale prefix:**

The x-default hreflang points to https://motionix.xyz/tools/background-remover (no /en/ prefix). Since the site uses localePrefix: "always" in src/i18n/routing.ts, this URL triggers a **308 redirect** to the /en/ version.

**Root cause:** In hreflang.ts, the lternatesFor() function calls localizedUrl(defaultLocale, path) which returns the correct URL (/en/tools/...), but Next.js 16's alternates metadata processing appears to strip the default locale prefix for x-default values. The value in the languages object is correct, but Next.js transforms it before emitting the header.

**Fix:** The x-default key needs special handling — either:
1. Use a hardcoded ${TOOLS_SITE_URL}/en value, or
2. Set x-default in the lternates object at the Next.js metadata level instead of in languages

### 1.4 Page Indexability — ✅ Well-Designed

**File:** src/lib/page-indexability.ts

| Pattern | Indexable? | Notes |
|---|---|---|
| /api/* | ❌ | Correct |
| /admin/* | ❌ | Correct |
| /test* | ❌ | Correct |
| Stub tools without content | ❌ | Smart — only blocks stubs without stubHint |
| Non-default locales with incomplete translations | ❌ | Prevents thin content |

**✅ Good:** The isTranslationComplete() function checks SEO title and description lengths (>10 chars, >20 chars) before allowing non-English pages to be indexed. This prevents indexation of untranslated pages.

### 1.5 Canonical URLs — ✅ Correct

**File:** src/lib/seo-config.ts

Verified live: canonical URLs are correctly set with locale prefix:
- Homepage: https://motionix.xyz/en/
- Tool page: https://motionix.xyz/en/tools/background-remover
- Contact page: https://motionix.xyz/en/contact

All canonicals include the locale prefix, consistent with localePrefix: "always".

---

## 2. Structured Data / Schema.org

### 2.1 JSON-LD on Homepage — ✅ Excellent

**File:** src/app/[locale]/page.tsx

| Schema | Present | Key Fields |
|---|---|---|
| Organization | ✅ | name, url, logo, sameAs (Twitter), contactPoint |
| WebSite | ✅ | name, url, description, publisher, SearchAction |

**✅ Good:** SearchAction is configured for sitelinks search box. Organization has sameAs for Twitter.

### 2.2 JSON-LD on Tool Pages — ✅ Excellent

**File:** src/lib/schema.ts → src/app/[locale]/tools/[slug]/page.tsx

| Schema | Present | Key Fields |
|---|---|---|
| SoftwareApplication | ✅ | name, description, applicationCategory, offers (free), url, image |
| FAQPage | ✅ | mainEntity with Question/Answer pairs |
| BreadcrumbList | ✅ | 3-level: Home → Tools → Tool Name |

**✅ Good:** SoftwareApplication includes pplicationSubCategory based on engine type. All 8 tools have FAQ schemas.

### 2.3 JSON-LD on Blog Posts — ✅ Good

**File:** src/app/[locale]/blog/[slug]/page.tsx

| Schema | Present | Key Fields |
|---|---|---|
| Article | ✅ | headline, description, datePublished, author, keywords, publisher |

**⚠️ Issue S1:** Article schema is missing image field. Blog posts have no OG images defined, so there's no image to include.

**⚠️ Issue S2:** Article schema uses datePublished for both datePublished and dateModified. Should track actual modification dates.

### 2.4 Missing Schemas — ⚠️ Gaps

| Page | Missing Schema | Priority |
|---|---|---|
| About page | Organization (already on homepage, but About page has no JSON-LD) | Medium |
| Contact page | ContactPage schema | Medium |
| Blog listing | CollectionPage or Blog schema | Low |
| Privacy/Terms | WebPage schema | Low |

**⚠️ Issue S3:** The SchemaProvider component (src/components/seo/SchemaProvider.tsx) is marked "use client" but only renders a <script> tag. It should be a server component to avoid unnecessary client-side JavaScript.

---

## 3. Metadata & Open Graph

### 3.1 Root Layout Metadata — 🟡 Has Issues

**File:** src/app/layout.tsx

`	ypescript
title: {
  default: "Motionix — Free AI Tools for Images & Video",
  template: "%s | Motionix",
},
`

**🔴 Issue M1 — Homepage title duplication:**

The homepage SEO title in messages/en.json is "Free Image & Video Tools — Motionix". The template appends | Motionix, resulting in:

> **Free Image & Video Tools — Motionix | Motionix**

This is a live, confirmed issue. The word "Motionix" appears twice.

**Fix:** The homepage SEO title in all 6 locale files should be changed to "Free Image & Video Tools" (without "— Motionix"), since the template already appends it.

**Affected files:**
- messages/en.json → SEO.home.title
- messages/fr.json → SEO.home.title
- messages/de.json → SEO.home.title
- messages/hi.json → SEO.home.title
- messages/ja.json → SEO.home.title
- messages/zh-cn.json → SEO.home.title

### 3.2 Tool Page Metadata — ✅ Good

**File:** src/app/[locale]/tools/[slug]/page.tsx

| Check | Status |
|---|---|
| Title from translations | ✅ Falls back to tools.ts metaTitle |
| Description from translations | ✅ Falls back to tools.ts metaDescription |
| Open Graph (title, description, url, images) | ✅ |
| Twitter card (summary_large_image) | ✅ |
| Canonical via alternates | ✅ |
| robots (index/follow based on indexability) | ✅ |
| OG images (1200×630) | ✅ All 8 tools have dedicated OG images |

**Verified live:** Free Background Remover — Remove Image Backgrounds Online | Motionix — no duplication.

### 3.3 Blog Post Metadata — 🟡 Missing OG Image

**File:** src/app/[locale]/blog/[slug]/page.tsx

| Check | Status |
|---|---|
| Title from frontmatter | ✅ |
| Description from frontmatter | ✅ |
| og:type = "article" | ✅ |
| publishedTime | ✅ |
| Twitter card | ✅ |
| **OG image** | **🔴 MISSING** |

**🔴 Issue M2:** Blog posts have NO og:image configured. When shared on social media, no image preview will appear.

**Fix:** Either:
1. Add an ogImage field to blog frontmatter and generate per-post OG images
2. Use a default blog OG image (/og/og-default.png) as fallback

### 3.4 Missing OG Images on Non-Tool Pages — 🔴

**🔴 Issue M3:** The following pages have NO og:image:

| Page | og:image |
|---|---|
| About | ❌ Empty |
| Contact | ❌ Empty |
| Privacy | ❌ Empty |
| Terms | ❌ Empty |
| Cookies | ❌ Empty |
| Blog listing | ❌ Empty |
| Blog posts | ❌ Empty |

Only the homepage and tool pages have OG images. A default OG image (/og/og-default.png) exists but is only used by the homepage.

**Fix:** Set openGraph.images to ["/og/og-default.png"] in the root layout's metadata or in each page's generateMetadata.

### 3.5 Contact Page og:url Hardcoded

**File:** src/app/[locale]/contact/page.tsx (line ~22)

`	ypescript
url: https://motionix.xyz//contact,
`

**⚠️ Issue M4:** The og:url uses a hardcoded domain instead of the TOOLS_SITE_URL constant or localizedUrl() helper. Same pattern in bout/page.tsx. Minor inconsistency — should use the centralized constant.

### 3.6 Twitter Card Configuration — ✅

Root layout sets 	witter.card: "summary_large_image". Tool pages and homepage correctly set 	witter.title, 	witter.description, and 	witter.images.

---

## 4. Performance

### 4.1 next.config.ts — 🟡 Mixed

**File:** 
ext.config.ts

| Setting | Status | Notes |
|---|---|---|
| eactStrictMode | ✅ | Enabled |
| optimizePackageImports | ✅ | lucide-react, react-icons |
| images.formats | ✅ | AVIF + WebP |
| images.remotePatterns | ✅ | cdn.img.ly, R2 storage |
| serverExternalPackages | ✅ | MongoDB, AWS SDK externalized |
| Sentry integration | ✅ | Conditional — only when DSN is set |

**⚠️ Issue P1 — orce-dynamic on tool pages:**

`	ypescript
// src/app/[locale]/tools/[slug]/page.tsx
export const dynamic = "force-dynamic";
`

This forces SSR on every tool page request. Since tool content rarely changes, these pages could be statically generated (ISR) with generateStaticParams + evalidate. The orce-dynamic is likely needed for getTranslations() calls but could be avoided with static message imports.

**Impact:** Every tool page request hits the origin server. No CDN caching for HTML. This hurts TTFB and Core Web Vitals.

**Same issue on:** src/app/[locale]/blog/[slug]/page.tsx

### 4.2 Font Loading — ✅ Excellent

**File:** src/app/layout.tsx

`	ypescript
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
`

| Check | Status |
|---|---|
| 
ext/font/google | ✅ Self-hosted, no Google Fonts requests |
| display: "swap" | ✅ Prevents FOIT |
| CSS variables | ✅ Clean separation |
| Subset optimization | ✅ Latin only |

**✅ Good:** Fonts are preloaded via Link headers in the response. Verified live: 3 font files preloaded.

### 4.3 Client-Side JavaScript — 🟡 Some Concern

**58 components** use "use client". Of these, **42 are in the motionix components directory**. Many are legitimately interactive (tool implementations, forms, analytics). However:

**⚠️ Issue P2:** Some components could be server components:
- SchemaProvider — only renders a <script> tag
- ToolFaq — could be a server component with client interactivity extracted
- ToolSteps — likely static content

### 4.4 CSS — ✅ Clean

**File:** src/app/globals.css (11.2 KB)

| Check | Status |
|---|---|
| Tailwind import | ✅ Single @import "tailwindcss" |
| @keyframes count | 13 — reasonable |
| prefers-reduced-motion | ✅ 2 rules (sparkle-dot, general) |
| No unused @import | ✅ |
| Admin theme scoped | ✅ Under .admin-theme class |

**✅ Good:** CSS is well-organized. Animations respect prefers-reduced-motion. Admin styles are properly scoped.

### 4.5 Redirects — ✅ Clean

**File:** 
ext.config.ts → edirects()

All bare paths (/, /tools, /about, etc.) 308-redirect to /en/ equivalents. This is correct for the localePrefix: "always" strategy.

### 4.6 Caching Headers — 🟡 Could Improve

| Resource | Cache-Control | Status |
|---|---|---|
| sitemap.xml | public, max-age=3600, stale-while-revalidate=86400 | ✅ |
| robots.txt | public, max-age=14400, stale-while-revalidate=86400 | ✅ |
| OG images | public, max-age=14400, must-revalidate | ✅ |
| Homepage HTML | private, no-cache, no-store, max-age=0 | ⚠️ |
| Tool pages HTML | private, no-cache, no-store, max-age=0 | ⚠️ |
| Blog pages HTML | private, no-cache, no-store, max-age=0 | ⚠️ |

**⚠️ Issue P3:** All page HTML responses are uncacheable due to orce-dynamic. If pages were statically generated, they could be served from Vercel's edge cache with stale-while-revalidate.

---

## 5. Content & i18n SEO

### 5.1 Locale Configuration — ✅

**File:** src/i18n/config.ts

| Locale | Language | Flag | Status |
|---|---|---|---|
| en | English | 🇬🇧 | ✅ Default |
| fr | Français | 🇫🇷 | ✅ |
| de | Deutsch | 🇩🇪 | ✅ |
| hi | हिंदी | 🇮🇳 | ✅ |
| ja | 日本語 | 🇯🇵 | ✅ |
| zh-cn | 简体中文 | 🇨🇳 | ✅ |

**Routing:** localePrefix: "always" — all URLs include locale prefix. Default locale (en) also gets /en/.

### 5.2 Translation Completeness — ✅ Excellent

All 6 message files have identical top-level keys:

`
Nav, Hero, Stats, Workflow, Pricing, FAQ, ToolsPreview, Testimonials,
StickyCta, AnnouncementBar, Footer, ToolPage, Tools, About, Contact,
Privacy, Terms, Cookies, Sitemap, Blog, ContactForm, ToolsCatalog, SEO
`

**SEO section completeness:**

| Key | en | fr | de | hi | ja | zh-cn |
|---|---|---|---|---|---|---|
| default | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tools (+ 8 tools) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| about | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| privacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| terms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cookies | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| blog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**✅ All SEO translations are complete across all 6 locales.**

### 5.3 Duplicate Content Prevention — ✅ Smart

The page-indexability.ts system prevents duplicate/thin content:
- Non-English pages with incomplete SEO translations → noindex
- Stub tools without content → noindex
- This means only high-quality, translated pages get indexed

### 5.4 Locale Routing — ✅

**File:** src/i18n/routing.ts

`	ypescript
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
`

**Middleware:** src/middleware.ts uses createMiddleware(routing) with matcher excluding pi, _next, _vercel, og, avicon, dmin, and static files.

---

## 6. Blog SEO

### 6.1 Blog Content System — ✅ Good

**File:** src/lib/blog.ts

| Check | Status |
|---|---|
| MDX frontmatter parsing | ✅ gray-matter |
| Required fields enforced | ✅ title, description, date, author, tags |
| Draft support | ✅ Excluded from production |
| Reading time estimation | ✅ ~200 wpm |
| Sorted by date | ✅ Newest first |

### 6.2 Blog Posts — ✅ High Quality Content

**40 blog posts** covering all 8 tools with relevant, long-tail keyword content.

| Category | Example Posts |
|---|---|
| Background removal | complete-guide-background-removal, product-photo-background-removal |
| Image compression | compress-images-without-losing-quality, compress-images-for-email |
| Passport photos | passport-photo-rejected-why, passport-photo-requirements-by-country |
| Video | video-formats-comparison, webcodecs-vs-ffmpeg-wasm |
| Signatures | create-digital-signature, add-signature-to-pdf |

### 6.3 Blog Pagination — 🔴 Missing

**🔴 Issue B1:** The blog listing page (src/app/[locale]/blog/page.tsx) renders ALL 40 posts at once with no pagination.

`	ypescript
const posts = listBlogPosts();
// renders all posts in a single grid
`

**Impact:**
- 40 posts × 6 locales = 240 links on a single page
- Large DOM size
- No way to deep-link to "page 2"
- Google may not crawl all posts efficiently from the listing

**Fix:** Add pagination (e.g., 12 posts per page) with ?page=2 URL parameters and <link rel="next/prev"> tags.

### 6.4 Blog ↔ Tool Internal Linking — ✅ Good

**File:** src/components/motionix/tool/RelatedGuides.tsx

Tool pages include a "Related Guides" section that links to relevant blog posts. Blog posts link back to tools via contextual content. This creates a solid internal linking structure.

### 6.5 Blog Post OG Images — 🔴 Missing

**🔴 Issue B2:** Blog posts have no OG images. When shared on Twitter/X, LinkedIn, or other platforms, no image preview will appear.

**Fix options:**
1. Generate dynamic OG images using @vercel/og or 
ext/og
2. Add an ogImage field to blog frontmatter
3. Use a default blog OG image as fallback

### 6.6 Blog Post Article Schema — ⚠️ Incomplete

**File:** src/app/[locale]/blog/[slug]/page.tsx

`	ypescript
const jsonLd = {
  "@type": "Article",
  headline: fm.title,
  description: fm.description,
  datePublished: fm.date,
  dateModified: fm.date,  // ← same as published
  author: { "@type": "Person", name: fm.author },
  // missing: image, wordCount, publisher.logo
};
`

**⚠️ Issue B3:** Missing image, wordCount, and publisher.logo fields. Google recommends including images in Article schema for rich results.

---

## 7. Core Web Vitals Indicators

### 7.1 Layout Shift Risks — ✅ Low Risk

| Risk | Status | Notes |
|---|---|---|
| Font loading | ✅ display: swap + preloaded via Link header | No FOIT, minimal CLS |
| Image dimensions | ✅ OG images specify width/height (1200×630) | |
| CSS animations | ✅ prefers-reduced-motion respected | |

### 7.2 Render-Blocking Resources — ✅ Minimal

| Resource | Status |
|---|---|
| CSS | ✅ Single Tailwind import, purged |
| Fonts | ✅ Self-hosted via next/font, preloaded |
| External scripts | ⚠️ Google Tag Manager, Ahrefs analytics — deferred by CSP |

### 7.3 Animation Performance — ✅ Good

**File:** src/app/globals.css

- 13 @keyframes animations — all CSS-based (no JS animation loops)
- sparkle-dot hidden via display: none when prefers-reduced-motion: reduce
- Admin theme animations scoped to .admin-theme class
- No GSAP or heavy JS animation libraries detected

### 7.4 Skip-to-Content Link — ✅

**File:** src/app/layout.tsx

`	ypescript
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Skip to content
</a>
`

All pages use <main id="main-content"> — proper accessibility pattern.

---

## 8. Security Headers

### 8.1 Live Headers — ✅ Strong

| Header | Value | Status |
|---|---|---|
| Content-Security-Policy | Present | ✅ (with unsafe-inline/eval caveats) |
| Strict-Transport-Security | max-age=63072000 | ✅ 2 years |
| X-Content-Type-Options | 
osniff | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ |

**⚠️ Issue H1:** CSP includes 'unsafe-inline' and 'unsafe-eval' for script-src. This weakens XSS protection but may be necessary for Next.js hydration and ONNX runtime.

**⚠️ Issue H2:** No X-Frame-Options header. While rame-ancestors 'self' in CSP covers this, adding X-Frame-Options: SAMEORIGIN provides defense-in-depth for older browsers.

---

## 9. Issue Summary & Priority Ranking

### 🔴 Critical (Fix First)

| ID | Issue | File | Impact |
|---|---|---|---|
| M1 | Homepage title duplication: "Motionix" appears twice | messages/*.json → SEO.home.title | Every search result shows doubled brand name |
| M2 | Blog posts have no OG image | src/app/[locale]/blog/[slug]/page.tsx | No social media preview images for 40 blog posts |
| M3 | Non-tool pages missing OG image (about, contact, privacy, terms, cookies, blog) | Multiple page files | No social media preview when shared |
| R4 | x-default hreflang missing /en/ prefix | src/lib/hreflang.ts or metadata config | Google sees redirect instead of direct URL |

### 🟡 High Priority

| ID | Issue | File | Impact |
|---|---|---|---|
| P1 | orce-dynamic on tool + blog pages | 	ools/[slug]/page.tsx, log/[slug]/page.tsx | Every request hits SSR, no CDN caching, slow TTFB |
| B1 | Blog listing has no pagination (40 posts at once) | src/app/[locale]/blog/page.tsx | Poor crawlability, large DOM |
| R3 | HTML sitemap page missing metadata + noindex | src/app/[locale]/sitemap/page.tsx | Indexable utility page with default title |
| S1 | Blog Article schema missing image | src/app/[locale]/blog/[slug]/page.tsx | No rich results for blog posts |

### 🟢 Medium Priority

| ID | Issue | File | Impact |
|---|---|---|---|
| S3 | SchemaProvider is client component | src/components/seo/SchemaProvider.tsx | Unnecessary client JS |
| S2 | Article schema uses same date for published/modified | log/[slug]/page.tsx | Minor rich results signal |
| S4 | About/Contact pages missing JSON-LD | bout/page.tsx, contact/page.tsx | Missed structured data opportunity |
| M4 | Contact/About og:url uses hardcoded domain | contact/page.tsx, bout/page.tsx | Minor inconsistency |
| P2 | Some components could be server components | Various | Reducing client JS bundle |
| H1 | CSP has unsafe-inline/eval | 
ext.config.ts | Weakened XSS protection |
| H2 | Missing X-Frame-Options header | 
ext.config.ts | Defense-in-depth gap |

### ℹ️ Low Priority

| ID | Issue | File | Impact |
|---|---|---|---|
| R2 | HTML sitemap not in XML sitemap | src/lib/sitemap-data.ts | Minor inconsistency |
| B3 | Article schema missing wordCount, publisher.logo | log/[slug]/page.tsx | Minor rich results signal |
| P3 | All page HTML uncacheable | 
ext.config.ts + page configs | Performance impact only |

---

## 10. Actionable Recommendations

### Quick Wins (< 1 hour each)

1. **Fix homepage title duplication** — Remove "— Motionix" from SEO.home.title in all 6 locale files. The template %s | Motionix already appends the brand.

2. **Add default OG image to non-tool pages** — Set openGraph.images: ["/og/og-default.png"] in the root layout metadata or in each page's generateMetadata where images are missing.

3. **Add noindex to HTML sitemap page** — Add generateMetadata with obots: { index: false } to src/app/[locale]/sitemap/page.tsx.

4. **Fix x-default hreflang** — In src/lib/hreflang.ts, ensure the x-default URL includes the /en/ prefix. May need to bypass Next.js's alternates processing for this key.

### Medium Effort (1-4 hours each)

5. **Add OG images to blog posts** — Either generate dynamic OG images or add a default blog OG image with frontmatter override support.

6. **Add pagination to blog listing** — Implement page-based pagination with <link rel="next/prev"> tags.

7. **Convert SchemaProvider to server component** — Remove "use client" directive since it only renders a <script> tag.

8. **Add Article schema image field** — Include the blog OG image (or default) in the Article JSON-LD.

### Larger Effort (4+ hours)

9. **Remove orce-dynamic from tool/blog pages** — Refactor to use static generation with ISR. This requires ensuring getTranslations() works with static generation or switching to static message imports.

10. **Add ContactPage and Organization JSON-LD** — Add structured data to About and Contact pages.

---

## Appendix: File Reference

| File | Purpose |
|---|---|
| src/app/robots.ts | Robots.txt generation |
| src/app/sitemap.ts → src/lib/sitemap-data.ts | Sitemap generation |
| src/lib/hreflang.ts | hreflang alternate URLs |
| src/lib/page-indexability.ts | Index/noindex logic |
| src/lib/seo-config.ts | SEO metadata generation |
| src/lib/schema.ts | JSON-LD schema builders |
| src/lib/tools.ts | Tool definitions + metadata |
| src/lib/blog.ts | Blog content loader |
| src/app/layout.tsx | Root layout + global metadata |
| src/app/[locale]/layout.tsx | Locale layout (next-intl provider) |
| src/app/[locale]/page.tsx | Homepage |
| src/app/[locale]/tools/[slug]/page.tsx | Tool pages |
| src/app/[locale]/blog/page.tsx | Blog listing |
| src/app/[locale]/blog/[slug]/page.tsx | Blog posts |
| src/app/[locale]/contact/page.tsx | Contact page |
| src/app/[locale]/about/page.tsx | About page |
| src/i18n/config.ts | Locale definitions |
| src/i18n/routing.ts | Routing config |
| src/middleware.ts | i18n middleware |
| 
ext.config.ts | Next.js config |
| src/app/globals.css | Global styles |
| messages/*.json | Translation files (6 locales) |

---

*Report generated by automated SEO & Performance audit. All live-site checks performed against https://motionix.xyz on 2026-08-15.*
