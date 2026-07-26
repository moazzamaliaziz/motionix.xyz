import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MagicBento } from "@/components/motionix/visuals/MagicBento";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";
import { tools } from "@/lib/tools";

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

      <MagicBento
        cells={tools.map((t, i) => ({
          title: t.name,
          meta: `${String(i + 1).padStart(2, "0")} · live`,
          description: t.tagline,
          tone: (["peach", "mint", "blush", "sky", "paper", "ember", "peach"] as const)[i % 7] ?? "paper",
          icon: <span className="text-foreground/80 text-2xl">★</span>,
          href: `/tools/${t.slug}`,
          colSpan: i === 0 ? 2 : 1,
        }))}
      />

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-sm text-primary hover:underline">
          {t("seeFullList")}
        </Link>
      </div>
    </section>
  );
}
