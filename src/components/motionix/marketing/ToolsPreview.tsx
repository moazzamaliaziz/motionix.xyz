import Link from "next/link";
import { MagicBento } from "@/components/motionix/visuals/MagicBento";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";
import { tools, bySlug } from "@/lib/tools";
import {
  LuImage as LuImageOrig,
  LuSparkles,
} from "react-icons/lu";

const toneStyles = {
  sky: "bg-sky",
  peach: "bg-peach",
  mint: "bg-mint",
  blush: "bg-blush",
  ember: "bg-ember",
  paper: "bg-paper",
} as const;

export function ToolsPreview() {
  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto" id="tools">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">The catalog</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            The ones we keep using.
          </h2>
          <p className="mt-4 text-foreground/60">
            Seven tools right now. The two with real work to do are flagged as functional.
            The rest are stubs we&apos;re filling out — they don&apos;t break the page; we just
            refuse to ship empty promises.
          </p>
        </RevealOnScroll>
      </div>

      <MagicBento
        cells={tools.map((t, i) => ({
          title: t.name,
          meta: t.phase === "functional" ? `${String(i + 1).padStart(2, "0")} · functional` : `${String(i + 1).padStart(2, "0")} · stub`,
          description: t.tagline,
          tone: (["peach", "mint", "blush", "sky", "paper", "ember", "peach"] as const)[i % 7] ?? "paper",
          icon: <span className="text-foreground/80 text-2xl">★</span>,
          href: `/tools/${t.slug}`,
          colSpan: i === 0 ? 2 : 1,
        }))}
      />

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-sm text-primary hover:underline">
          See the full list →
        </Link>
      </div>
    </section>
  );
}
