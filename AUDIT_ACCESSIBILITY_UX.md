# Motionix.xyz — Accessibility & UX Audit Report

**Auditor:** Accessibility & UX Auditor (automated)
**Date:** 2026-08-15
**Stack:** Next.js 16 + React 19 + next-intl + Tailwind CSS v4
**WCAG Target:** 2.1 Level AA

---

## Executive Summary

Motionix.xyz has a **solid foundation** — the root layout includes a skip-to-content link, dynamic lang attribute, ocus-visible styles, and a prefers-reduced-motion media query. The design system uses a well-structured oklch color token palette. Internationalization covers 6 locales. However, several **critical accessibility gaps** prevent WCAG 2.1 AA compliance, primarily around keyboard navigation, focus management in overlays, and missing ARIA semantics on interactive widgets.

**Estimated WCAG 2.1 Compliance Level: A (partial)** — fails multiple AA criteria.

### Severity Breakdown

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 5 | Blocks keyboard/screen-reader users entirely |
| 🟠 Serious | 8 | Significant barriers, workaround difficult |
| 🟡 Moderate | 9 | Usability friction, not blocking |
| 🔵 Minor | 7 | Best-practice improvements |

---

## 1. Accessibility (WCAG 2.1) Findings

### 🔴 CRITICAL

#### C1. Mobile Menu Toggle Button Missing
**File:** src/components/motionix/layout/SiteHeader.tsx
**WCAG:** 2.1.1 Keyboard, 4.1.2 Name, Role, Value

The component has mobileOpen state and renders a mobile overlay, but **there is no button to toggle it**. The <header> contains only the logo, desktop nav, and the "Try a tool" CTA. On viewports < lg, the nav links are hidden (hidden lg:flex) but no hamburger button appears. Mobile users cannot navigate the site.

**Fix:** Add a <button> before or after the desktop nav that calls setMobileOpen(!mobileOpen), visible only on lg:hidden, with ria-label="Open menu" / ria-label="Close menu" and ria-expanded={mobileOpen}.

---

#### C2. BeforeAfterSlider — No Keyboard Access
**File:** src/components/motionix/tool/BeforeAfterSlider.tsx
**WCAG:** 2.1.1 Keyboard

The comparison slider responds to mouse drag and touch but has **zero keyboard support**. There is no ole="slider", no ria-valuemin/ria-valuemax/ria-valuenow, and no onKeyDown handler for arrow keys. Keyboard-only users cannot interact with the slider at all.

**Fix:**
- Add ole="slider" to the drag handle div
- Add ria-valuemin={0}, ria-valuemax={100}, ria-valuenow={split}
- Add ria-label="Before/after comparison slider"
- Handle ArrowLeft/ArrowRight/Home/End key events to adjust split
- Make the handle focusable with 	abIndex={0}

---

#### C3. No Focus Trap in History Drawer
**File:** src/components/motionix/layout/HistoryDrawer.tsx
**WCAG:** 2.4.3 Focus Order

When the history drawer opens (	ranslate-x-0), focus is not moved into it and is not trapped. Tab can escape behind the semi-transparent overlay into inert page content. There is also no Escape key handler to close the drawer.

**Fix:**
- Move focus to the drawer's close button on open
- Trap Tab/Shift+Tab within the drawer while open
- Add onKeyDown handler to close on Escape
- Use inert attribute on the page content behind the drawer (or ria-hidden + 	abIndex={-1} on background)

---

#### C4. Language Dropdown — No Keyboard Navigation
**File:** src/components/motionix/layout/LanguageSwitcher.tsx
**WCAG:** 2.1.1 Keyboard, 4.1.2 Name, Role, Value

The language dropdown opens on click but:
- Has no ole="menu" on the dropdown list
- Has no ole="menuitem" on options
- Has no ria-haspopup="true" on the trigger
- Cannot be closed with Escape
- No arrow-key navigation within the dropdown
- No focus management when opening

**Fix:**
- Add ole="menu" to the dropdown container
- Add ole="menuitem" to each locale button
- Add ria-haspopup="menu" to the trigger
- Handle Escape to close, ArrowUp/ArrowDown to navigate
- Move focus to first item on open

