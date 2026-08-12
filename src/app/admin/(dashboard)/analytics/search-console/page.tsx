import { createAdminClient } from "@/lib/supabase";

export default async function SearchConsolePage() {
  const supabase = createAdminClient();

  const { data: snapshots, error } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Search Console</h1>
        <div className="admin-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalImpressions = snapshots?.reduce((s, d) => s + (d.impressions || 0), 0) || 0;
  const totalClicks = snapshots?.reduce((s, d) => s + (d.clicks || 0), 0) || 0;
  const avgCtr = snapshots?.length ? snapshots.reduce((s, d) => s + (d.ctr || 0), 0) / snapshots.length : 0;
  const avgPos = snapshots?.length ? snapshots.reduce((s, d) => s + (d.avg_position || 0), 0) / snapshots.length : 0;

  const stats = [
    { label: "Impressions", value: totalImpressions.toLocaleString() },
    { label: "Clicks", value: totalClicks.toLocaleString() },
    { label: "Avg CTR", value: `${(avgCtr * 100).toFixed(1)}%` },
    { label: "Avg Position", value: avgPos.toFixed(1) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Search Console</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Google Search Performance data.</p>
      </div>

      {!snapshots?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">📊</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No Search Console data</p>
          <p className="text-[13px] text-[var(--a-text-4)]">Data will appear here after GA4/GSC sync is configured.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="admin-card p-5">
                <p className="text-[12px] font-medium mb-2 text-[var(--a-text-3)]">{s.label}</p>
                <p className="text-[28px] font-bold tracking-tight text-[var(--a-text-1)]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="admin-card p-5">
            <h2 className="text-[13px] font-semibold mb-4 text-[var(--a-text-2)]">Impressions Over Time</h2>
            <div className="h-48 flex items-end gap-1">
              {snapshots.slice(0, 30).reverse().map((s, i) => {
                const max = Math.max(...snapshots.map((d) => d.impressions || 0), 1);
                const height = Math.max(((s.impressions || 0) / max) * 100, 2);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                    <div className="hidden group-hover:block text-[10px] px-1.5 py-0.5 rounded border bg-[var(--a-bg-elevated)] border-[var(--a-border)] text-[var(--a-text-2)]">
                      {s.impressions || 0}
                    </div>
                    <div className="w-full rounded-t a-chart-hover" style={{ height: `${height}%`, background: "color-mix(in srgb, var(--a-accent) 30%, transparent)" }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--a-border)]">
              <h2 className="text-[13px] font-semibold text-[var(--a-text-2)]">Daily Breakdown</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--a-border)]">
                  {["Date", "Impressions", "Clicks", "CTR", "Avg Position"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshots.slice(0, 15).map((s, i) => (
                  <tr key={s.id} className="admin-hover transition-colors duration-100 border-b border-[var(--a-border)] last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[var(--a-text-1)]">
                        {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[var(--a-text-2)]">{(s.impressions || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[var(--a-text-2)]">{(s.clicks || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[var(--a-text-2)]">{((s.ctr || 0) * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-[var(--a-text-2)]">{(s.avg_position || 0).toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
