# Design System: Motionix — Blog Post Template (`/blog/$slug`)

## 1. Visual Theme & Atmosphere
A restrained, gallery-airy editorial with confident asymmetric utility. The atmosphere is **paper-warm, ink-crisp, and softly tactile** — like a well-lit studio where pastel swatches frame sharp ink type. Density 4 (Daily App Balanced, generous whitespace), Variance 7 (Offset Asymmetric, TOC rail vs. body), Motion 6 (Fluid CSS with spring-physics accents). No overlapping, no dense cockpits; every block breathes on a 6-unit rhythm (~68ch body). The page should feel like a printed guide that happens to be interactive — not a dashboard.

## 2. Color Palette & Roles
- **Paper Canvas** (#F9FAFB / oklch(0.985 0.008 80)) — Primary background, site-wide
- **Warm Peach Tint** (#FDEEE6 / oklch(0.93 0.04 50)) — Header gradient start, passport category chip
- **Mint Wash** (#E8F5EF / oklch(0.93 0.025 165)) — Callouts, compress/resize tints
- **Blush Wash** (#FDECEA / oklch(0.93 0.035 20)) — Cover frame alt, background-removal tint
- **Sky Wash** (#E6F0FA / oklch(0.91 0.035 240)) — Video/signature tints
- **Pure Surface** (#FFFFFF) — Cards, TOC rail, FAQ accordion
- **Charcoal Ink** (#18181B equivalent — oklch(0.16 0.012 85)) — Primary text, FAQ borders, ink CTA background
- **Muted Steel** (#71717A / oklch(0.5 0.015 60)) — Secondary text, metadata, eyebrow
- **Whisper Border** (rgba(226,232,240,0.5) / oklch(0.92 0.01 70 / 0.6)) — Subtle dividers, card borders
- **Brand Ember** (#E07A3F / oklch(0.74 0.14 38)) — Single accent for CTAs, links, active TOC, focus rings, progress bar. Saturation < 80%, never neon. No purple/blue.
- **Banned:** Pure black (#000000), oversaturated accents >80%, neon outer glows, gradient text on large headers, warm/cool gray fluctuation

## 3. Typography Rules
- **Display/Headlines:** `Inter Tight` (var(--font-display)) — Track-tight (-0.04em), weight 800, line-height 0.92. H1 `clamp(32px, 5vw, 52px)`, H2 `28–32px`, H3 `20–24px`. Hierarchy via weight + color, not just size.
- **Body:** `Inter` (var(--font-sans)) — Relaxed leading 1.7–1.75, size 17px, max 68ch (max-w-3xl), color ink/80. Links: primary underline with 30% opacity, offset 4px, hover solid.
- **Serif Quote:** `Instrument Serif` (var(--font-serif)) — Italic 400, 18px, used only for blockquote. Banned elsewhere; generic serifs (Times, Georgia, Garamond) banned.
- **Mono:** `JetBrains Mono` / `Geist Mono` — Eyebrow micro-type 11px, uppercase, tracking 0.18em, weight 600. For category chip, date, read time, TOC label. All numbers in high-density contexts use mono.
- **Banned:** `Inter` alone for premium headlines (must pair with Inter Tight/Instrument Serif), generic system fonts, serif in dashboards/CTAs

## 4. Component Stylings
- **Buttons (Primary):** Rounded-full, ember fill, white text, 44px min height, tactile `-1px` translate on `:active`, no outer glow. Secondary: ghost/outline with 1px whisper border.
- **Cards (Keep Reading):** Generously rounded `1.5–3rem`, 1px whisper border, diffused `0 2px 12px rgba(0,0,0,0.04)` shadow, hover lifts ~6px with `0 8px 30px rgba(0,0,0,0.08)`. Top 8px tint strip via category. Shadow tinted to background hue. `prefers-reduced-motion` disables lift.
- **Category Chip:** Ink pill (`bg-ink text-background`), mono 11px, uppercase, tracking widest, no border.
- **Callout:** Rounded-2xl, `bg-mint/60`, `border-mint/30`, 15px text, used sparingly for tips. No hard borders elsewhere.
- **Quote:** Left 3px `border-primary/30`, serif italic 18px, ink/70, no background.
- **FAQ Accordion:** Rounded-2xl, `border-ink/15`, divide `ink/10`, white cards inside. Question 15px medium, answer 14px ink/70. Toggle circle +/− with ink fill when open. Ink-bordered, no hard borders elsewhere.
- **Cover Frame:** Max-w-5xl, pastel tint field (`bg-peach` etc) `p-2 md:p-3`, inner white rounded-1rem with `aspect-[16/9]` image, `object-cover`, hover scale 1.03, priority + fixed 1200×675 for LCP.
- **TOC Rail:** Sticky `top-28`, rounded-2xl, `border-foreground/5`, `bg-white/70 backdrop-blur`, active item slides `translate-x-1`, font-medium, primary color accent, width indicator.
- **Progress Bar:** Fixed `top-0` `h-[2px]` primary fill, width driven by scroll, `transition-[width] duration-100`, `transform` only.
- **Inputs/Forms:** Label above input, helper optional, error below, focus ring ember, gap 4. No floating labels. (For future CMS edits.)
- **Loaders:** Skeletal shimmer matching layout dimensions, no circular spinners. **Empty States:** Composed illustrated CTA, not just "No data."

## 5. Layout Principles
- **Grid-First:** CSS Grid `max-w-7xl` outer, `max-w-5xl` header/cover, `max-w-3xl` (~68ch) body, `300px` TOC rail via `grid-cols-[1fr_300px]`. No `calc()` percentage hacks.
- **Header Gradient:** Warm `from-peach/70 via-paper/60 to-background`, bottom border `foreground/5`, generous `pt-32 md:pt-40` offset for fixed header, `pb-10 md:pb-14`.
- **Asymmetric:** Body left, TOC right on desktop; mobile collapses to single column, TOC becomes `<details>` "Jump to" disclosure. No centered hero when variance >4 — left-aligned editorial.
- **No Overlap:** Every element occupies clean spatial zone, no absolute stacking. Contain via max-width, never full-bleed text.
- **Banned:** Generic "3 equal cards horizontally" — Keep Reading uses intentional 3/2/1 responsive grid with category tint differentiation, not identical squares. Full-height uses `min-h-[100dvh]` never `h-screen`.
- **Spacing:** Vertical rhythm `space-y-6` (6-unit), section gaps `mt-10 md:mt-14`, clamp-scaled. Max 1400px centered containment.

## 6. Motion & Interaction
- **Spring Physics:** `stiffness:100, damping:20` for lifts/scales, `ease-out-expo (0.16,1,0.3,1)` for fades, duration 300ms base, 700ms for cover scale.
- **Perpetual Micro-Loops:** Active TOC dot pulse, cover subtle float on idle (via `transform`), no infinite on static text.
- **Staggered Orchestration:** Body blocks fade-up cascade 80ms delay per card (Keep Reading), TOC items none, cover wash-in 2s.
- **Hardware-Accelerated Only:** Animate `transform` and `opacity` exclusively. Never `top/left/width/height`. Grain/noise on fixed pseudo-elements only.
- **Hover Behaviors:** Cards lift 6px, cover scales 1.03x inside overflow-hidden, arrows nudge `translate-x-0.5`, TOC active slides `translate-x-1`.
- **Performance:** Isolate Client Components (`ProgressBar`, `TOC`, `FAQAccordion`) to avoid SSR churn; `prefers-reduced-motion: reduce` disables all via global `* { transition-duration:0.01ms }`.

## 7. Anti-Patterns (Banned)
- No emojis anywhere
- No `Inter` alone for headlines; no generic serif fonts (Times, Georgia, Garamond, Palatino) — distinctive modern serifs only when needed
- No pure black (#000000); use charcoal ink
- No neon/outer glow shadows, no oversaturated accents, no excessive gradient text
- No custom mouse cursors, no `cursor: none`
- No overlapping elements, no absolute-positioned content stacking, no `h-screen`
- No 3-column equal card layouts, no centered hero when variance >4
- No generic names ("John Doe", "Acme", "Nexus") — use real author "Motionix" + bio
- No fake round numbers (99.99%, 50%) — use real read time, dates
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No filler UI text: "Scroll to explore", "Swipe down", chevrons, bouncing arrows
- No broken Unsplash links — use `picsum.photos` or local `/og/og-default.png` or tool `/img/tools/*.jpg`
- No emojis, no Inter premium ban violation, no pure black, no neon, no overlapping
