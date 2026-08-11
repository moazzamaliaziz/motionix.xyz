import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { Hero } from "@/components/motionix/marketing/Hero";
import { StatsMarquee } from "@/components/motionix/marketing/StatsMarquee";
import { WorkflowGrid } from "@/components/motionix/marketing/WorkflowGrid";
import { ToolsPreview } from "@/components/motionix/marketing/ToolsPreview";
import { TestimonialsMarquee } from "@/components/motionix/marketing/TestimonialsMarquee";
import { PricingCards } from "@/components/motionix/marketing/PricingCards";
import { FaqAccordion } from "@/components/motionix/marketing/FaqAccordion";
import { StickyCta } from "@/components/motionix/marketing/StickyCta";
import { organizationJsonLd, websiteJsonLd } from "@/lib/schema";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { getPageSEO } from "@/lib/seo-config";
import { alternatesFor, localizedUrl } from "@/lib/hreflang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getPageSEO(locale, "/");
  const alternates = await alternatesFor("/", locale);

  return {
    metadataBase: new URL(TOOLS_SITE_URL),
    title: seo.title,
    description: seo.description,
    alternates,
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: localizedUrl(locale, "/"),
      siteName: "Motionix",
      images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/og/og-default.png"],
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
    },
  };
}

export default function HomePage() {
  const orgLd = organizationJsonLd(TOOLS_SITE_URL);
  const siteLd = websiteJsonLd(TOOLS_SITE_URL);

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main id="main-content" className="flex-1">
        <Hero />
        <StatsMarquee />
        <WorkflowGrid />
        <ToolsPreview />
        <TestimonialsMarquee />
        <PricingCards />
        <FaqAccordion />
      </main>
      <SiteFooter />
      <StickyCta />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
    </>
  );
}