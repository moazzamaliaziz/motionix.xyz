import { Marquee } from "@/components/motionix/visuals/Marquee";
import { RevealOnScroll } from "@/components/motionix/visuals/RevealOnScroll";

const testimonials = [
  {
    q: "I made my kid's passport photo in 4 minutes on my couch. Used it at the consulate next morning. Stamp.",
    a: "Parent of two",
    r: "London, UK",
  },
  {
    q: "Background remover for product shots used to mean another SaaS login. This is in my browser.",
    a: "Maya R.",
    r: "Etsy seller",
  },
  {
    q: "Got a 12 MB photo down to 380 KB. Email form had a 4 MB cap and we were racing a deadline.",
    a: "Devon",
    r: "Designer",
  },
  {
    q: "The fact that it just runs in the browser is the feature. I don't want to upload every photo to someone's server.",
    a: "Sara K.",
    r: "Photographer",
  },
  {
    q: "Used the resume photo tool. Got a clean white background without paying $20/mo.",
    a: "Aiden P.",
    r: "Job seeker",
  },
];

export function TestimonialsMarquee() {
  return (
    <section className="py-24 md:py-32 bg-paper/40 border-y border-foreground/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <RevealOnScroll>
          <p className="eyebrow-mono text-primary mb-3">From the field</p>
          <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
            Notes from real humans.
          </h2>
        </RevealOnScroll>
      </div>

      <Marquee className="py-2" speed="normal">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white border border-foreground/5 rounded-3xl p-8 max-w-[420px] shrink-0">
            <div className="text-primary font-serif text-4xl leading-none mb-3">&ldquo;</div>
            <p className="font-serif italic text-lg leading-snug mb-6">{t.q}</p>
            <div className="text-xs">
              <div className="font-medium">{t.a}</div>
              <div className="text-foreground/50 font-mono uppercase tracking-widest text-[10px] mt-1">{t.r}</div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
