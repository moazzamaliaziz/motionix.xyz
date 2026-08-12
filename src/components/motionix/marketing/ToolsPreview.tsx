import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";
import { cn } from "@/lib/cn";

const FEATURED = [
  {
    slug: "passport-photo-maker",
    bg: "bg-[#faf5ee]",
    border: "border-[#e8dcc8]/60",
    img: "/tools/passport-illustration.png",
    imgAlt: "Passport photo with properly framed headshot and compliance guidelines",
  },
  {
    slug: "resume-photo-maker",
    bg: "bg-[#eef6f1]",
    border: "border-[#c8ddd0]/60",
    img: "/tools/resume-illustration.png",
    imgAlt: "Professional resume layout with headshot portrait",
  },
  {
    slug: "image-compressor",
    bg: "bg-[#faefee]",
    border: "border-[#e0cbc8]/60",
    img: "/tools/compress-illustration.png",
    imgAlt: "Before and after image compression comparison showing file size reduction",
  },
  {
    slug: "photo-resizer",
    bg: "bg-[#edf3f8]",
    border: "border-[#c2d4e2]/60",
    img: "/tools/resize-illustration.png",
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
        {FEATURED.map((card, i) => (
          <RevealOnScroll key={card.slug} delay={i * 80}>
            <Link
              href={`/tools/${card.slug}`}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                card.bg,
                card.border,
              )}
            >
              <div className="relative flex-1 flex items-center justify-center p-5 md:p-7 min-h-[240px] md:min-h-[280px]">
                <div className="relative w-full h-full transition-transform duration-300 ease-out group-hover:-translate-y-[5px] group-hover:scale-[1.015]">
                  <Image
                    src={card.img}
                    alt={card.imgAlt}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    priority={i < 2}
                  />
                </div>
              </div>

              <div className="px-6 pb-5 md:px-8 md:pb-6">
                <p className="font-serif italic text-lg text-foreground/80">
                  {t(`tools.${SLUG_TO_I18N[card.slug]}`)}
                </p>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-sm text-primary hover:underline">
          {t("seeFullList")}
        </Link>
      </div>
    </section>
  );
}
