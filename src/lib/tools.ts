/**
 * Single source of truth for every tool on Motionix.
 *
 * All 8 tools are functional and run client-side:
 *   - background-remover, passport-photo-maker (ONNX/compliance)
 *   - student-id-photo-maker, resume-photo-maker, signature-maker,
 *     photo-resizer, image-compressor (canvas)
 *   - video-compressor (WebCodecs/Mediabunny)
 *
 * NEVER add a slug-collision; NEVER use a slug like "watermark-remover" or
 * "youtube-downloader" — those are legal/red-flag categories.
 */

export type ToolEngine =
  | "image-onnx"
  | "photo-compliance"
  | "image-canvas"
  | "image-resize"
  | "image-compress"
  | "image-signature"
  | "video-wasm"; // Phase 2: mediabunny

export type CostClass = "free-zero" | "free-low" | "free-sample"; // future: "ai-paid"

export type CountryPreset = {
  code: string;       // ISO
  label: string;
  width: number;      // px
  height: number;     // px
  unit: "px" | "mm";
  // head fraction of frame 0..1
  headFraction: number;
  // printable pixel size on the printed spec
  printMmWidth?: number;
  printMmHeight?: number;
  // DPI baseline
  dpi?: number;
  // background expectation - "white" | "light"
  background: "white" | "light" | "any";
  notes?: string;
};

export type ToolFaq = { q: string; a: string };

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  /** one-sentence hero description */
  description: string;
  /** 60–120 words — distinct per tool (no template swap) */
  longDescription: string;
  /** the use-case bento cards */
  useCases: { title: string; description: string }[];
  /** 5–6 real, friendly, distinct Q&As per tool */
  faqs: ToolFaq[];
  /** formats the marquee advertises */
  formats: string[];
  /** lucide icon class or React-icons name */
  icon: string;
  /** banner emoji / glyph used in bento card */
  glyph: string;
  /** tone for the visual block — pastel swatch */
  tone: "peach" | "sky" | "mint" | "blush" | "ember" | "paper";
  /** which engine powers the page */
  engine: ToolEngine;
  /** cost class for the page hero */
  cost: CostClass;
  /** build status */
  phase: "functional" | "stub";
  /** when stub, explain why we kept it here */
  stubHint?: string;
  /** SEO metadata */
  metaDescription: string;
  metaTitle: string;
  /** compliance for the passport tool only — strict, relaxed */
  compliance?: "format-only" | "ai-allowed";
  /** country presets — passport-only */
  countries?: CountryPreset[];
  /** workflow steps (3–4) for the "How it works" grid */
  steps: { n: string; t: string; d: string }[];
  /** routes neighbours recommend after this tool finishes */
  next: string[]; // slugs
  /** og image filename relative to /public/og/tools/ */
  ogImage: string;
};

// ============================================================
//  Helpers
// ============================================================

export const bySlug = (slug: string) => tools.find((t) => t.slug === slug);

// ============================================================
//  Tools catalog
// ============================================================

