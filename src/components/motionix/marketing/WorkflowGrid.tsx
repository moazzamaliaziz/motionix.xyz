import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

export async function WorkflowGrid({ id = "how" }: { id?: string }) {
  const t = await getTranslations("Workflow");

  const workflow = [
    { n: "01", t: t("step1Title"), d: t("step1Desc") },
    { n: "02", t: t("step2Title"), d: t("step2Desc") },
    { n: "03", t: t("step3Title"), d: t("step3Desc") },
    { n: "04", t: t("step4Title"), d: t("step4Desc") },
  ];

  return (
    <section id={id} className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight max-w-2xl">
            {t("title")}
          </h2>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/5 rounded-3xl overflow-hidden border border-foreground/5">
          {workflow.map((w, i) => (
            <RevealOnScroll key={w.n} delay={i * 80} className="bg-background p-8 group hover:bg-white transition-colors">
              <div className="flex items-baseline justify-between mb-12">
                <span className="font-mono text-[11px] text-primary">{w.n}</span>
                <span className="size-8 rounded-full border border-foreground/10 grid place-items-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                  →
                </span>
              </div>
              <h3 className="font-serif text-2xl italic mb-2">{w.t}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{w.d}</p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
