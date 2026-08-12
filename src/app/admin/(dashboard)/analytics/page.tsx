import { createAdminClient } from "@/lib/supabase";

export default async function AnalyticsOverviewPage() {
  const supabase = createAdminClient();
  const { data: snapshots } = await supabase.from("analytics_snapshots").select("*").order("date", { ascending: false }).limit(30);
  const { data: toolEvents } = await supabase.from("tool_usage_events").select("tool_slug, event_type").order("created_at", { ascending: false }).limit(100);

  const toolUsage = new Map<string, number>();
  toolEvents?.forEach((e) => {
    if (e.event_type === "tool_start") toolUsage.set(e.tool_slug, (toolUsage.get(e.tool_slug) || 0) + 1);
  });
  const topTools = Array.from(toolUsage.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxUsage = topTools.length ? topTools[0][1] : 1;

  const totalImpressions = snapshots?.reduce((s, d) => s + (d.impressions || 0), 0) || 0;
  const totalClicks = snapshots?.reduce((s, d) => s + (d.clicks || 0), 0) || 0;
  const avgPos = snapshots?.length ? snapshots.reduce((s, d) => s + (d.avg_position || 0), 0) / snapshots.length : 0;

  const summaryStats = [
    { label: "Impressions", value: totalImpressions.toLocaleString(), color: "#3b82f6" },
    { label: "Clicks", value: totalClicks.toLocaleString(), color: "#8b5cf6" },
    { label: "Avg Position", value: avgPos.toFixed(1), color: "#06b6d4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Analytics</h1>
        <p className="mt-1 text-[13px] text-white/30">Last 30 days of performance data.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="admin-card p-5">
            <p className="text-[11px] font-medium text-white/25 uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 text-[28px] font-semibold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="admin-card p-5">
        <h2 className="text-[13px] font-semibold text-white/70 mb-4">Traffic Trend</h2>
        {snapshots && snapshots.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {snapshots.slice(0, 30).reverse().map((s, i) => {
              const max = Math.max(...snapshots.map((d) => d.impressions || 0), 1);
              const height = Math.max(((s.impressions || 0) / max) * 100, 2);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${s.date}: ${s.impressions || 0} impressions`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-[13px] text-white/20">No data yet. Analytics will appear here once collected.</p>
          </div>
        )}
      </div>

      {/* Top tools */}
      {topTools.length > 0 && (
        <div className="admin-card p-5">
          <h2 className="text-[13px] font-semibold text-white/70 mb-4">Top Tools</h2>
          <div className="space-y-3">
            {topTools.map(([slug, count]) => (
              <div key={slug} className="flex items-center gap-4">
                <span className="text-[13px] text-white/50 w-44 truncate">{slug}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/40"
                    style={{ width: `${(count / maxUsage) * 100}%` }}
                  />
                </div>
                <span className="text-[12px] text-white/30 w-16 text-right">{count} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!snapshots?.length && topTools.length === 0 && (
        <div className="admin-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-xl opacity-50">📊</div>
          <p className="text-[14px] text-white/50 mb-1">No analytics data yet</p>
          <p className="text-[13px] text-white/25">Data will appear once tools are used and analytics are collected.</p>
        </div>
      )}
    </div>
  );
}
