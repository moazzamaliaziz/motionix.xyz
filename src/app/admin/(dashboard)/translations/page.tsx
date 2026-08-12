import { createAdminClient } from "@/lib/supabase";

export default async function TranslationsManagerPage() {
  const supabase = createAdminClient();

  // Fetch translation completeness data
  const { data: completeness, error } = await supabase
    .from("translation_completeness")
    .select("*")
    .order("locale");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Translation Manager</h1>
        <p className="text-red-600">Error loading translations: {error.message}</p>
      </div>
    );
  }

  // Group by locale
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
    const seoComplete = pages.filter((p) => p.seo_complete).length;
    const uiComplete = pages.filter((p) => p.ui_complete).length;
    const contentComplete = pages.filter((p) => p.content_complete).length;
    return {
      locale,
      total,
      indexable,
      seoComplete,
      uiComplete,
      contentComplete,
      percentage: total > 0 ? Math.round((indexable / total) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Translation Manager</h1>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Sync Translations
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locales.map((loc) => (
          <div
            key={loc.locale}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 uppercase">
                {loc.locale}
              </h3>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                loc.percentage === 100
                  ? "bg-green-100 text-green-800"
                  : loc.percentage >= 80
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {loc.percentage}% complete
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total pages</span>
                <span className="font-medium">{loc.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Indexable</span>
                <span className="font-medium text-green-600">{loc.indexable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SEO complete</span>
                <span className="font-medium">{loc.seoComplete}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UI complete</span>
                <span className="font-medium">{loc.uiComplete}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Content complete</span>
                <span className="font-medium">{loc.contentComplete}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Translation Details Table */}
      {completeness && completeness.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Translation Status</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SEO
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  UI
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Indexable
                </th>
              </tr>
            </thead>
            <tbody>
              {completeness.slice(0, 50).map((item) => (
                <tr key={`${item.locale}-${item.page_path}`} className="border-b border-gray-100">
                  <td className="px-6 py-3">
                    <span className="text-sm text-gray-900">{item.page_path}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.locale})</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${item.seo_complete ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${item.ui_complete ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${item.content_complete ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-block w-4 h-4 rounded-full ${item.indexable ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