export const tools: Tool[] = [
  // ============================================================
  //  1. Background remover  (FUNCTIONAL — ONNX client-side)
  // ============================================================
  {
    slug: "background-remover",
    name: "Background remover",
    tagline: "Erase the background from a portrait, product, or pet in seconds.",
    description:
      "Drop a portrait or product photo and paste out the background in your browser. The job runs on your device, so the image never leaves your tab.",
    longDescription:
      "This is the same kind of background-eraser you&apos;d expect from a paid product-shot service — except we run a small on-device AI model called ISNet, downloaded once and cached in your browser. Open the tool, drop a JPG or PNG, and a transparent PNG comes out the other side. People use it for product shots, headshots, school ID photos, birthday invites, or anything that needs to sit cleanly on a colored background. Because the model never phones home, you can drop in the photo of a kid, a client, or a confidential product and skip the lawyer email.",
    useCases: [
      { title: "Product listings", description: "Plain white or transparent backgrounds for Etsy, Shopify, or Amazon listings." },
      { title: "Profile photos", description: "Clean cutouts for LinkedIn, Discord, Slack, and Gravatar." },
      { title: "Pet portraits", description: "Yes, it works on cats too — dogs are slightly easier but the model handles both." },
      { title: "Family photographs", description: "Remove an ugly back-of-house background and drop your kid onto the beach instead." },
    ],
    formats: ["JPG", "PNG", "WebP", "HEIC", "AVIF"],
    icon: "LuScissors",
    glyph: "✂",
    tone: "peach",
    engine: "image-onnx",
    cost: "free-zero",
    phase: "functional",
    metaTitle: "Free Background Remover — runs in your browser (Motionix)",
    metaDescription:
      "Remove the background from a JPG, PNG, or WebP image in your browser. No upload, no account, no tracking of your photo. Powered by a small on-device AI model.",
    steps: [
      { n: "01", t: "Drop your image", d: "Drag a JPG, PNG, or WebP up to 10MB into the viewfinder. The model starts downloading the first time you do this — once." },
      { n: "02", t: "Wait a heartbeat", d: "The first image takes a couple of seconds (model warm-up). Further images on the same visit take under a second." },
      { n: "03", t: "Download a transparent PNG", d: "Click to download. We don&apos;t watermark, redact, or compress it. Whatever you dropped in is what you get back." },
    ],
    next: ["passport-photo-maker", "resume-photo-maker", "photo-resizer"],
    ogImage: "background-remover-og.png",
    faqs: [
      { q: "Is it actually free?", a: "Yes. There is no paid tier for the background remover and we do not show ads on top of your work." },
      { q: "Where does the photo go?", a: "Nowhere. The AI model downloads from our CDN once, then runs entirely on your CPU or GPU. The image bytes never touch a server." },
      { q: "How big can the image be?", a: "Up to 10 MB and 4096 pixels on the long side for now. Bigger images get downscaled before processing." },
      { q: "Does it handle hair well?", a: "Honestly, about as well as the paid removers — short hair is great, flyaway long hair gets slightly fuzzy edges that most viewers don&apos;t notice in real use." },
      { q: "Can I download with a colored background instead of transparent?", a: "Yes — pick a color from the palette before downloading. The default is transparent PNG." },
      { q: "What about videos or animated GIFs?", a: "Not in this tool. Video background removal needs a server in Phase 2 — we&apos;re honest about that." },
    ],
  },

  // ============================================================
  //  2. Passport photo maker  (FUNCTIONAL — ComplianceModePicker)
  // ============================================================
  {
    slug: "passport-photo-maker",
    name: "Passport photo maker",
    tagline: "Frame a passport, visa, or ID photo that won&apos;t get rejected at the embassy.",
    description:
      "Pick the country, drop your photo, get a print-ready square in the right pixel size. We don&apos;t edit your face — we just crop it.",
    longDescription:
      "Embassies reject passport photos for surprisingly specific reasons: head too small, white background too gray, photo older than six months, file in the wrong format. We built this tool to take those rejections off your plate. You pick your country; we crop, head-position, and resize the image to the exact spec the consulate asks for. Strict mode never edits a single pixel of your actual face — it only frames the existing image against a compliant background. We support the four highest-volume country specs (US, UK, India, Schengen) at launch. If you get rejected after using it, the tool tells you what to check before you trek back to the embassy.",
    useCases: [
      { title: "US passport renewal", description: "600×600 JPEG, head 50–69% of frame, white background. Strict format-only mode." },
      { title: "UK passport", description: "600×750 px, plain light-coloured background, head between 29–34 mm." },
      { title: "Schengen visa", description: "413×531 px (35×45 mm), uniform white or light grey, head 32–36 mm top-to-chin." },
      { title: "Indian passport (Seva upload)", description: "350×350 px JPEG, 20–50 KB, white background." },
    ],
    formats: ["JPG", "JPEG", "PNG"],
    icon: "LuIdCard",
    glyph: "🪪",
    tone: "paper",
    engine: "photo-compliance",
    cost: "free-low",
    phase: "functional",
    compliance: "format-only",
    countries: [
      { code: "US", label: "United States (passport / visa)", width: 600, height: 600, unit: "px", headFraction: 0.6, dpi: 300, background: "white", notes: "Strict — no pixel edits. Square, white, JPEG." },
      { code: "UK", label: "United Kingdom (passport)", width: 600, height: 750, unit: "px", headFraction: 0.65, dpi: 300, background: "white", notes: "Plain light-coloured background." },
      { code: "IN", label: "India (passport Seva upload)", width: 350, height: 350, unit: "px", headFraction: 0.65, dpi: 200, background: "white", notes: "20–50 KB file." },
      { code: "SCH", label: "Schengen (ICAO 35×45 mm)", width: 413, height: 531, unit: "px", headFraction: 0.7, dpi: 300, background: "white", notes: "Head 32–36 mm top-to-chin." },
    ],
    steps: [
      { n: "01", t: "Pick the doc", d: "US passport? UK passport? Schengen visa? Each one has slightly different rules. We only ask once, before you upload." },
      { n: "02", t: "Drop a face-forward photo", d: "Plain background, no glasses (US passport rule), natural expression. A phone photo is fine if the lighting is even." },
      { n: "03", t: "Center & crop", d: "We frame your head to the exact head-to-frame ratio the embassy requires and place it on a compliant white background in strict mode." },
      { n: "04", t: "Download the spec-correct file", d: "You get a correctly-sized JPEG that matches the inspection software embassies now run automatically." },
    ],
    next: ["student-id-photo-maker", "resume-photo-maker", "background-remover"],
    ogImage: "passport-photo-maker-og.png",
    metaTitle: "Free Passport & Visa Photo Maker — country-correct on first try",
    metaDescription:
      "Make a passport or visa photo that matches your country&apos;s exact spec. Pick from US, UK, India, or Schengen. We crop, frame, and resize — without touching your face. Strict mode never edits pixels.",
    faqs: [
      { q: "Will my photo get rejected?", a: "If you submit a sharp, well-lit face-forward photo with a plain background, our output follows the spec each consulate publishes. If you get rejected, email us the rejection reason and we&apos;ll tell you which rule you tripped." },
      { q: "Does it edit my face?", a: "Strict mode (the default for US / UK passports) does not edit a single pixel of your face — it only crops and places the existing image on a compliant white background. AI mode (resume / admission) lets you swap the background color." },
      { q: "Why is the US version so strict about backgrounds?", a: "The State Department banned AI-edited and digitally synthesized passport photos in 2025–26. We make sure strict mode isn&apos;t even touched by an AI — just handpicked rules from their published guidance." },
      { q: "Can I use this for visas?", a: "Yes — use the Schengen preset for any Schengen/EU visa. Other countries&apos; specs vary; we&apos;re adding more over time." },
      { q: "Do I need an account?", a: "No. We don&apos;t ask for an email and we don&apos;t log which country you chose." },
      { q: "What if my country isn&apos;t listed?", a: "Pick the closest spec — Schengen is a reasonable fallback for most ICAO-compliant docs. We add new countries based on requests." },
    ],
  },

  // ============================================================
  //  3. Student ID photo maker  (STUB)
  // ============================================================
  {
    slug: "student-id-photo-maker",
    name: "Student ID photo maker",
    tagline: "ID photos sized for college portals, scholarship forms, and exam applications.",
    description:
      "Snap a photo, frame it for the exact portal you&apos;re submitting to, and skip the studio trip.",
    longDescription:
      "Universities and scholarship portals love arbitrary pixel caps: 200×250, 600×600, ‘under 1 MB’, ‘color photos only’. We pull together the most common of those specs into a single picker. Like the passport tool, we don&apos;t edit your face unless you ask, and we save you the second or third try when the portal says your file is too large. Built for final-year students who would rather spend an evening filling out applications than chasing a Walgreens photo clerk.",
    useCases: [
      { title: "Common App", description: "Size and crop a headshot that meets the Common App attachment spec." },
      { title: "Scholarship forms", description: "Many portals require 2×2 inch photos — we frame to that print spec." },
      { title: "University SSO profiles", description: "Bulk-format photos for student-directory uploads." },
      { title: "Exam-day IDs", description: "Frame to the exam proctor&apos;s requested size and format." },
    ],
    formats: ["JPG", "PNG"],
    icon: "LuGraduationCap",
    glyph: "🎓",
    tone: "mint",
    engine: "photo-compliance",
    cost: "free-low",
    phase: "functional",
    stubHint: "",
    steps: [
      { n: "01", t: "Choose your school or spec", d: "Pick from the Common App preset or enter custom pixel dimensions." },
      { n: "02", t: "Drop your headshot", d: "Even a phone photo is fine if the lighting is decent." },
      { n: "03", t: "Download a portal-ready file", d: "Right size, right colorspace, ready to upload." },
    ],
    next: ["resume-photo-maker", "passport-photo-maker", "photo-resizer"],
    ogImage: "student-id-photo-maker-og.png",
    metaTitle: "Student ID Photo Maker — exactly the right size (Motionix)",
    metaDescription:
      "Make ID photos sized for the Common App, scholarship portals, and university admissions. Free, no signup, runs in your browser.",
    faqs: [
      { q: "Is this for kids?", a: "Any age. The Common App and scholarship presets assume adult headshot framing." },
      { q: "Is it the same as the passport tool?", a: "Same engine — different presets. We added Common App, scholarship, and exam-day specs on top of the passport cropping logic." },
      { q: "Will it always be free?", a: "Yes, the photo cropping is free. If a school asks for a quick mail-back print service, that&apos;s the part we may charge for." },
      { q: "What&apos;s the privacy story?", a: "Same as the rest of the site — your photo stays in your browser." },
      { q: "What file size limits?", a: "Right now we cap at 10 MB and a max 4096-pixel edge. Higher portals, larger requirements? Email us." },
      { q: "Can I bulk-generate?", a: "Not yet, but that&apos;s the obvious next step once the single photo is solid." },
    ],
  },

  // ============================================================
  //  4. Resume photo background remover  (STUB)
  // ============================================================
  {
    slug: "resume-photo-maker",
    name: "Resume & LinkedIn photo",
    tagline: "Headshots for resumes, LinkedIn, and X — clean background, recruiter-friendly.",
    description:
      "Drop a headshot, get a clean white or light-grey background that doesn&apos;t fight with the resume layout.",
    longDescription:
      "Recruiters scan 250+ resumes an hour. A bright orange wall behind your confident smile isn&apos;t helping. We crop to headshot framing (1400×1400 by default — comfortable for LinkedIn&apos;s avatar crop). Background swap is fair game here — most resume conventions want a flat neutral. We lean to canvas-based resizing with optional on-device AI background swap. (Yes, you can use the same code on a passport photo in relaxed mode — they share the backend.)",
    useCases: [
      { title: "LinkedIn headshot", description: "Trim to LinkedIn&apos;s safe circle and remove the wall behind you." },
      { title: "Resume attachment", description: "Crop and place on white; recruiters prefer neutral." },
      { title: "CV / business card", description: "Square or 3:4 crop that works across print and web." },
      { title: "Email signature photo", description: "Compressed and framed to a sensible size for email clients." },
    ],
    formats: ["JPG", "PNG", "WebP"],
    icon: "LuUserSquare",
    glyph: "👤",
    tone: "blush",
    engine: "image-canvas",
    cost: "free-zero",
    phase: "functional",
    steps: [
      { n: "01", t: "Pick a framing", d: "1:1 for LinkedIn, 3:4 for the resume header, 4:5 for Instagram ready." },
      { n: "02", t: "Pick your background", d: "Pure white, light grey, or your school&apos;s brand color." },
      { n: "03", t: "Drop your photo", d: "We crop to the chosen framing and swap the background." },
    ],
    next: ["background-remover", "photo-resizer", "image-compressor"],
    ogImage: "resume-photo-maker-og.png",
    metaTitle: "Free Resume & LinkedIn Photo Tool — clean crops, recruiter-safe",
    metaDescription:
      "Crop and reframe a headshot for LinkedIn, your resume, or a CV. Free, in your browser, no signup.",
    faqs: [
      { q: "Should I let it AI-edit my face?", a: "Only if you want a tiny touch-up. The default leaves your photo untouched." },
      { q: "What size is right for LinkedIn?", a: "400×400 px minimum. We export at 1400×1400 so the photo survives LinkedIn&apos;s compression." },
      { q: "Is the background a flat color?", a: "Yes — flat white or one of five brand neutrals. We don&apos;t add background patterns; they tend to age badly." },
      { q: "Can I use the same photo on multiple platforms?", a: "Yes — choose export crops per platform from a single drop." },
      { q: "Privacy?", a: "Photo stays on your device. We log the tool you used, not the photo you uploaded." },
    ],
  },

  // ============================================================
  //  5. Signature maker  (STUB)
  // ============================================================
  {
    slug: "signature-maker",
    name: "Signature maker",
    tagline: "Make a transparent signature PNG — read, sign, send.",
    description:
      "Draw a signature, type one, or upload a paper scan. Get a transparent PNG suitable for contracts and email signatures.",
    longDescription:
      "Old way: take a piece of paper, sign it, scan it, edit out the background in Photoshop. New way: open the tool, scribble with your mouse or finger, save the transparent PNG. We auto-trim the canvas, make the ink black, and remove the cream paper. There are also variants for typed signatures, drawn signatures, or uploaded scans. Comes in handy when a PDF contract wants a digital signature and your HR portal doesn&apos;t accept plaintext image upload from a scanner.",
    useCases: [
      { title: "PDF contracts", description: "Drop a transparent signature into a PDF contract without a wet ink scan." },
      { title: "Email signatures", description: "Use it as a small PNG signature in your email footer." },
      { title: "Resume attachments", description: "Sign the bottom of a PDF version without touching a printer." },
      { title: "Form attachments", description: "Attach a clean signature to any form that allows PNG uploads." },
    ],
    formats: ["PNG", "SVG"],
    icon: "LuPenLine",
    glyph: "✍️",
    tone: "blush",
    engine: "image-canvas",
    cost: "free-zero",
    phase: "functional",
    steps: [
      { n: "01", t: "Sign with your trackpad, mouse, or finger", d: "It looks handwritten, because it is." },
      { n: "02", t: "Or upload a scan", d: "We&apos;ll auto-trim and remove the paper color." },
      { n: "03", t: "Pick a style", d: "Black ink, navy ink, or transparent stroke." },
      { n: "04", t: "Download a transparent PNG", d: "Or an SVG if you want a vectorized signature." },
    ],
    next: ["photo-resizer", "image-compressor", "resume-photo-maker"],
    ogImage: "signature-maker-og.png",
    metaTitle: "Free Signature Maker — transparent PNG, ready for contracts",
    metaDescription:
      "Make a clean, transparent-PNG signature by drawing, typing, or uploading. Free, in your browser.",
    faqs: [
      { q: "Will it look handwritten?", a: "Yes — your strokes are recorded with pen pressure (where your device supports it) and reproduced at SVG resolution." },
      { q: "Can I sign with my finger on a phone?", a: "Yes — we record touch paths at the same fidelity." },
      { q: "Is the signature legally valid?", a: "It depends on the jurisdiction and the document. PDF e-signatures with cryptographic audit trails use software like DocuSign; this tool produces a transparent image you drop into any document." },
      { q: "Where does the file go?", a: "It never leaves your browser. We can&apos;t see what you sign." },
      { q: "Why does the page ask for a name?", a: "It doesn&apos;t — we never ask for it." },
    ],
  },

  // ============================================================
  //  6. Photo resizer (STUB)
  // ============================================================
  {
    slug: "photo-resizer",
    name: "Photo resizer",
    tagline: "Resize to an exact pixel size or KB target. No weird resampling.",
    description:
      "Resize a photo to precise pixel dimensions or file-size target — the kind portal forms demand.",
    longDescription:
      "We&apos;ve all been here: portal says ‘200 × 250 pixels under 50 KB’. Default photo editors round your file to 350 pixels and 200 KB. This tool lets you type the exact size and KB target and gives you back exactly that. Default uses high-quality Canvas downscale; advanced users can pick nearest-neighbor (pixel art) or bicubic (smoother photo resize). Routinely used for government portal forms, FR-44 forms, visa applications, or any place that demands the file be exactly some dimensions.",
    useCases: [
      { title: "Government portals", description: "Match the KB and pixel constraints of online form uploads." },
      { title: "Bulk resizing", description: "Resize batches of photos to the same destination resolution." },
      { title: "Social dimensions", description: "Instagram 1080, Facebook cover 820×312, X header 1500×500." },
      { title: "Print photos", description: "Convert a phone photo to 300 DPI at your chosen print size." },
    ],
    formats: ["JPG", "PNG", "WebP"],
    icon: "LuScaling",
    glyph: "📐",
    tone: "sky",
    engine: "image-resize",
    cost: "free-zero",
    phase: "functional",
    steps: [
      { n: "01", t: "Set your target", d: "Pick pixel dimensions, or a target KB, or both." },
      { n: "02", t: "Drop the photo", d: "Up to 4096 pixels on the long side, max 10 MB." },
      { n: "03", t: "Choose a resampler", d: "Bicubic for photos, nearest-neighbor for screenshots." },
    ],
    next: ["image-compressor", "background-remover", "signature-maker"],
    ogImage: "photo-resizer-og.png",
    metaTitle: "Free Photo Resizer — exact pixel or KB targets",
    metaDescription:
      "Resize photos to exact pixel dimensions or KB targets. No signup, no upload, runs in your browser.",
    faqs: [
      { q: "Will it lose quality?", a: "Downscaling photos doesn&apos;t lose noticeable quality. Upscaling introduces softness — we&apos;ll warn you if that&apos;s a bad idea." },
      { q: "KB target is unreachable?", a: "Tell us — that&apos;s why we have the strict dimension step. Sometimes the target KB is impossible at the requested dimensions; we&apos;ll surface the issue." },
      { q: "Multiple photos?", a: "Bulk is on the roadmap — Phase 2." },
      { q: "Why no signup?", a: "We don&apos;t think it would be helpful. Open, resize, done." },
    ],
  },

  // ============================================================
  //  7. Image compressor  (STUB)
  // ============================================================
  {
    slug: "image-compressor",
    name: "Image compressor",
    tagline: "Shrink a JPG, PNG, or WebP to a fraction of its size — visually identical.",
    description:
      "Compress JPGs, PNGs, and WebPs to keep them visually identical but dramatically smaller, especially for email and CMS uploads.",
    longDescription:
      "Modern PNG encoders can shave 60–80% off a screenshot without changing the pixels, and JPGs at quality 80 are mathematically indistinguishable from quality 95 at normal viewing distance. We pick the right encoder per file, let you pick a target KB or a quality target, and show a side-by-side size comparison. People use it to fit images into email forms, CMS upload boxes with MB caps, and to make a 12 MB photo shrink to 380 KB before attaching to an email.",
    useCases: [
      { title: "Email attachments", description: "Skinny enough to fit under common 10 MB mailbox caps." },
      { title: "CMS uploads", description: "Compress for WordPress, Squarespace, or any CMS with upload size caps." },
      { title: "PDF embedding", description: "Drop into PDFs at a sensible quality without bloating the file." },
      { title: "Performance budgets", description: "Hit Core Web Vitals targets on slow connections." },
    ],
    formats: ["JPG", "JPG-2000", "PNG", "WebP", "AVIF"],
    icon: "LuFileImage",
    glyph: "📸",
    tone: "ember",
    engine: "image-compress",
    cost: "free-zero",
    phase: "functional",
    steps: [
      { n: "01", t: "Pick a target", d: "A specific KB, a percentage, or just ‘best I can get without losing quality’." },
      { n: "02", t: "Drop your image", d: "We pick the right encoder based on file type and target." },
      { n: "03", t: "Compare and download", d: "Side-by-side preview; download only when you&apos;re happy." },
    ],
    next: ["background-remover", "photo-resizer", "signature-maker"],
    ogImage: "image-compressor-og.png",
    metaTitle: "Free Image Compressor — shrink JPG, PNG, WebP to a fraction of the size",
    metaDescription:
      "Compress JPG, PNG, and WebP images for email, CMS, and the web. Quality-targeted, runs in your browser.",
    faqs: [
      { q: "Will it visibly degrade images?", a: "Only if you push it. By default we keep the file visually identical." },
      { q: "Is there a size cap?", a: "10 MB images right now. We&apos;ll lift it once servers are in place." },
      { q: "Is there a batch mode?", a: "Phase 2 roadmap. We don&apos;t want to ship a half-baked batch." },
      { q: "Where does the file go?", a: "Browser. Always." },
    ],
  },

  // ============================================================
  //  8. Video compressor  (FUNCTIONAL — Mediabunny client-side)
  // ============================================================
  {
    slug: "video-compressor",
    name: "Video compressor",
    tagline: "Shrink an MP4 or MOV to email-able size without re-uploading it.",
    description:
      "Drop a video file and pick a target size or quality. We transcode in your browser using WebCodecs — no upload, no waiting on a server.",
    longDescription:
      "Most “free” video compressors on the web upload your file to a server (and that upload alone takes longer than the compression itself). This one runs locally through WebCodecs via the Mediabunny library — no upload, no waiting, no privacy concerns. Pick a target — 10 MB for an email attachment, 50 MB for a Slack post, or just “best file size at this quality” — and we re-encode the file using the browser’s built-in H.264 hardware pipeline where available. Audio is kept on a single AAC track. For files over 200 MB we recommend a server compressor (out of scope for free web tools right now).",
    useCases: [
      { title: "Email attachments", description: "Most email forms cap at 10-20 MB. Compress a 50 MB MP4 down to fit." },
      { title: "Slack / Teams / Discord", description: "Most messenger clients compress or choke on files over 50 MB. Pre-shrink them." },
      { title: "WhatsApp status", description: "WhatsApp caps videos at ~16 MB on iOS. Pick a target and ship." },
      { title: "Backup cleanup", description: "Re-encode old recordings at a sensible bitrate before archival." },
    ],
    formats: ["MP4", "MOV", "MKV", "WebM"],
    icon: "LuVideo",
    glyph: "🎬",
    tone: "paper",
    engine: "video-wasm",
    cost: "free-low",
    phase: "functional",
    steps: [
      { n: "01", t: "Drop your video", d: "MP4, MOV, MKV, or WebM. Up to 200 MB; larger files need a server is too long." },
      { n: "02", t: "Pick a target", d: "Target KB, a percentage of the original, or pick a fixed bitrate." },
      { n: "03", t: "We transcode", d: "The browser re-encodes via WebCodecs. On a typical laptop a 60 MB MP4 takes about 30–60 seconds." },
      { n: "04", t: "Download", d: "Save the resulting MP4. We don&apos;t move your file anywhere in the meantime." },
    ],
    next: ["image-compressor", "photo-resizer", "background-remover"],
    ogImage: "video-compressor-og.png",
    metaTitle: "Free Video Compressor — runs in your browser, no upload",
    metaDescription:
      "Shrink an MP4, MOV, or WebM to email-able size in your browser. No upload, no server, powered by WebCodecs.",
    faqs: [
      { q: "Why is this faster than online compressors?", a: "Because we never upload your file. The transcoder runs on your machine via WebCodecs." },
      { q: "Is audio re-encoded too?", a: "Yes — we keep audio at AAC. If your source has multiple audio tracks we keep the first one." },
      { q: "Why no file over 200 MB?", a: "Browser tab memory limits. A 4 GB file would crash most tabs. We&apos;re honest about the cap." },
      { q: "Does it support vertical videos?", a: "Yes — aspect ratio is preserved as-is. We don&apos;t change orientation." },
      { q: "What about subtitles?", a: "Phase 2 stretch goal. Right now they are dropped." },
      { q: "Where does the file go?", a: "Browser. Always. We don&apos;t see it." },
    ],
  },
];

// ============================================================
//  Grouping for the catalog UI
// ============================================================

export const toolsByPhase = {
  functional: tools.filter((t) => t.phase === "functional"),
} as const;

export const TOOL_COUNT = tools.length;
