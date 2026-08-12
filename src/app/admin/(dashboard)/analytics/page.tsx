import { createAdminClient } from "@/lib/supabase";

export default async function AnalyticsOverviewPage() {
  const supabase = createAdminClient();

  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  const { data: toolEvents } = await supabase
    .from("tool_usage_events")
    .select("tool_slug, event_type")
    .order("created_at", { ascending: false })
    .limit(100);

  const toolUsage = new Map<string, number>();
  toolEvents?.forEach((event) => {
    if (event.event_type === "tool_start") {
      toolUsage.set(event.tool_slug, (toolUsage.get(event.tool_slug) || 0) + 1);
    }
  });

  const topTools = Array.from(toolUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const totalImpressions = snapshots?.reduce((sum, s) => sum + (s.impressions || 0), 0) || 0;
  const totalClicks = snapshots?.reduce((sum, s) => sum + (s.clicks || 0), 0) || 0;
  const avgPosition = snapshots?.length
    ? snapshots.reduce((sum, s) => sum + (s.avg_position || 0), 0) / snapshots.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics Overview</h1>
        <p className="mt-1 text-sm text-[#888]">Last 30 days of site performance data.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Impressions", value: totalImpressions.toLocaleString() },
          { label: "Clicks", value: totalClicks.toLocaleString() },
          { label: "Avg Position", value: avgPosition.toFixed(1) },
        ].map((stat) => (
          <div key={stat.label} className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
            <p className="text-[11px] font-medium text-[#666] uppercase tracking-wider">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Tools */}
      {topTools.length > 0 && (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Top Tools</h2>
          <div className="space-y-2">
            {topTools.map(([slug, count]) => (
              <div key={slug} className="flex items-center justify-between py-1.5">
                <span className="text-[13px] text-[#aaa]">{slug}</span>
                <span className="text-[13px] font-medium text-[#666]">{count} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!snapshots?.length && topTools.length === 0 && (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-12 text-center">
          <p className="text-[#888] mb-2">No analytics data yet.</p>
          <p className="text-[13px] text-[#555]">Data will appear here once tools are used and analytics are collected.</p>
        </div>
      )}
    </div>
  );
}
