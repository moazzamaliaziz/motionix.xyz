import { createAdminClient } from "@/lib/supabase";

export default async function AnalyticsOverviewPage() {
  const supabase = createAdminClient();
  const { data: snapshots } = await supabase.from("analytics_snapshots").select("*").order("date", { ascending: false }).limit(30);
  const { data: toolEvents } = await supabase.from("tool_usage_events").select("tool_slug, event_type").order("created_at", { ascending: false }).limit(100);

  const toolUsage = new Map<string, number>();
  toolEvents?.forEach((e) => { if (e.event_type === "tool_start") toolUsage.set(e.tool_slug, (toolUsage.get(e.tool_slug) || 0) + 1); });
  const topTools = Array.from(toolUsage.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxUsage = topTools.length ? topTools[0][1] : 1;

  const totalImpressions = snapshots?.reduce((s, d) => s + (d.impressions || 0), 0) || 0;
  const totalClicks = snapshots?.reduce((s, d) => s + (d.clicks || 0), 0) || 0;
  const avgPos = snapshots?.length ? snapshots.reduce((s, d) => s + (d.avg_position || 0), 0) / snapshots.length : 0;

  const stats = [
    { label: "Impressions", value: totalImpressions.toLocaleString() },
    { label: "Clicks", value: totalClicks.toLocaleString() },
    { label: "Avg Position", value: avgPos.toFixed(1) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Analytics</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Last 30 days of performance data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="admin-card-hover p-5">
            <p className="text-[12px] font-medium mb-2 text-[var(--a-text-3)]">{s.label}</p>
            <p className="text-[30px] font-bold tracking-tight text-[var(--a-text-1)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="admin-card p-5">
        <h2 className="text-[13px] font-semibold mb-4 text-[var(--a-text-2)]">Traffic Trend</h2>
        {snapshots && snapshots.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {snapshots.slice(0, 30).reverse().map((s, i) => {
              const max = Math.max(...snapshots.map((d) => d.impressions || 0), 1);
              const height = Math.max(((s.impressions || 0) / max) * 100, 2);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                  <div className="hidden group-hover:block text-[10px] px-1.5 py-0.5 rounded border bg-[var(--a-bg-elevated)] border-[var(--a-border)] text-[var(--a-text-2)]">
                    {s.impressions || 0}
                  </div>
                  <div className="w-full rounded-t transition-colors duration-100 a-chart-hover"
                    style={{ height: `${height}%`, background: "color-mix(in srgb, var(--a-accent) 30%, transparent)" }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-[13px] text-[var(--a-text-4)]">No data yet.</p>
          </div>
        )}
      </div>

      {/* Top tools */}
      {topTools.length > 0 && (
        <div className="admin-card p-5">
          <h2 className="text-[13px] font-semibold mb-4 text-[var(--a-text-2)]">Top Tools</h2>
          <div className="space-y-3">
            {topTools.map(([slug, count]) => (
              <div key={slug} className="flex items-center gap-4">
                <span className="text-[13px] w-44 truncate text-[var(--a-text-2)]">{slug}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--a-bg-elevated)]">
                  <div className="h-full rounded-full" style={{ width: `${(count / maxUsage) * 100}%`, background: "color-mix(in srgb, var(--a-accent) 50%, transparent)" }} />
                </div>
                <span className="text-[12px] w-16 text-right text-[var(--a-text-3)]">{count} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!snapshots?.length && topTools.length === 0 && (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">📊</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No analytics data yet</p>
          <p className="text-[13px] text-[var(--a-text-4)]">Data will appear once tools are used.</p>
        </div>
      )}
    </div>
  );
}
