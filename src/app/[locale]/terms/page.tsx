import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
    alternates: { canonical: "https://motionix.xyz/terms" },
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
    <div className="max-w-3xl mx-auto px-6 py-32">
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
    </div>
  );
}
