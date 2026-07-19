import { getTranslations } from "next-intl/server";
import { Marquee } from "@/components/motionix/visuals/Marquee";
import { MagicBento } from "@/components/motionix/visuals/MagicBento";
import { type Tool } from "@/lib/tools";

export async function ToolFormats({ tool, locale }: { tool: Tool; locale: string }) {
  const t = await getTranslations({ locale, namespace: "ToolPage" });
  return (
    <section className="py-6">
      <p className="eyebrow-mono text-foreground/40 mb-3">{t("supports")}</p>
      <Marquee className="bg-paper/40 border-y border-foreground/5" speed="normal">
        {tool.formats.map((f) => (
          <span
            key={f}
            className="font-display text-3xl text-foreground/60 tracking-tight"
          >
            {f}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

export async function ToolUseCasesBento({ tool, locale }: { tool: Tool; locale: string }) {
  const t = await getTranslations({ locale, namespace: "ToolPage" });
  const toolT = await getTranslations({ locale, namespace: `Tools.${tool.slug}` });
  const tones = ["peach", "mint", "blush", "sky", "paper", "ember"] as const;
  return (
    <section className="py-14">
      <p className="eyebrow-mono text-primary mb-3">{t("useCases")}</p>
      <h2 className="font-serif text-3xl md:text-4xl italic mb-8 leading-tight">
        {t("peopleUseItFor")}
      </h2>
      <MagicBento
        cells={tool.useCases.map((_, i) => ({
          title: toolT(`useCase${i + 1}Title`),
          meta: `0${i + 1}`,
          description: toolT(`useCase${i + 1}Desc`),
          tone: (tones[i % tones.length]) as "peach" | "mint" | "blush" | "sky" | "paper" | "ember",
          icon: <span className="text-foreground/80 text-xl">★</span>,
        }))}
      />
    </section>
  );
}
