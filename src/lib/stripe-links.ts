/**

 * Stripe Payment Links — preset URLs for paid bundles.
 *
 * Configuration:
 *   - All variables are NEXT_PUBLIC_* so client components can read them.
 *   - Set the `STRIPE_PAYMENT_LINK_*` env vars to enable paid buttons in
 *     tools. Without them the UI shows nothing paid (Phase 1 free).
 *
 * Why Payment Links and not Checkout Sessions?
 *   - Solo founder wires Stripe without a webhook listener.
 *   - Stripe handles receipts + tax + the success URL bounce-back.
 *   - Payment Links support `success_url`: we route them right back to a
 *     thank-you page that includes the user's download ZIP.
 *
 * If a slug has no Payment Link configured, the UI doesn't render a paid
 * button at all — a deliberate "do nothing" rather than "show broken".
 *
 * Bundles supported:
 *   - per-country: US, UK, IN, EU/Schengen
 *   - per-tool: passport-photo-maker (any country), image-compressor,
 *               video-compressor, student-id, resume-photo
 *   - "all-access": downloads as one ZIP (one link per year)
 *
 * The env keys document themselves; if you need new tiers, add a new env
 * key + a new helper below — the engine is built to extend cheaply.
 */

export type PaymentLinkEntry = {
  /** Friendly name shown in UI */
  name: string;
  /** Stripe-hosted Payment Link URL */
  url: string;
  /** USD price string for display */
  price: string;
  /** Short hint copy shown beneath the button */
  hint: string;
  /** Tool slug this bundle belongs to. */
  tool: string;
  /** Optional country scope (when applicable) */
  country?: string;
};

const LINKS: Record<string, PaymentLinkEntry> = {};

/**
 * Load a Payment Link if the env var is a valid buy.stripe.com URL.
 * Returns null when missing / placeholder so callers can gracefully skip.
 */
function loadLink(
  key: string,
  defaults: Omit<PaymentLinkEntry, "url" | "country"> & { country?: string },
): PaymentLinkEntry | null {
  const url = process.env[key];
  if (!url || typeof url !== "string" || !url.startsWith("https://buy.stripe.com/")) {
    return null;
  }
  return { ...defaults, url };
}

// Per-country passport bundles
const US_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_US", {
  name: "Print-ready US passport bundle",
  price: "$4.99",
  hint: "Print-quality JPEG + receipt for refund.",
  tool: "passport-photo-maker",
  country: "US",
});
const UK_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_UK", {
  name: "Print-ready UK passport bundle",
  price: "£4.99",
  hint: "35×45mm print-ready JPEG.",
  tool: "passport-photo-maker",
  country: "UK",
});
const IN_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_IN", {
  name: "Print-ready India passport bundle",
  price: "₹299",
  hint: "35×35mm JPEG, 200 DPI.",
  tool: "passport-photo-maker",
  country: "IN",
});
const SCH_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SCH", {
  name: "Schengen / EU visa bundle",
  price: "€4.99",
  hint: "413×531px at 300 DPI.",
  tool: "passport-photo-maker",
  country: "SCH",
});
if (US_URL) LINKS["us"] = US_URL;
if (UK_URL) LINKS["uk"] = UK_URL;
if (IN_URL) LINKS["in"] = IN_URL;
if (SCH_URL) LINKS["sch"] = SCH_URL;

// Per-tool premium bundles
const PASSPORT_GENERIC_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PASSPORT", {
  name: "Print-ready passport bundle (any country)",
  price: "$4.99",
  hint: "Pick your country at checkout.",
  tool: "passport-photo-maker",
});
const VIDEO_HD_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_VIDEO_HD", {
  name: "HD video preset bundle",
  price: "$2.99",
  hint: "1080p / 4K preset waypoints + email follow-up.",
  tool: "video-compressor",
});
const IMAGE_BATCH_URL = loadLink("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_IMAGE_BATCH", {
  name: "Batch image preset pack",
  price: "$1.99",
  hint: "Save your size + format presets across sessions.",
  tool: "image-compressor",
});
if (PASSPORT_GENERIC_URL) LINKS["passport"] = PASSPORT_GENERIC_URL;
if (VIDEO_HD_URL) LINKS["videoHud"] = VIDEO_HD_URL;
if (IMAGE_BATCH_URL) LINKS["imageBatch"] = IMAGE_BATCH_URL;

export function getPaymentLink(countryCode: string): PaymentLinkEntry | null {
  const key = countryCode.toLowerCase();
  if (LINKS[key]) return LINKS[key];
  // Fall back to the generic passport bundle when set.
  return LINKS["passport"] ?? null;
}

/**
 * Resolve a *tool-level* bundle — for video compressor, image compressor, etc.
 * Falls back to the country-scoped passport when the tool is passport and
 * there's no tool-level bundle configured.
 */
export function getToolBundle(tool: string): PaymentLinkEntry | null {
  switch (tool) {
    case "video-compressor":
      return LINKS["videoHud"] ?? null;
    case "image-compressor":
      return LINKS["imageBatch"] ?? null;
    case "passport-photo-maker":
      return LINKS["passport"] ?? null;
    default:
      return null;
  }
}

export function listPaymentLinks(): PaymentLinkEntry[] {
  return Object.values(LINKS);
}

export function paymentLinkEnabled(): boolean {
  return Object.keys(LINKS).length > 0;
}

/**
 * Convenience getter for analytics: which country did this visitor land on?
 * Returns the slug of any configured link, or null.
 */
export function configuredCountrySlugs(): string[] {
  return Object.keys(LINKS);
}
