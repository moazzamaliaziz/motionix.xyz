import { getTranslations } from "next-intl/server";
import { Marquee } from "@/components/motionix/visuals/Marquee";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

export async function TestimonialsMarquee() {
  const t = await getTranslations("Testimonials");

  const testimonials = [
    { q: t("t1Quote"), a: t("t1Author"), r: t("t1Role") },
    { q: t("t2Quote"), a: t("t2Author"), r: t("t2Role") },
    { q: t("t3Quote"), a: t("t3Author"), r: t("t3Role") },
    { q: t("t4Quote"), a: t("t4Author"), r: t("t4Role") },
    { q: t("t5Quote"), a: t("t5Author"), r: t("t5Role") },
  ];

  return (
    <section className="py-24 md:py-32 bg-paper/40 border-y border-foreground/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            {t("title")}
          </h2>
        </RevealOnScroll>
      </div>

      <Marquee className="py-2" speed="normal">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white border border-foreground/5 rounded-3xl p-8 max-w-[420px] shrink-0">
            <div className="text-primary font-serif text-4xl leading-none mb-3">&ldquo;</div>
            <p className="font-serif italic text-lg leading-snug mb-6">{t.q}</p>
            <div className="text-xs">
              <div className="font-medium">{t.a}</div>
              <div className="text-foreground/50 font-mono uppercase tracking-widest text-[10px] mt-1">{t.r}</div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
