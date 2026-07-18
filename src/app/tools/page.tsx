import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { MagicBento } from "@/components/motionix/visuals/MagicBento";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";
import { AuroraBackground } from "@/components/motionix/visuals/AuroraBackground";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";

export const metadata: Metadata = {
  metadataBase: new URL(TOOLS_SITE_URL),
  title: "All Motionix tools — image and video utilities, free forever",
  description:
    "The Motionix catalog. Background remover, passport photo maker, image compressor, photo resizer, signature maker, and more. Free, no signup, runs in your browser.",
  alternates: { canonical: "/tools" },
  openGraph: {
    type: "website",
    title: "All Motionix tools",
    description: "Free image and video utilities. No signup.",
    url: "/tools",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
  },
};

export default function ToolsIndexPage() {
  const tones = ["peach", "mint", "blush", "sky", "paper", "ember"] as const;

  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={null}><SiteHeader /></Suspense>
      <main className="flex-1 relative overflow-hidden">
        <section className="relative px-6 pt-40 md:pt-48 pb-16 md:pb-24">
          <AuroraBackground />
          <div className="relative max-w-7xl mx-auto">
            <p className="eyebrow-mono text-primary mb-3">Catalog</p>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tight">
              The Motionix <span className="font-serif-italic">toolbox</span>
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/60 leading-relaxed">
              Each tool respects your privacy. Whichever you open, your file stays in your browser
              unless the tool explicitly tells you otherwise.
            </p>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <h2 className="font-serif text-3xl md:text-4xl italic mb-8 leading-tight">
                The eight tools we keep using.
              </h2>
            </RevealOnScroll>

            <MagicBento
              cells={tools.map((t, i) => ({
                title: t.name,
                meta: t.phase === "functional" ? `0${i + 1} · live` : `0${i + 1} · soon`,
                description: t.tagline,
                tone: (tones[i % tones.length]) as "peach" | "mint" | "blush" | "sky" | "paper" | "ember",
                icon: <span aria-hidden className="text-foreground/80 text-2xl">{t.glyph}</span>,
                href: `/tools/${t.slug}`,
                colSpan: i === 0 ? 2 : 1,
              }))}
            />
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
