import { cn } from "@/lib/cn";
import { BorderBeam } from "./BorderBeam";

type Cell = {
  title: string;
  description: string;
  meta?: string;
  tone?: "sky" | "peach" | "mint" | "blush" | "ember" | "paper";
  icon?: React.ReactNode;
  href?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
};

const toneClass: Record<NonNullable<Cell["tone"]>, string> = {
  sky: "bg-sky/60",
  peach: "bg-peach",
  mint: "bg-mint",
  blush: "bg-blush",
  ember: "bg-ember",
  paper: "bg-paper",
};

export function MagicBento({ cells, className }: { cells: Cell[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[1fr]", className)}>
      {cells.map((c, i) => (
        <div
          key={i}
          className={cn(
            "group relative overflow-hidden rounded-3xl bg-white/60 border border-black/5 p-7 hover:bg-white hover:-translate-y-1 transition-all duration-500 hover:shadow-xl hover:shadow-black/5",
            c.colSpan === 2 && "md:col-span-2",
            c.colSpan === 3 && "md:col-span-3",
            c.rowSpan === 2 && "md:row-span-2",
          )}
        >
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <BorderBeam duration={10} size={48} thickness={1} />
          </div>
          {c.icon ? (
            <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", toneClass[c.tone ?? "mint"])}>
              {c.icon}
            </div>
          ) : null}
          <h3 className="text-lg font-medium mb-2 flex items-baseline gap-2">
            {c.title}
            {c.meta ? <span className="eyebrow-mono text-foreground/40">{c.meta}</span> : null}
          </h3>
          <p className="text-sm text-foreground/60 leading-relaxed">{c.description}</p>
          {c.href ? (
            <a href={c.href} className="mt-4 inline-block text-sm text-primary hover:underline">
              Open →
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}
