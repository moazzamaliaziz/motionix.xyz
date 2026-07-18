"use client";

import { useState, useRef, useEffect } from "react";

const items = [
  {
    q: "Do I need an account?",
    a: "No. Drop your file, get the result. We don't ask for an email. No signup wall greets you after your first task.",
  },
  {
    q: "Does my file get uploaded?",
    a: "For the tools that can run in your browser — background removal, image compression, format conversion — your file stays on your device. Nothing on our servers. For tools that genuinely need a server (we have very few right now), we tell you that before you upload.",
  },
  {
    q: "Are these tools accurate for passport photos?",
    a: "Our passport tool supports the four highest-volume country specs (US, UK, India, Schengen). We always recommend printing a low-stakes test before mailing the final photo. We don't replace the studio — we replace the photo-booth trip and the $15 fee.",
  },
  {
    q: "Is the passport tool really free?",
    a: "Yes, in Phase 1. We may add a small payment option later for the print-ready high-resolution download (we charge under $5), but free preview is permanent.",
  },
  {
    q: "What about my privacy?",
    a: "Read the privacy page for the legal copy. The short version: we don't store media, we don't sell data, we don't show ads in tools, we don't track which image you uploaded. We track which tool you used and whether it completed successfully — that's how we know what's working.",
  },
  {
    q: "Why is there no signup but tons of free stuff?",
    a: "Because ad-soup free sites are tiring. We let the tool talk for itself and we run on small ads in the log pages and tool explanations — not over your work.",
  },
  {
    q: "Can I use my favourite browser?",
    a: "Chrome, Edge, Safari 16.4+, and Firefox 111+ all work. Safari on iOS works for everything except the video compressor (which we're rolling out in Phase 2).",
  },
  {
    q: "Who builds this thing?",
    a: "A solo operator (me). Send nice notes via the contact page; I'll read them. Report a bug the same way.",
  },
];

export function FaqAccordion({ id = "faq" }: { id?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id={id} className="py-24 md:py-32 px-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="eyebrow-mono text-primary mb-3">FAQ</p>
        <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
          What people ask.
        </h2>
      </div>
      <ul className="divide-y divide-foreground/5 border-t border-b border-foreground/5">
        {items.map((it, i) => {
          const expanded = open === i;
          return (
            <li key={i} className="py-5">
              <button
                className="w-full flex items-center justify-between gap-6 text-left"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
              >
                <span className="font-medium text-base">{it.q}</span>
                <span
                  className={`size-7 rounded-full border border-foreground/20 grid place-items-center transition-transform ${
                    expanded ? "rotate-45 bg-foreground text-background" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              >
                <p className="overflow-hidden text-foreground/70 leading-relaxed max-w-2xl pt-3 text-[15px]">
                  {it.a}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