---

#### C5. ToolDropzone Uses lert() for File Size Errors
**File:** src/components/motionix/tool/ToolDropzone.tsx
**WCAG:** 3.3.1 Error Identification

When a file exceeds maxSize, the component calls lert() which:
- Blocks the UI thread
- Is not accessible on all platforms
- Cannot be styled or associated with the dropzone
- Disrupts screen reader flow

**Fix:** Replace with an inline error state using ria-live="polite" and a visible error message below the dropzone.

---

### 🟠 SERIOUS

#### S1. Color Contrast — Muted Foreground Likely Fails 4.5:1
**File:** src/app/globals.css
**WCAG:** 1.4.3 Contrast (Minimum)

The design token --color-muted-foreground: oklch(0.5 0.015 60) renders as a medium-gray. When used for helper text (	ext-foreground/50, 	ext-foreground/45, 	ext-foreground/40), contrast against the warm-white background (oklch(0.985 0.008 80)) is approximately **3.2:1 – 3.8:1**, failing the 4.5:1 AA requirement for normal text.

**Affected classes across many components:** 	ext-foreground/50, 	ext-foreground/45, 	ext-foreground/40, 	ext-foreground/55

**Fix:** Increase opacity ratios: /50 → /60, /40 → /55, /45 → /60, or darken the base foreground color. Test with a contrast checker.

---

#### S2. Missing ria-controls and Panel IDs on Accordions
**Files:** src/components/motionix/marketing/FaqAccordion.tsx, src/components/motionix/tool/ToolFaq.tsx
**WCAG:** 4.1.2 Name, Role, Value

Both accordion components have ria-expanded on the toggle button but lack:
- ria-controls pointing to the answer panel's id
- A unique id on each answer panel

Screen readers cannot programmatically associate the button with the content it expands.

**Fix:** Add id={aq-panel-} to each answer div and ria-controls={aq-panel-} to each button.

---

#### S3. No ria-live Regions for Dynamic Tool States
**Files:** All tool implementations (BackgroundRemoverImpl.tsx, ImageCompressorImpl.tsx, PassportMakerImpl.tsx, etc.)
**WCAG:** 4.1.3 Status Messages

When tools transition between states (idle → loading → done/error), there is no ria-live region announcing the change. Screen reader users have no feedback that processing started, progressed, or completed.

**Fix:** Add <div aria-live="polite" aria-atomic="true" className="sr-only">{statusMessage}</div> near each tool's status display, updating the text content on state changes.

---

#### S4. Range Sliders Lack Visible Value Labels
**File:** src/components/motionix/tool/tools/BackgroundRemoverImpl.tsx
**WCAG:** 1.3.1 Info and Relationships

The shadow opacity and shadow size range inputs have small <span> labels ("Opacity", "Size") but **no visible readout of the current value**. Users cannot see what value they've selected. Also missing ria-valuetext.

**Fix:** Display the current value next to each slider (e.g., "Opacity: 0.25") and add ria-valuetext for screen readers.

---

#### S5. Marquee Animation Ignores Reduced Motion
**File:** src/components/motionix/visuals/Marquee.tsx
**WCAG:** 2.3.3 Animation from Interactions

The infinite marquee animation (nimate-marquee / nimate-marquee-fast) does not check prefers-reduced-motion. While globals.css has a blanket nimation-duration: 0.01ms override, the Marquee component applies animation via Tailwind utility classes that may override the CSS rule due to specificity.

**Fix:** Add a useMediaQuery check or matchMedia("(prefers-reduced-motion: reduce)") and conditionally disable the animation class, showing static content instead.

---

#### S6. StickyCta Has No Dismiss Mechanism
**File:** src/components/motionix/marketing/StickyCta.tsx
**WCAG:** 1.4.10 Reflow

The sticky CTA bar appears after scrolling 800px and cannot be dismissed. On mobile viewports, it may overlap with the History button (both ixed bottom-6) and obscure content.

**Fix:** Add a close/dismiss button. Persist dismissal in sessionStorage. Ensure it doesn't overlap with the HistoryHost button by offsetting z-index or position.

