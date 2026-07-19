import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
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
import { organizationJsonLd } from "@/lib/schema";
import { TOOLS_SITE_URL } from "@/lib/cn";

export const metadata: Metadata = {
  metadataBase: new URL(TOOLS_SITE_URL),
  title: "Motionix — image and video tools that finish the job in your browser",
  description:
    "Free background remover, passport photo maker, image compressor, and more. No signup, no upload, no watermark. Your files stay in your browser.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Motionix — image and video tools that finish the job in your browser",
    description:
      "Free background remover, passport photo maker, image compressor, and more. No signup, no upload, no watermark.",
    url: "/",
    siteName: "Motionix",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motionix — image and video tools that finish the job in your browser",
    description: "Free background remover + passport photo maker + more. No signup.",
    images: ["/og/og-default.png"],
  },
};

export default function HomePage() {
  const ld = organizationJsonLd(TOOLS_SITE_URL);
  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={null}><SiteHeader /></Suspense>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </>
  );
}
