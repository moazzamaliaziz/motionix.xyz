"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ToolFaq({ items, locale }: { items: { q: string; a: string }[]; locale: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const t = useTranslations("ToolPage");

  return (
    <section className="py-14">
      <p className="eyebrow-mono text-primary mb-3">{t("faq")}</p>
      <h2 className="font-serif text-3xl md:text-4xl italic mb-8 leading-tight">
        {t("frequentlyAsked")}
      </h2>
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
