import { createAdminClient } from "@/lib/supabase";

export default async function ToolAnalyticsPage() {
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("tool_usage_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Tool Analytics</h1>
        <div className="admin-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Aggregate by tool
  const toolMap = new Map<string, { starts: number; completes: number; errors: number; totalMs: number }>();
  events?.forEach((e) => {
    const existing = toolMap.get(e.tool_slug) || { starts: 0, completes: 0, errors: 0, totalMs: 0 };
    if (e.event_type === "tool_start") existing.starts++;
    if (e.event_type === "tool_complete") { existing.completes++; existing.totalMs += e.processing_time_ms || 0; }
    if (e.event_type === "tool_error") existing.errors++;
    toolMap.set(e.tool_slug, existing);
  });

  const toolStats = Array.from(toolMap.entries())
    .map(([slug, data]) => ({
      slug,
      ...data,
      avgMs: data.completes > 0 ? Math.round(data.totalMs / data.completes) : 0,
      errorRate: data.starts > 0 ? Math.round((data.errors / data.starts) * 100) : 0,
    }))
    .sort((a, b) => b.starts - a.starts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Tool Analytics</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{events?.length || 0} events recorded</p>
      </div>

      {!events?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">🛠️</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No tool usage data</p>
          <p className="text-[13px] text-[var(--a-text-4)]">Data will appear here once tools are used and events are tracked.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {toolStats.map((tool) => (
            <div key={tool.slug} className="admin-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-[var(--a-text-1)]">{tool.slug}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  tool.errorRate === 0 ? "bg-emerald-500/10 text-emerald-400" :
                  tool.errorRate < 10 ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {tool.errorRate}% errors
                </span>
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[var(--a-text-4)]">Starts</span>
                  <span className="text-[var(--a-text-1)]">{tool.starts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--a-text-4)]">Completions</span>
                  <span className="text-[var(--a-success)]">{tool.completes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--a-text-4)]">Errors</span>
                  <span className={tool.errors > 0 ? "text-[var(--a-error)]" : "text-[var(--a-text-4)]"}>{tool.errors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--a-text-4)]">Avg Time</span>
                  <span className="text-[var(--a-text-2)]">{tool.avgMs > 0 ? `${(tool.avgMs / 1000).toFixed(1)}s` : "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
