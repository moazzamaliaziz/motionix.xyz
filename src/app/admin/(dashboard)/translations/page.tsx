import { createAdminClient } from "@/lib/supabase";

export default async function TranslationsManagerPage() {
  const supabase = createAdminClient();
  const { data: completeness, error } = await supabase.from("translation_completeness").select("*").order("locale");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Translations</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const localeMap = new Map<string, typeof completeness>();
  completeness?.forEach((item) => {
    if (!localeMap.has(item.locale)) localeMap.set(item.locale, []);
    localeMap.get(item.locale)?.push(item);
  });

  const locales = Array.from(localeMap.entries()).map(([locale, pages]) => {
    const total = pages.length;
    const indexable = pages.filter((p) => p.indexable).length;
    const seoComplete = pages.filter((p) => p.seo_complete).length;
    return { locale, total, indexable, seoComplete, pct: total > 0 ? Math.round((indexable / total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Translations</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Locale completeness across all pages.</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Sync
        </button>
      </div>

      {locales.length === 0 ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>🌐</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No translation data</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locales.map((loc) => {
            const barColor = loc.pct === 100 ? "var(--a-success)" : loc.pct >= 80 ? "var(--a-warning)" : "var(--a-error)";
            const textColor = loc.pct === 100 ? "var(--a-success)" : loc.pct >= 80 ? "var(--a-warning)" : "var(--a-error)";
            return (
              <div key={loc.locale} className="a-card-interactive p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold uppercase tracking-tight" style={{ color: "var(--a-text-1)" }}>{loc.locale}</h3>
                  <span className="text-[12px] font-semibold" style={{ color: textColor }}>{loc.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "var(--a-bg-elevated)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${loc.pct}%`, background: barColor }} />
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span style={{ color: "var(--a-text-4)" }}>Total pages</span><span style={{ color: "var(--a-text-2)" }}>{loc.total}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--a-text-4)" }}>Indexable</span><span style={{ color: "var(--a-success)" }}>{loc.indexable}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--a-text-4)" }}>SEO complete</span><span style={{ color: "var(--a-text-3)" }}>{loc.seoComplete}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
