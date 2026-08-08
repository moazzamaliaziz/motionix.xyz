import { getTranslations } from "next-intl/server";

interface ToolLimitationsProps {
  limitations: string[];
  locale: string;
}

export async function ToolLimitations({ limitations, locale }: ToolLimitationsProps) {
  if (!limitations || limitations.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "ToolPage" });

  return (
    <section className="mt-16">
      <div className="mb-4">
        <p className="eyebrow-mono text-foreground/50 mb-1">{t("limitations")}</p>
        <h2 className="font-serif text-2xl italic">{t("beforeYouStart")}</h2>
      </div>
      <ul className="space-y-2">
        {limitations.map((limitation, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
            <span className="text-foreground/30 mt-0.5">•</span>
            <span>{limitation}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
