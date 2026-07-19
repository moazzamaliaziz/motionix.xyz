import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

function cardClass(featured: boolean, tone: string) {
  const base = "relative h-full p-8 rounded-3xl border transition-all hover:-translate-y-1";
  if (featured) return `${base} ${tone} border-foreground shadow-2xl shadow-foreground/20`;
  return `${base} bg-paper/80 border-foreground/10 hover:shadow-lg`;
}

function periodClass(featured: boolean) {
  return featured ? "text-background/60" : "text-foreground/50";
}

function ctaClass(featured: boolean) {
  const base = "block w-full text-center px-5 py-3 rounded-full text-sm font-medium transition-colors";
  if (featured) return `${base} bg-primary text-primary-foreground hover:bg-primary/90`;
  return `${base} bg-foreground text-background hover:bg-foreground/90`;
}

function liClass(featured: boolean) {
  return featured ? "text-background/80" : "text-foreground/70";
}

export async function PricingCards() {
  const t = await getTranslations("Pricing");

  const tiers = [
    {
      name: t("tier1Name"),
      price: t("tier1Price"),
      period: t("tier1Period"),
      perks: [t("tier1Perk1"), t("tier1Perk2"), t("tier1Perk3"), t("tier1Perk4")],
      cta: t("tier1Cta"),
      href: "/tools",
      featured: false,
      tone: "bg-paper",
    },
    {
      name: t("tier2Name"),
      price: t("tier2Price"),
      period: t("tier2Period"),
      perks: [t("tier2Perk1"), t("tier2Perk2"), t("tier2Perk3"), t("tier2Perk4")],
      cta: t("tier2Cta"),
      href: "/about",
      featured: true,
      tone: "bg-foreground text-background",
    },
    {
      name: t("tier3Name"),
      price: t("tier3Price"),
      period: t("tier3Period"),
      perks: [t("tier3Perk1"), t("tier3Perk2"), t("tier3Perk3"), t("tier3Perk4")],
      cta: t("tier3Cta"),
      href: "/contact",
      featured: false,
      tone: "bg-mint",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            {t("title")}
          </h2>
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier, i) => (
          <RevealOnScroll key={tier.name} delay={i * 80}>
            <div className={cardClass(tier.featured, tier.tone)}>
              {tier.featured ? (
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full mb-4">
                  {t("mostChosen")}
                </span>
              ) : null}
              <h3 className="font-serif text-2xl italic">{tier.name}</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-serif text-5xl">{tier.price}</span>
                <span className={`text-xs ${periodClass(tier.featured)}`}>{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span className={liClass(tier.featured)}>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={tier.href!} className={ctaClass(tier.featured)}>
                  {tier.cta}
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
