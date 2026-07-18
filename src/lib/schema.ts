import type { Tool, ToolFaq } from "./tools";

/**
 * Build JSON-LD for a tool page: SoftwareApplication + FAQPage.
 * Dumped into <head> via `<ToolSchema tool={t} />`.
 */
export function toolJsonLd(tool: Tool) {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.metaDescription,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: tool.engine === "image-onnx"
      ? "PhotoEditing"
      : tool.engine === "photo-compliance"
      ? "Photography"
      : "ImageUtility",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `/tools/${tool.slug}`,
    image: `/og/tools/${tool.ogImage}`,
    featureList: tool.formats.join(", "),
    softwareVersion: "1.0",
    aggregateRating: undefined as unknown,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f: ToolFaq) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return [appLd, faqLd];
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Motionix",
    url: siteUrl,
    logo: `${siteUrl}/og/og-default.png`,
    sameAs: [
      "https://twitter.com/motionix",
    ],
    contactPoint: [{
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@motionix.xyz",
      availableLanguage: ["English"],
    }],
  };
}
