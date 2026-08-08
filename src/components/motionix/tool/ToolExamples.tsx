import { getTranslations } from "next-intl/server";

interface ToolExamplesProps {
  examples: { before: string; after: string }[];
  locale: string;
}

export async function ToolExamples({ examples, locale }: ToolExamplesProps) {
  if (!examples || examples.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "ToolPage" });

  return (
    <section className="mt-16">
      <div className="mb-4">
        <p className="eyebrow-mono text-foreground/50 mb-1">{t("examples")}</p>
        <h2 className="font-serif text-2xl italic">{t("seeItInAction")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {examples.map((example, i) => (
          <div
            key={i}
            className="rounded-2xl border border-foreground/10 bg-white/60 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-foreground/40 bg-foreground/5 px-2 py-1 rounded">
                {t("before")}
              </span>
              <span className="text-foreground/30">→</span>
              <span className="text-xs font-mono text-primary bg-primary/5 px-2 py-1 rounded">
                {t("after")}
              </span>
            </div>
            <p className="text-sm text-foreground/70">{example.before}</p>
            <p className="text-sm text-foreground/70 mt-1">{example.after}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
