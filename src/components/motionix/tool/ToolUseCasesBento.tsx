import { Marquee } from "@/components/motionix/visuals/Marquee";
import { MagicBento } from "@/components/motionix/visuals/MagicBento";
import { type Tool } from "@/lib/tools";

export function ToolFormats({ tool }: { tool: Tool }) {
  return (
    <section className="py-6">
      <p className="eyebrow-mono text-foreground/40 mb-3">Supports</p>
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

export function ToolUseCasesBento({ tool }: { tool: Tool }) {
  const tones = ["peach", "mint", "blush", "sky", "paper", "ember"] as const;
  return (
    <section className="py-14">
      <p className="eyebrow-mono text-primary mb-3">Use cases</p>
      <h2 className="font-serif text-3xl md:text-4xl italic mb-8 leading-tight">
        People use it for…
      </h2>
      <MagicBento
        cells={tool.useCases.map((u, i) => ({
          title: u.title,
          meta: `0${i + 1}`,
          description: u.description,
          tone: (tones[i % tones.length]) as "peach" | "mint" | "blush" | "sky" | "paper" | "ember",
          icon: <span className="text-foreground/80 text-xl">★</span>,
        }))}
      />
    </section>
  );
}
