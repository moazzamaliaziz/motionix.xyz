import Link from "next/link";
import { bySlug } from "@/lib/tools";
import { cn } from "@/lib/cn";

/**
 * Cross-tool "try another" CTA at the bottom of a tool page.
 * Suggests the next 2–3 related slugs.
 */
export function ToolChain({ fromSlug }: { fromSlug: string }) {
  const tool = bySlug(fromSlug);
  if (!tool) return null;
  const nextSlugs = tool.next?.slice(0, 3) ?? [];
  if (nextSlugs.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="mb-4">
        <p className="eyebrow-mono text-foreground/50 mb-1">Try another</p>
        <h2 className="font-serif text-2xl italic">While you&apos;re here</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {nextSlugs.map((s) => {
          const t = bySlug(s);
          if (!t) return null;
          return (
            <Link
              key={s}
              href={`/tools/${s}`}
              className={cn(
                "group p-5 rounded-2xl border border-foreground/10 bg-white/60 hover:bg-white transition-all hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <p className="eyebrow-mono text-foreground/40 mb-2">0{nextSlugs.indexOf(s) + 1}</p>
              <p className="font-medium leading-snug">{t.name}</p>
              <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{t.tagline}</p>
              <p className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Open →</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
