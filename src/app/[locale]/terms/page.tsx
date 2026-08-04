import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesFor } from "@/lib/hreflang";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return {
    title: t("title"),
    description: t("section1P1"),
    openGraph: {
      title: t("title"),
      description: t("section1P1"),
      url: "https://motionix.xyz/terms",
      siteName: "Motionix",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("section1P1"),
    },
    alternates: alternatesFor("/terms", locale),
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl md:text-2xl italic mt-8 mb-3">{title}</h2>
      <div className="space-y-3 text-foreground/70">{children}</div>
    </section>
  );
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });

  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
            {t("title")}
          </h1>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <Section title={t("section1Title")}>
          <p>{t("section1P1")}</p>
        </Section>

        <Section title={t("section2Title")}>
          <p>{t("section2P1")}</p>
        </Section>

        <Section title={t("section3Title")}>
          <p>{t("section3P1")}</p>
        </Section>

        <Section title={t("section4Title")}>
          <p>{t("section4P1")}</p>
        </Section>

        <Section title={t("section5Title")}>
          <p>{t("section5P1")}</p>
        </Section>

        <Section title={t("section6Title")}>
          <p>{t("section6P1")}</p>
        </Section>

        <p className="text-xs text-foreground/40 font-mono uppercase tracking-widest mt-12">
          {t("lastUpdated")}
        </p>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
