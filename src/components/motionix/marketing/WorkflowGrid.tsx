import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

const workflow = [
  {
    n: "01",
    t: "Drop your file",
    d: "Drop it in. We support JPG, PNG, WebP, HEIC, AVIF — whatever your phone gave you.",
  },
  {
    n: "02",
    t: "Pick what to do",
    d: "Resize, compress, swap a background, prep a passport photo. One click.",
  },
  {
    n: "03",
    t: "We do it in your browser",
    d: "For things that don't need a server, your file stays on your device. The download link is instant.",
  },
  {
    n: "04",
    t: "Ship it",
    d: "Drop into the form, save in the right size, attach to the email. No watermark. No login wall.",
  },
];

export function WorkflowGrid({ id = "how" }: { id?: string }) {
  return (
    <section id={id} className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">The Process</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight max-w-2xl">
            Four steps. <span className="not-italic">No mystery.</span>
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