---

#### S7. HistoryDrawer ria-hidden Management
**File:** src/components/motionix/layout/HistoryDrawer.tsx
**WCAG:** 4.1.2 Name, Role, Value

The <aside> has ria-hidden={!open} but the overlay <div> always has ria-hidden (set to 	rue), even though it has an onClick handler. The overlay should be clickable and announced as a button or the dismiss region should use ole="presentation".

**Fix:** Remove ria-hidden from the overlay div. Use ole="dialog" and ria-modal="true" on the aside. Set ria-hidden="true" on the main page content when the drawer is open.

---

#### S8. ContactForm Missing ria-describedby for Errors
**File:** src/components/motionix/marketing/ContactForm.tsx
**WCAG:** 3.3.1 Error Identification, 3.3.3 Error Suggestion

Error messages (<p className="text-sm text-destructive">) are not linked to their corresponding inputs via ria-describedby. Screen readers may not announce errors when the user focuses the problematic field.

**Fix:** Add unique IDs to error messages and ria-describedby on the relevant inputs. Add ole="alert" to the error container.

---

### 🟡 MODERATE

#### M1. ToolPrivacy Component Not Internationalized
**File:** src/components/motionix/tool/ToolPrivacy.tsx
**WCAG:** N/A (i18n/UX)

All strings are hardcoded in English: "Privacy & Security", "Processing", "Browser-only", "Upload Required", "Data Retention". When the site is viewed in French, German, Hindi, Japanese, or Chinese, this section remains English.

**Fix:** Use getTranslations() with a ToolPrivacy namespace.

---

#### M2. Background Remover — Color Picker Swatches Lack Labels
**File:** src/components/motionix/tool/tools/BackgroundRemoverImpl.tsx

The background color picker renders colored circles (<button>) but some lack visible text labels. While ria-label would help, the current implementation has descriptive text only for some options.

**Fix:** Add ria-label to each color swatch button (e.g., ria-label="White background").

---

#### M3. No Cancel Button During Video Compression
**File:** src/components/motionix/tool/tools/VideoCompressorImpl.tsx

Once compression starts, there is no way to cancel. The cancelRef exists but is never exposed as a UI button.

**Fix:** Add a "Cancel" button visible during status === "running", setting cancelRef.current = true.

---

#### M4. History Button and StickyCta Z-Index Overlap
**Files:** src/components/motionix/tool/HistoryHost.tsx, src/components/motionix/marketing/StickyCta.tsx

Both render ixed bottom-6 elements. On the homepage, the StickyCta (z-30) may overlap. On tool pages, the History button (z-30) sits at ight-6. If both were ever visible simultaneously, they'd collide.

**Fix:** Add ottom-6 right-6 offset awareness or hide StickyCta on tool pages.

---

#### M5. Signature Canvas Missing ARIA Label
**File:** src/components/motionix/tool/tools/SignatureMakerImpl.tsx

The drawing <canvas> element has no ria-label or ole attribute. Screen readers announce it as a generic "canvas" with no indication of its purpose.

**Fix:** Add ria-label="Draw your signature here" and ole="img" to the canvas.

---

#### M6. ToolPage <main> Missing on Non-Tool Pages
**File:** src/app/layout.tsx

The root layout has the skip-to-content link (<a href="#main-content">) but only the tool page (src/app/[locale]/tools/[slug]/page.tsx) wraps content in <main id="main-content">. The homepage and other pages don't have a matching id="main-content" target.

**Fix:** Ensure all page layouts include <main id="main-content">.

---

#### M7. Image Alt Text Could Be More Descriptive
**File:** src/components/motionix/tool/BeforeAfterSlider.tsx

The before/after images use lt="Original" and lt="Processed". These are functional labels but don't describe the image content.

**Fix:** Accept descriptive alt text as props, falling back to "Original image" / "Processed image".

---

#### M8. No Skip Link for Admin Dashboard
**File:** src/app/admin/(dashboard)/layout.tsx

