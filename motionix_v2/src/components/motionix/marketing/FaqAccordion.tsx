"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function FaqAccordion({ id = "faq" }: { id?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const t = useTranslations("FAQ");

  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
    { q: t("q7"), a: t("a7") },
    { q: t("q8"), a: t("a8") },
  ];

  return (
    <section id={id} className="py-24 md:py-32 px-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
        <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">
          {t("title")}
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
