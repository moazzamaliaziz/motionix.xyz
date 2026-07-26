"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LuSearch, LuX } from "react-icons/lu";
import type { Tool } from "@/lib/tools";

type CatalogTool = Pick<
  Tool,
  "slug" | "name" | "tagline" | "formats" | "engine" | "glyph" | "tone"
>;

/** Coarse category derived from a tool's engine — used for the filter chips. */
function categoryOf(engine: Tool["engine"]): "image" | "photo-id" | "video" {
  if (engine === "video-wasm") return "video";
  if (engine === "photo-compliance") return "photo-id";
  return "image";
}

const toneClass: Record<CatalogTool["tone"], string> = {
  sky: "bg-sky/60",
  peach: "bg-peach",
  mint: "bg-mint",
  blush: "bg-blush",
  ember: "bg-ember",
  paper: "bg-paper",
};

export function ToolsCatalog({ tools }: { tools: CatalogTool[] }) {
  const t = useTranslations("ToolsCatalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "image" | "photo-id" | "video">("all");

  const categories = [
    { id: "all", label: t("filterAll") },
    { id: "image", label: t("filterImage") },
    { id: "photo-id", label: t("filterPhotoId") },
    { id: "video", label: t("filterVideo") },
  ] as const;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (category !== "all" && categoryOf(tool.engine) !== category) return false;
      if (!q) return true;
      const haystack = `${tool.name} ${tool.tagline} ${tool.formats.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tools, query, category]);

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="relative max-w-md">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-full border border-foreground/15 bg-white/70 pl-11 pr-10 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("clearSearch")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-foreground/10 transition"
            >
              <LuX className="size-4 text-foreground/50" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c.id
                  ? "bg-foreground text-background"
                  : "border border-foreground/15 text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-foreground/60 py-16 text-center">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-white/60 border border-black/5 p-7 hover:bg-white hover:-translate-y-1 transition-all duration-500 hover:shadow-xl hover:shadow-black/5"
            >
              <div
                className={`size-12 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${toneClass[tool.tone]}`}
                aria-hidden
              >
                {tool.glyph}
              </div>
              <h2 className="text-lg font-medium mb-2">{tool.name}</h2>
              <p className="text-sm text-foreground/60 leading-relaxed">{tool.tagline}</p>
              <span className="mt-4 inline-block text-sm text-primary group-hover:underline">
                {t("openTool")} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
