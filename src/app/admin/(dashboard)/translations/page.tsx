import { createAdminClient } from "@/lib/supabase";

export default async function TranslationsManagerPage() {
  const supabase = createAdminClient();
  const { data: completeness, error } = await supabase.from("translation_completeness").select("*").order("locale");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Translations</h1>
        <div className="admin-card p-4 border-red-500/20 bg-red-500/[0.03]">
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
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Translations</h1>
          <p className="mt-1 text-[13px] text-white/30">Locale completeness across all pages.</p>
        </div>
        <button className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors">
          Sync
        </button>
      </div>

      {locales.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-xl opacity-50">🌐</div>
          <p className="text-[14px] text-white/50 mb-1">No translation data</p>
          <p className="text-[13px] text-white/25">
            Run <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-white/40 text-[12px]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locales.map((loc) => {
            const barColor = loc.pct === 100 ? "bg-emerald-500" : loc.pct >= 80 ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={loc.locale} className="admin-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-white uppercase tracking-tight">{loc.locale}</h3>
                  <span className={`text-[12px] font-semibold ${
                    loc.pct === 100 ? "text-emerald-400" : loc.pct >= 80 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {loc.pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] mb-4 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${loc.pct}%` }} />
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-white/25">Total pages</span><span className="text-white/50">{loc.total}</span></div>
                  <div className="flex justify-between"><span className="text-white/25">Indexable</span><span className="text-emerald-400/70">{loc.indexable}</span></div>
                  <div className="flex justify-between"><span className="text-white/25">SEO complete</span><span className="text-white/40">{loc.seoComplete}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
