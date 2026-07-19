import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SpotlightCard } from "@/components/motionix/visuals/SpotlightCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("title"),
    description: t("p1"),
    openGraph: {
      title: t("title"),
      description: t("p1"),
      url: "https://motionix.xyz/about",
      siteName: "Motionix",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("p1"),
    },
    alternates: { canonical: "https://motionix.xyz/about" },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        {t("title")}
      </h1>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SpotlightCard tone="paper">
          <p className="eyebrow-mono text-foreground/50">{t("willHeading")}</p>
          <ul className="text-sm mt-3 space-y-1.5">
            <li>• {t("will1")}</li>
            <li>• {t("will2")}</li>
            <li>• {t("will3")}</li>
            <li>• {t("will4")}</li>
          </ul>
        </SpotlightCard>
        <SpotlightCard tone="mint">
          <p className="eyebrow-mono text-foreground/50">{t("wontHeading")}</p>
          <ul className="text-sm mt-3 space-y-1.5">
            <li>• {t("wont1")}</li>
            <li>• {t("wont2")}</li>
            <li>• {t("wont3")}</li>
            <li>• {t("wont4")}</li>
          </ul>
        </SpotlightCard>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">{t("ctaTool")}</Link>
        <Link href="/privacy" className="text-foreground/70 underline-offset-4 hover:underline">{t("ctaPrivacy")}</Link>
        <Link href="/contact" className="text-foreground/70 underline-offset-4 hover:underline">{t("ctaContact")}</Link>
      </div>
    </div>
  );
}
