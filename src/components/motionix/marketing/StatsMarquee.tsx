import { NumberTicker } from "@/components/motionix/visuals/NumberTicker";
import { Marquee } from "@/components/motionix/visuals/Marquee";

const stats = [
  { value: 7, label: "free tools" },
  { value: 0, label: "accounts needed" },
  { value: 1500, label: "ms median completion" },
  { value: 5, label: "minutes to long-form task" },
];

const formatsMarquee = [
  "PNG", "JPEG", "WebP", "HEIC", "AVIF", "TIFF", "BMP", "GIF",
];

export function StatsMarquee() {
  return (
    <section className="border-y border-black/5 bg-paper/40">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-y-8">
        {stats.map((s, i) => (
          <div key={s.label} className="text-center" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="font-serif text-5xl md:text-6xl italic tracking-tight">
              {s.value === 0 ? (
                <span>0</span>
              ) : (
                <NumberTicker value={s.value} duration={1.2} />
              )}
            </div>
            <div className="mt-2 text-[11px] font-mono uppercase tracking-widest text-foreground/50">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/5 bg-paper/60">
        <Marquee className="py-6 text-foreground/60" speed="normal">
          {formatsMarquee.map((f) => (
            <div key={f} className="flex items-center gap-6">
              <span className="eyebrow-mono text-foreground/40">supports</span>
              <span className="font-display text-2xl text-foreground/70">{f}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
