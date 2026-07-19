import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SpotlightCard } from "@/components/motionix/visuals/SpotlightCard";
import { ContactForm } from "@/components/motionix/marketing/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "https://motionix.xyz/contact",
      siteName: "Motionix",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
    alternates: { canonical: "https://motionix.xyz/contact" },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
        {t("subtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-12">
        <SpotlightCard tone="paper">
          <p className="eyebrow-mono text-foreground/50">{t("emailHeading")}</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href={`mailto:${t("emailAddress")}`}>{t("emailAddress")}</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">{t("emailDesc")}</p>
        </SpotlightCard>
        <SpotlightCard tone="peach">
          <p className="eyebrow-mono text-foreground/50">{t("bugsHeading")}</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href={`mailto:${t("bugsAddress")}`}>{t("bugsAddress")}</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">{t("bugsDesc")}</p>
        </SpotlightCard>
        <SpotlightCard tone="mint">
          <p className="eyebrow-mono text-foreground/50">{t("pressHeading")}</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href={`mailto:${t("pressAddress")}`}>{t("pressAddress")}</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">{t("pressDesc")}</p>
        </SpotlightCard>
        <SpotlightCard tone="blush">
          <p className="eyebrow-mono text-foreground/50">{t("dataHeading")}</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href={`mailto:${t("dataAddress")}`}>{t("dataAddress")}</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">{t("dataDesc")}</p>
        </SpotlightCard>
      </div>

      <div className="mt-12 prose prose-neutral text-[15px] text-foreground/70 leading-relaxed">
        <p>{t("disclaimer")}</p>
      </div>

      <ContactForm />
    </div>
  );
}
