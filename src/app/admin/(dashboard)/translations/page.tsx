import { createAdminClient } from "@/lib/supabase";

export default async function TranslationsManagerPage() {
  const supabase = createAdminClient();

  const { data: completeness, error } = await supabase
    .from("translation_completeness")
    .select("*")
    .order("locale");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-white">Translation Manager</h1>
        <div className="border border-red-500/20 rounded-lg bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error loading translations: {error.message}</p>
        </div>
      </div>
    );
  }

  const localeMap = new Map<string, typeof completeness>();
  completeness?.forEach((item) => {
    if (!localeMap.has(item.locale)) {
      localeMap.set(item.locale, []);
    }
    localeMap.get(item.locale)?.push(item);
  });

  const locales = Array.from(localeMap.entries()).map(([locale, pages]) => {
    const total = pages.length;
    const indexable = pages.filter((p) => p.indexable).length;
    return {
      locale,
      total,
      indexable,
      percentage: total > 0 ? Math.round((indexable / total) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Translation Manager</h1>
          <p className="mt-1 text-sm text-[#888]">Locale completeness tracking for all pages.</p>
        </div>
        <button className="px-3.5 py-1.5 bg-white text-black rounded-md text-[13px] font-medium hover:bg-[#e0e0e0] transition-colors">
          Sync Translations
        </button>
      </div>

      {locales.length === 0 ? (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-12 text-center">
          <p className="text-[#888] mb-2">No translation data found.</p>
          <p className="text-[13px] text-[#555]">
            Run <code className="px-1.5 py-0.5 bg-[#111] rounded text-[#888]">supabase/seed.sql</code> to populate translation data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locales.map((loc) => (
            <div key={loc.locale} className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white uppercase">{loc.locale}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  loc.percentage === 100
                    ? "bg-emerald-500/10 text-emerald-400"
                    : loc.percentage >= 80
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {loc.percentage}%
                </span>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#666]">Total pages</span>
                  <span className="text-[#aaa]">{loc.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Indexable</span>
                  <span className="text-emerald-400">{loc.indexable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
