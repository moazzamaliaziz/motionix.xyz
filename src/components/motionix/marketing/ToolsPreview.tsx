import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";
import { cn } from "@/lib/cn";

const FEATURED = [
  {
    slug: "passport-photo-maker",
    index: "01",
    bg: "bg-[#faf5ee]",
    img: "/img/tools/tool-passport.jpg",
    imgAlt: "Passport photo with properly framed headshot and compliance guidelines",
  },
  {
    slug: "resume-photo-maker",
    index: "02",
    bg: "bg-[#eef6f1]",
    img: "/img/tools/tool-resume.jpg",
    imgAlt: "Professional resume layout with headshot portrait",
  },
  {
    slug: "image-compressor",
    index: "03",
    bg: "bg-[#faefee]",
    img: "/img/tools/tool-compress.jpg",
    imgAlt: "Before and after image compression comparison showing file size reduction",
  },
  {
    slug: "photo-resizer",
    index: "04",
    bg: "bg-[#edf3f8]",
    img: "/img/tools/tool-resize.jpg",
    imgAlt: "Image resizing interface with dimension controls and aspect ratio lock",
  },
] as const;

const SLUG_TO_I18N: Record<string, string> = {
  "passport-photo-maker": "passport",
  "resume-photo-maker": "resume",
  "image-compressor": "compress",
  "photo-resizer": "resize",
};

export async function ToolsPreview() {
  const t = await getTranslations("ToolsPreview");

  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto" id="tools">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-foreground/60">
            {t("subtitle")}
          </p>
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURED.map((card, i) => {
          const key = SLUG_TO_I18N[card.slug];
          return (
            <RevealOnScroll key={card.slug} delay={i * 80}>
              <Link
                href={`/tools/${card.slug}`}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 ease-out",
                  "shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  card.bg,
                )}
              >
                {/* Image area — 4:3 */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                    <Image
                      src={card.img}
                      alt={card.imgAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                      loading={i < 2 ? "eager" : "lazy"}
                      priority={i < 2}
                    />
                  </div>

                  {/* Index badge */}
                  <span className="absolute top-4 left-4 font-mono text-xs tracking-wider text-foreground/50 bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                    {card.index} / {t(`tools.${key}`)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 px-5 pb-5 pt-4 md:px-6 md:pb-6">
                  <h3 className="font-serif text-xl font-semibold leading-snug">
                    {t(`tools.${key}`)}
                  </h3>

                  <p className="mt-1.5 text-sm text-foreground/55 leading-relaxed">
                    {t(`tools.${key}Blurb`)}
                  </p>

                  {/* Feature list */}
                  <ul className="mt-3 space-y-1.5 flex-1">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex items-start gap-2 text-sm text-foreground/70">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{t(`tools.${key}F${n}`)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-[gap] duration-300">
                    {t("tryIt")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-sm text-primary hover:underline">
          {t("seeFullList")}
        </Link>
      </div>
    </section>
  );
}
