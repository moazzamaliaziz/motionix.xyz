import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuroraBackground } from "@/components/motionix/visuals/AuroraBackground";
import { FloatingOrb } from "@/components/motionix/visuals/FloatingOrb";
import { ShinyButton } from "@/components/motionix/visuals/ShinyButton";
import { SparklesText } from "@/components/motionix/visuals/SparklesText";

export async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center pt-32 md:pt-44 pb-20 px-6">
      <AuroraBackground />

      <div className="absolute right-4 md:right-16 top-32 hidden md:block text-foreground">
        <FloatingOrb size={220} />
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/15 bg-white/70 backdrop-blur text-[11px] font-mono uppercase tracking-widest text-foreground/70 mb-6 animate-fade-up">
          <span className="size-1.5 rounded-full bg-primary animate-tone-pulse" />
          {t("badge")}
        </div>

        <h1 className="font-display text-[14vw] md:text-[10vw] leading-[0.88] text-balance animate-fade-up">
          {t("headlineLine1")}
          <br />
          <span className="font-serif-italic font-normal tracking-tight">
            {t("headlineLine2")}
          </span>{" "}
          {t("headlineLine3")}
        </h1>

        <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/60 leading-relaxed animate-fade-up" style={{ animationDelay: "120ms" }}>
          {t("subtitle")}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <ShinyButton href="/tools/background-remover">{t("ctaRemove")}</ShinyButton>
          <ShinyButton href="/tools/passport-photo-maker" variant="ghost">
            <SparklesText>{t("ctaPassport")}</SparklesText>
          </ShinyButton>
        </div>
      </div>
    </section>
  );
}
