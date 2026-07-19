import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { tools, bySlug } from "@/lib/tools";
import { toolJsonLd } from "@/lib/schema";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { HistoryHost } from "@/components/motionix/tool/HistoryHost";
import { ToolSteps } from "@/components/motionix/tool/ToolSteps";
import { ToolFaq } from "@/components/motionix/tool/ToolFaq";
import { ToolFormats, ToolUseCasesBento } from "@/components/motionix/tool/ToolUseCasesBento";
import { ToolChain } from "@/components/motionix/tool/ToolChain";
import { ToolFeedback } from "@/components/motionix/tool/ToolFeedback";
import { ToolBody } from "@/components/motionix/tool/ToolBody";

export async function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const tool = bySlug(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: `Tools.${slug}` });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/tools/${tool.slug}`,
      siteName: "Motionix",
      type: "website",
      images: [{ url: `/og/tools/${tool.ogImage}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [`/og/tools/${tool.ogImage}`],
    },
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const tool = bySlug(slug);
  if (!tool) notFound();

  const t = await getTranslations({ locale, namespace: "ToolPage" });
  const toolT = await getTranslations({ locale, namespace: `Tools.${slug}` });

  const ld = toolJsonLd(tool);

  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <SiteHeader />

      <main id="main-content" className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 md:mb-14">
            <p className="eyebrow-mono text-foreground/50 mb-3">
              Motionix · {t("breadcrumbTools")} · {tool.phase === "functional" ? t("statusFunctional") : t("statusComingUp")}
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
              {toolT("name")}
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/60 leading-relaxed">
              {toolT("description")}
            </p>
          </header>

          <Suspense fallback={null}>
            <ToolBody tool={tool} />
          </Suspense>

          <HistoryHost />

          {tool.stubHint ? (
            <p className="mt-6 text-sm text-foreground/60 max-w-2xl">
              {t("comingUpPhase2")} {tool.stubHint}
            </p>
          ) : null}

          <ToolSteps tool={tool} locale={locale} />
          <ToolUseCasesBento tool={tool} locale={locale} />
          <ToolFormats tool={tool} locale={locale} />
          <ToolFaq items={tool.faqs} locale={locale} />

          <ToolFeedback toolSlug={tool.slug} />
          <ToolChain fromSlug={tool.slug} locale={locale} />
        </div>
      </main>

      <SiteFooter />

      {ld.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </div>
  );
}
