import Link from "next/link";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    perks: [
      "Every tool in the catalog",
      "No watermarks",
      "No account required",
      "Files stay in your browser",
    ],
    cta: "Use a tool now",
    href: "/tools",
    featured: false,
    tone: "bg-paper",
  },
  {
    name: "Freee to use with friend",
    price: "$0",
    period: "— tell one friend",
    perks: [
      "Everything in Free",
      "Bring a friend who has a passport photo to make",
      "First to know when site-wide apps launch",
      "Optional signup keeps history",
    ],
    cta: "Share motionix",
    href: "/about",
    featured: true,
    tone: "bg-foreground text-background",
  },
  {
    name: "For studios",
    price: "Open",
    period: "for teams",
    perks: [
      "Bulk processing",
      "Same engine, less waiting around",
      "White-glove privacy review",
      "Per-team billing on request",
    ],
    cta: "Email us",
    href: "/contact",
    featured: false,
    tone: "bg-mint",
  },
];

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

export function PricingCards() {
  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">Pricing</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            Free, simple. <span className="not-italic">Forever.</span>
          </h2>
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((t, i) => (
          <RevealOnScroll key={t.name} delay={i * 80}>
            <div className={cardClass(t.featured, t.tone)}>
              {t.featured ? (
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full mb-4">
                  Most-chosen
                </span>
              ) : null}
              <h3 className="font-serif text-2xl italic">{t.name}</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-serif text-5xl">{t.price}</span>
                <span className={`text-xs ${periodClass(t.featured)}`}>{t.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span className={liClass(t.featured)}>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={t.href!} className={ctaClass(t.featured)}>
                  {t.cta}
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