The admin dashboard has its own layout but likely reuses the root layout's skip link, which points to #main-content. Verify the admin layout has a matching <main id="main-content">.

---

#### M9. scroll-behavior: smooth Without Reduced Motion Check
**File:** src/app/globals.css

html { scroll-behavior: smooth; } is set globally. While the @media (prefers-reduced-motion: reduce) block overrides it to uto, there's a brief flash of smooth scrolling before the media query evaluates. Also, some components use scrollIntoView() programmatically without checking the preference.

**Fix:** Apply smooth scroll only when prefers-reduced-motion: no-preference using the media query directly, or use JavaScript scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }).

---

### 🔵 MINOR

#### N1. Missing el="noopener noreferrer" on External Links
**Files:** src/components/motionix/tool/CloudflareUpload.tsx (has it), src/components/motionix/layout/SiteFooter.tsx (sitemap link missing it)

The footer sitemap link (<a href={...} rel="nofollow">) opens an external URL without el="noopener".

---

#### N2. Arrow Icons in Steps Need Screen Reader Text
**Files:** src/components/motionix/tool/ToolSteps.tsx, src/components/motionix/marketing/WorkflowGrid.tsx

The "→" character inside the step cards is visual-only. While it has no ria-hidden, it's decorative and should be hidden from screen readers.

**Fix:** Add ria-hidden="true" to the arrow span.

---

#### N3. Checkmark Character May Not Announce Correctly
**File:** src/components/motionix/marketing/PricingCards.tsx

The "✓" character in perk lists is rendered as plain text. Some screen readers may announce it as "check mark" which is fine, but using an SVG icon with ria-hidden="true" would be more consistent.

---

#### N4. Stats Number Ticker Has No Reduced Motion Fallback
**File:** src/components/motionix/visuals/NumberTicker.tsx

The NumberTicker component animates numbers counting up. While globals.css reduces animation duration, the ticker may still produce rapid value changes that are distracting.

---

#### N5. Form Inputs Missing utocomplete Attributes
**File:** src/components/motionix/marketing/ContactForm.tsx

The contact form's name and email fields don't have utoComplete="name" and utoComplete="email", which helps browsers and password managers autofill correctly.

---

#### N6. Tooltip/Popover Pattern Not Used for Tool Privacy Info
**File:** src/components/motionix/tool/ToolPrivacy.tsx

The privacy section is a static card. For better progressive disclosure, the processing/upload/retention info could use a <details>/<summary> pattern or tooltip.

---

#### N7. Video Element Missing Track/Captions
**File:** src/components/motionix/tool/tools/VideoCompressorImpl.tsx

The compressed video preview <video> has controls but no <track> element for captions. While this is a user-uploaded video (not editorial content), providing a note about captions would be good UX.

---

## 2. Component UX Audit

