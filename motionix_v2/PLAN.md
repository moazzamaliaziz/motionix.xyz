# Motionix.xyz — Execution Plan

Direction (confirmed): stay client-side now, architect toward hybrid later, **no AI/server pipeline yet**, free tier only. Fix real tool bugs, make the tool UX friendlier, add tests, ship new client-side tools, and add non-intrusive monetization. All findings below were verified against the actual code, not the master doc (which is stale: no Prisma/Better Auth/FFmpeg/Whisper exist — the app is Clerk + MongoDB driver + 100% client-side tools).

Already completed this session: `hi.json`, per-page hreflang metadata (`src/lib/hreflang.ts`), XML sitemap hreflang alternates. Build green.

---

## Phase 1 — Fix broken tool features (highest priority, user-flagged)

These are confirmed, code-level defects. Ordered by severity.

1. **Video Compressor is dead for every visitor** — `VideoCompressorImpl.tsx:55` checks `navigator.videoEncoder` (always `undefined`); the API is `window.VideoEncoder`. Everyone sees the "browser unsupported" wall. Fix detection, then verify/repair the mediabunny transcode pipeline (the `CanvasSink`/`Conversion` flow at `:180-239` looks speculative and needs a real end-to-end transcode test), pass `maxSize={200*1024*1024}` to the dropzone (currently silently capped at 10 MB), and subtract audio+overhead from the target-bitrate math.
2. **Passport Maker output is non-compliant** — presets carry `headFraction` (0.6–0.7) and the UI promises "head fills X%", but `composeStrict`/`composeWithBackground` only center-crop to aspect ratio; the head fraction is never enforced. Add head/subject scaling so the crop actually meets the promised fraction (bounding-box based; face detection optional later). Also embed DPI metadata in the JPEG so print sizing is correct.
3. **Image Compressor PNG path is broken** — `UPNG.encode([...], bytes.byteLength, 0)` (`:75`, `:99`) passes the encoded file as pixels and byte-length as width. It throws and silently falls back to canvas/WebP. Decode to RGBA and pass real width/height, or drop UPNG for a canvas path. Also fix the "Original 0 KB" subhint and the no-op `shrinkUnder` 25 MB cap.
4. **Background Remover color/shadow controls are destructive** — `applyBackground` flattens `outBlob`/`outUrl` (`:168-169`), so changing color or shadow after the first apply composites onto the already-flattened opaque image (new color hidden, shadows stack, transparency unrecoverable). Keep the original transparent cutout in a ref and always recompose from it.
5. **Photo Resizer stretches in pixel mode** — Contain/Cover fit logic only exists in the KB branch; the pixels/DPI branch always `drawImage(0,0,w,h)` and distorts aspect ratio. Apply the same aspect-aware source-rect math to both branches.
6. **Student ID / Resume framing** — "white background" and "extend edges" are no-ops (cover-fit hides the fill); Resume framing can crop the head because it cover-fits on full-image dims, not the subject bounding box. Center on subject bounding box.
7. **Cross-cutting hygiene** — revoke leaked object URLs across all tools (probe images, per-slider-tick URLs); fix literal `&apos;`/`&amp;apos;` leaking into JS strings (not JSX) in Video/Background/Passport error text; RefineCanvas & Signature SVG export honoring the actual drawn output.

Each fix gets a manual verification in a real browser tab (these are client-side, so `next build` alone won't catch them).

## Phase 2 — Friendlier tool UX (user-flagged: "further user-friendly interface")

1. **Build the missing `/tools` catalog page** (`src/app/[locale]/tools/page.tsx`) — three prominent links (`SiteHeader.tsx:19`, `:65`, `ToolsPreview.tsx:37`) currently 404. Map the registry, reuse the bento card styling, add search + category filtering. Add a `category` field to the `Tool` type to drive facets. Add localized metadata + hreflang (reuse `alternatesFor("/tools", locale)`).
2. **Mobile navigation** — header nav is `hidden md:flex` with no hamburger (`SiteHeader.tsx:48`); phone users can't reach Home/Tools/Blog/FAQ at all. Add an accessible mobile menu.
3. **Replace `alert()` with inline error UI** in `ToolDropzone.tsx:35`; raise per-tool `maxSize` sensibly (phone photos exceed 10 MB).
4. **Unified progress + shared result affordances** — promote the Background Remover's real progress-bar pattern into the shared shell so canvas/video tools show real progress, not a static "Compressing…" label.
5. **Registry-driven footer + linked breadcrumb** — footer hardcodes 7 of 8 tools (`SiteFooter.tsx:8-16`, missing video-compressor); make it map the registry, and make the tool-page breadcrumb link to the new catalog.
6. **Optional (medium):** batch/multi-file upload — `ToolDropzone` discards `files[1..n]`. Bigger change; sequence after the above.

## Phase 3 — Testing infrastructure (user-flagged)

Set up **Vitest** + `@vitest/coverage-v8`, add `test`/`test:watch` scripts. Start with pure logic (cheapest, highest ROI): `rate-limit.ts` (fake timers for the module `setInterval`), `hreflang.ts`, `tools.ts` (registry invariants: unique/non-blocked slugs, 5–6 FAQs each, valid enums), `schema.ts`. Then `blog.ts` (fs fixtures) and API-handler validation/security paths (contact honeypot/rate-limit, uploads type/size allowlist, `admin/cleanup` constant-time compare, `downloads/[key]` path-traversal guard). Add a CI step (lint + build + test) and re-enable `react-hooks/exhaustive-deps` and `react/jsx-key` as warnings.

## Phase 4 — Monetization + polish (user-flagged)

- **AdSense, non-intrusive, blog/marketing surfaces only.** The public privacy promise (`en.json` FAQ a5: "we don't show ads in tools") means **no ads on tool pages** — ads go on blog posts, blog index, and optionally between homepage marketing sections. Env-gated like analytics, `next/script` afterInteractive/lazyOnload, fixed-height reserved containers to protect CLS. Requires CSP updates in `next.config.ts` (add Google ad origins + a `frame-src` directive). Keep free-tier only; Stripe engine stays dormant.
- **`/api/health` endpoint** — referenced in `instrumentation.ts:20` but never built. Return `{ ok, sentry, r2, time }`.
- **SEO polish** — add `BreadcrumbList` and `BlogPosting` JSON-LD (data already exists), tighten CSP (drop `unsafe-eval` on the default route), add HSTS.

## Phase 5 — New client-side tools (user-flagged)

Only tools that run fully in-browser (no server cost), fitting the privacy-first positioning. Candidates from the master doc's list that are client-side-feasible: **Image Converter / HEIC→JPG / WebP / PNG↔JPG** (canvas + existing decode paths), **Image Upscaler** (ONNX, mirrors background-remover infra), **Video Trimmer** and **Video→GIF** (WebCodecs/mediabunny, after the video pipeline is fixed in Phase 1). Sequence these after Phase 1 so we build on a working WebCodecs base. Each new tool = registry entry + impl + localized strings across all 6 locales + FAQ/schema.

---

## Execution order

Phase 1 first (broken features are the most damaging and user-flagged), then Phase 2 (the `/tools` 404 + mobile nav are severe), Phase 3 tests to lock in the fixes, then Phase 4 monetization/polish, then Phase 5 new tools. I'll land these as small, verified increments — typecheck + build after each, manual browser check for the client-side tool fixes.

I'll start with **Phase 1, item 1 (Video Compressor detection + pipeline)** unless you want a different entry point.

Note: design-inspiration images from the first message aren't in my current context — if visual/design changes are in scope, please re-attach them.
