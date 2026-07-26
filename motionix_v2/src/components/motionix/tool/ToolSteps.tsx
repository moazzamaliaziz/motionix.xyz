import { getTranslations } from "next-intl/server";
import { type Tool } from "@/lib/tools";

export async function ToolSteps({ tool, locale }: { tool: Tool; locale: string }) {
  if (!tool.steps || tool.steps.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "ToolPage" });
  const toolT = await getTranslations({ locale, namespace: `Tools.${tool.slug}` });
  const cols = tool.steps.length >= 4 ? "md:grid-cols-4" : `md:grid-cols-${tool.steps.length}`;
  return (
    <section className="py-14">
      <p className="eyebrow-mono text-primary mb-3">{t("howItWorks")}</p>
      <h2 className="font-serif text-3xl md:text-4xl italic mb-8 leading-tight">
        {t("aboutMinutes", { count: tool.steps.length })}
      </h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-px bg-foreground/5 rounded-3xl overflow-hidden border border-foreground/5`}>
        {tool.steps.map((s, i) => (
          <div key={s.n} className="bg-background p-7 group hover:bg-white transition-colors">
            <div className="flex items-baseline justify-between mb-10">
              <span className="font-mono text-[11px] text-primary">{s.n}</span>
              <span className="size-8 rounded-full border border-foreground/10 grid place-items-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                →
              </span>
            </div>
            <h3 className="font-serif text-xl italic mb-2">{toolT(`step${i + 1}Title`)}</h3>
            <p className="text-sm text-foreground/65 leading-relaxed">{toolT(`step${i + 1}Desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