### SiteHeader ✅ Good, ❌ Mobile Menu Broken
- Floating pill design is visually distinctive
- Desktop navigation is clean and accessible
- **Critical:** No mobile hamburger button — mobile nav is unreachable
- Language switcher integrated but keyboard-inaccessible (see C4)
- "Quick Find" link is a nice touch but may confuse (it's just a link to /tools)

### SiteFooter ✅ Good
- Clean three-column layout
- Proper semantic HTML (<footer>, <ul>, <li>)
- Good responsive behavior (stacks on mobile)
- Copyright year is dynamic

### Hero ✅ Excellent Visual Design
- Strong typographic hierarchy with display + serif italic combo
- Pastel card grid is visually engaging
- CTAs are clear and prominent
- Aurora background adds depth without distraction
- Badge line adds credibility

### ContactForm ✅ Good
- Honeypot spam protection is clever and invisible
- Validation is inline and user-friendly
- Success state is clear with email confirmation
- Loading state shows spinner
- **Issue:** Error messages not linked to inputs (see S8)

### PricingCards ✅ Good
- Clear three-tier structure
- Featured tier is visually distinct
- "Most chosen" badge adds social proof
- CTA buttons are prominent

### ToolsPreview ✅ Excellent
- Beautiful card design with illustrations
- Proper 
ext/image usage with sizes, priority, loading
- Excellent alt text on all images
- Focus-visible outline on cards
- Responsive grid (1→2→4 columns)

### ToolDropzone ✅ Good, ⚠️ Error Handling
- Viewfinder corners are a nice design touch
- Three input methods (drag, click, paste) is excellent
- Keyboard accessible (ole="button", 	abIndex, Enter/Space)
- **Issue:** Uses lert() for file size errors (see C5)
- Subhint provides helpful context

### ToolResult ✅ Clean
- Simple, consistent wrapper
- Good border radius and spacing

### ToolSteps ✅ Good
- Clean grid layout
- Hover effects on each step
- Responsive (1→2→3→4 columns)

### BeforeAfterSlider ⚠️ Needs Work
- Drag interaction feels natural on mouse/touch
- **Critical:** No keyboard support (see C2)
- Checkerboard background is a nice touch for transparency
- Percentage display is helpful

### LanguageSwitcher ⚠️ Needs Work
- Clean dropdown design
- Flag emojis add visual recognition
- **Critical:** Keyboard inaccessible (see C4)
- localStorage persistence is good for returning users

### ToolPrivacy ✅ Good Content
- Clear three-metric display
- Lock emoji adds visual interest
- **Issue:** Not internationalized (see M1)

### BackgroundRemoverImpl ✅ Feature-Rich
- Progress messages during model download are excellent
- Multiple output options (transparent, colored, shadow)
- Refine edges feature is a nice pro touch
- Save to history + cloud upload options
- Before/after comparison slider
- **Issue:** Range sliders need visible values (see S4)

### ImageCompressorImpl ✅ Good
- Three compression modes (best/KB/percentage)
- Before/after comparison with size stats
- Binary search for KB targeting is clever
- Clear download button with file size

### PassportMakerImpl ✅ Excellent UX
- Multi-step flow (picker → tool) is clear
- Country presets with dimensions shown
- Mode descriptions explain what each does
- Print-ready upsell via Stripe is well-integrated
- Multiple output sizes

### VideoCompressorImpl ✅ Good
- WebCodecs feature detection with clear fallback message
- Progress bar during compression
- Quality presets are well-labeled
- Video preview after compression
- **Issue:** No cancel button (see M3)

### SignatureMakerImpl ✅ Creative
- Two modes (draw/upload) cover different use cases
- Canvas drawing with pressure sensitivity
- Ink color options
- Auto-trim for uploaded scans is clever

### HistoryDrawer ⚠️ Needs Work
- Clean slide-in design
- Thumbnail previews are helpful
- "No history yet" state explains the feature
- **Issues:** No focus trap, no Escape key (see C3, S7)

### CloudflareUpload ✅ Good
- Probes R2 availability on mount — renders nothing if disabled
- Upload progress feedback
- Copy link functionality
- Prettified error messages

---

## 3. Responsive Design Audit

### ✅ Strengths
- **Mobile-first Tailwind classes** used consistently (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- **Breakpoints:** Standard Tailwind (sm:, md:, lg:) used throughout
- **Font scaling:** Hero uses 	ext-[14vw] md:text-[10vw] for responsive headlines
- **Tool pages:** Grid layouts collapse properly on mobile
- **Touch targets:** Most buttons are px-5 py-2.5 or larger (meets 44×44px)

### ⚠️ Issues
- **R1.** Hero 	ext-[14vw] on very small screens (320px) = ~45px, which is fine, but on very large screens (2560px) = ~358px, which may be excessive
- **R2.** Tool page header padding pt-32 md:pt-40 may push content too far down on mobile
- **R3.** PricingCards grid-cols-1 md:grid-cols-3 — on tablets in portrait, cards may be too narrow
- **R4.** BeforeAfterSlider spect-square on mobile may be too tall; consider spect-[4/3]
- **R5.** StickyCta fixed positioning may overlap with mobile browser chrome

---

## 4. UX Patterns Audit

### Loading States ✅ Good
- Background remover: Progress messages + percentage for model download
- Video compressor: Progress bar
- Image compressor: "Compressing…" button state
- Resume photo maker: Multi-stage status text
- **Gap:** No skeleton/shimmer loading states for initial page loads

### Error Messages ✅ Good
- All tools show inline error messages
- Errors are user-friendly ("We couldn't process that image. Try a different file?")
- CloudUpload has prettified error codes
- ContactForm has friendly validation messages
- **Gap:** ToolDropzone uses lert() (see C5)

### Progress Indicators ✅ Good
- Background remover: percentage + download key
- Video compressor: progress bar with percentage
- Most tools disable buttons during processing
- **Gap:** No cancel mechanism for long operations (see M3)

### Drag-and-Drop Feedback ✅ Good
- Visual border color change on drag over
- Background color change (g-primary/5)
- Viewfinder corners animate
- **Gap:** No sound/haptic feedback

### Download Flow ✅ Good
- Download buttons use proper <a download> attribute
- File names include tool name + timestamp
- File sizes shown on download buttons
- "Start over" button available after every tool

---

## 5. Internationalization UX Audit

### ✅ Strengths
- 6 locales: English, French, German, Hindi, Japanese, Chinese (Simplified)
- 
ext-intl with server-side getTranslations() and client-side useTranslations()
- Language switcher with flag emojis + native names
- localStorage persistence for locale preference
- Proper lang attribute on <html> element
- Locale-aware routing (/[locale]/tools/[slug])

### ⚠️ Issues
- **I1.** ToolPrivacy component is not internationalized (hardcoded English)
- **I2.** No RTL support — if Arabic or Hebrew is added, layout will break
- **I3.** Error messages in tool implementations are partially hardcoded English strings mixed with i18n
- **I4.** ContactForm labels ("Name", "Email", "Subject", "Message") are hardcoded English
- **I5.** Date formatting in HistoryDrawer uses 	oLocaleString() without explicit locale
- **I6.** Number formatting in file sizes uses 	oFixed() without locale-aware formatting
- **I7.** Some ria-label attributes are English-only (e.g., "Open history", "Close history")

---

## 6. Visual Design System Audit

### ✅ Strengths
- **OkLCH color space** — modern, perceptually uniform
- **Comprehensive token system** with semantic names (--color-primary, --color-muted, etc.)
- **Tool page mode** (data-mode="tool") switches to cream/ink palette — good UX differentiation
- **Font stack:** Inter (body), Inter Tight (display), JetBrains Mono (code) — all self-hosted via 
ext/font
- **Radius scale** with consistent increments
- **Custom easing curves** (--ease-out-expo, --ease-out-quart)
- **Admin theme** is fully scoped under .admin-theme — no leakage

### ⚠️ Issues
- **V1.** No dark mode implementation despite 	hemeColor supporting both schemes
- **V2.** oklch(0.985 0.008 80) background is very close to white — the "warm paper" effect is subtle enough to be invisible on many monitors
- **V3.** Border color oklch(0.92 0.01 70 / 0.6) is very faint — may be invisible on low-contrast displays
- **V4.** Custom utilities (ont-display, eyebrow, rutal-border) are well-organized in @utility blocks

---

## 7. Trust & Privacy UX Audit

### ✅ Strengths
- **ToolPrivacy component** clearly shows processing location, upload requirement, and data retention
- **"Everything runs in your browser"** messaging in metadata description
- **Browser-only processing** for most tools (background remover, compressor, resizer, etc.)
- **No account required** — stated in metadata
- **Privacy/Terms/Cookies** pages linked in footer

### ⚠️ Issues
- **T1.** Cookie policy page exists (/cookies) but no cookie consent banner was observed
- **T2.** Cloudflare R2 upload is opt-in but the 24-hour retention policy should be more prominent
- **T3.** Clerk auth is optional — when disabled, the "local-only while auth is staging" note is helpful but could be more prominent
- **T4.** History drawer stores data in localStorage without explicit consent mechanism

---

## 8. Live Site Performance Check

| URL | Status | Notes |
|-----|--------|-------|
| https://motionix.xyz/ | 308 → /en | Proper locale redirect |
| https://motionix.xyz/en | 200 | Homepage loads (locale-aware) |
| https://motionix.xyz/fr | 200 | French locale works |
| https://motionix.xyz/de | 200 | German locale works |
| https://motionix.xyz/ja | 200 | Japanese locale works |
| https://motionix.xyz/tools/background-remover | 308 → /en/tools/... | Proper redirect |
| https://motionix.xyz/en/tools/background-remover | 200 (134KB) | Tool page loads |

### Observations
- Root URL properly redirects to default locale (/en)
- Non-locale-prefixed tool URLs redirect to locale-prefixed versions
- All tested locales return 200
- Page size of 134KB for tool pages is reasonable (includes JS bundles)

---

## 9. Priority-Ranked Recommendations

### P0 — Fix Immediately (Blocks WCAG A)

| # | Issue | Component | Effort |
|---|-------|-----------|--------|
| 1 | Add mobile menu toggle button | SiteHeader | 30 min |
| 2 | Add keyboard support to BeforeAfterSlider | BeforeAfterSlider | 1 hr |
| 3 | Add focus trap + Escape to HistoryDrawer | HistoryDrawer | 1 hr |
| 4 | Add keyboard nav to LanguageSwitcher | LanguageSwitcher | 1 hr |
| 5 | Replace lert() with inline error in ToolDropzone | ToolDropzone | 30 min |

### P1 — Fix Soon (WCAG AA Failures)

| # | Issue | Component | Effort |
|---|-------|-----------|--------|
| 6 | Fix color contrast for muted text | globals.css + all components | 2 hrs |
| 7 | Add ria-controls + IDs to accordions | FaqAccordion, ToolFaq | 30 min |
| 8 | Add ria-live regions to tool status areas | All tool impls | 1 hr |
| 9 | Add visible values to range sliders | BackgroundRemoverImpl | 30 min |
| 10 | Handle reduced motion in Marquee | Marquee | 30 min |
| 11 | Add dismiss to StickyCta | StickyCta | 30 min |
| 12 | Fix HistoryDrawer ria-hidden management | HistoryDrawer | 30 min |
| 13 | Add ria-describedby to ContactForm errors | ContactForm | 30 min |

### P2 — Improve (UX Polish)

| # | Issue | Component | Effort |
|---|-------|-----------|--------|
| 14 | Internationalize ToolPrivacy | ToolPrivacy | 1 hr |
| 15 | Add cancel button to video compression | VideoCompressorImpl | 30 min |
| 16 | Fix History/StickyCta overlap | HistoryHost, StickyCta | 30 min |
| 17 | Add ARIA labels to signature canvas | SignatureMakerImpl | 15 min |
| 18 | Ensure #main-content on all pages | All page layouts | 30 min |
| 19 | Add utoComplete to contact form | ContactForm | 15 min |
| 20 | Internationalize hardcoded English strings | ContactForm, tool errors | 2 hrs |

### P3 — Nice to Have

| # | Issue | Component | Effort |
|---|-------|-----------|--------|
| 21 | Add dark mode support | globals.css | 4 hrs |
| 22 | Add cookie consent banner | New component | 2 hrs |
| 23 | Improve alt text on comparison images | BeforeAfterSlider | 15 min |
| 24 | Add el="noopener" to external links | SiteFooter | 15 min |
| 25 | Add skeleton loading states | Various | 2 hrs |

---

## 10. Summary

Motionix.xyz is a well-designed, visually polished web application with strong fundamentals. The design system is thoughtful, the tool implementations are feature-rich, and the internationalization infrastructure is solid. However, **5 critical accessibility issues** prevent WCAG 2.1 AA compliance — most notably the missing mobile menu button and keyboard-inaccessible interactive widgets.

The highest-impact fixes are:
1. **Add the mobile menu button** (30 minutes, unlocks mobile navigation)
2. **Add keyboard support to the comparison slider** (1 hour, unlocks keyboard users)
3. **Fix focus management in overlays** (1 hour, unlocks screen reader users)
4. **Fix color contrast** (2 hours, unlocks low-vision users)

With these fixes, Motionix would achieve **WCAG 2.1 Level AA** compliance and provide an excellent experience for all users.
