"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// progress bar under header — thin, scroll-driven
export function ProgressBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setW(Number.isFinite(scrolled) ? scrolled : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${w}%` }} />
    </div>
  );
}

export function TOC({ items }: { items: { id: string; text: string; level: 2 | 3 }[] }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.1 }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-28 rounded-2xl border border-foreground/5 bg-white/70 backdrop-blur p-5">
      <p className="eyebrow-mono text-foreground/40 mb-3">On this page</p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`block text-sm leading-snug transition-all ${it.level === 3 ? "pl-3" : ""} ${
                active === it.id ? "text-ink font-medium translate-x-1" : "text-foreground/55 hover:text-ink"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-2xl border border-ink/15 overflow-hidden divide-y divide-ink/10">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="bg-white">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-medium text-ink">{it.q}</span>
              <span className={`shrink-0 size-6 rounded-full border border-ink/15 flex items-center justify-center transition ${isOpen ? "bg-ink text-background" : ""}`} aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? <div className="px-5 pb-4 text-sm leading-relaxed text-ink/70">{it.a}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 pt-6 border-t border-foreground/10">
      <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white px-4 h-9 text-sm hover:bg-foreground/5 transition">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white px-4 h-9 text-sm hover:bg-foreground/5 transition"
      >
        Share ↗
      </a>
    </div>
  );
}

export function KeepReading({
  posts,
  locale,
  t,
}: {
  posts: { slug: string; title: string; excerpt: string; category: string; date: string; image: string }[];
  locale: string;
  t: (k: string) => string;
}) {
  if (!posts.length) return null;
  return (
    <section className="mt-12">
      <h3 className="font-display text-2xl tracking-tight text-ink">Keep reading</h3>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/blog/${p.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-foreground/5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
          >
            <div className={`h-2 ${p.category === "passport" ? "bg-peach" : p.category.includes("compress") ? "bg-mint" : p.category.includes("background") ? "bg-blush" : "bg-sky"}`} />
            <div className="p-5 flex flex-col flex-1">
              <p className="eyebrow-mono text-foreground/40">{p.category} · {p.date}</p>
              <h4 className="mt-2 font-display text-[18px] leading-snug group-hover:text-primary transition">{p.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60 line-clamp-2">{p.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-[gap]">
                Read <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link href={`/${locale}/blog`} className="text-sm text-primary hover:underline">
          {t("backToPosts")} →
        </Link>
      </div>
    </section>
  );
}
