import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tools } from "@/lib/tools";
import { alternatesFor } from "@/lib/hreflang";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { ToolsCatalog } from "@/components/motionix/tool/ToolsCatalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ToolsCatalog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/tools",
      siteName: "Motionix",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    alternates: alternatesFor("/tools", locale),
  };
}

export default async function ToolsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ToolsCatalog" });

  // Pass only the fields the client catalog needs — keeps the payload small.
  const catalogTools = tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    formats: tool.formats,
    engine: tool.engine,
    glyph: tool.glyph,
    tone: tool.tone,
  }));

  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <SiteHeader />

      <main id="main-content" className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 md:mb-14">
            <p className="eyebrow-mono text-foreground/50 mb-3">
              Motionix · {t("breadcrumb")}
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/60 leading-relaxed">
              {t("subtitle")}
            </p>
          </header>

          <ToolsCatalog tools={catalogTools} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
