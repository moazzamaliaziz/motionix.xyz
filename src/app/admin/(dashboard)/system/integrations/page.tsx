import { createAdminClient } from "@/lib/supabase";

export default async function IntegrationsPage() {
  const supabase = createAdminClient();

  // Check sync logs
  const { data: syncLogs } = await supabase
    .from("analytics_sync_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  const integrations = [
    {
      name: "Google Analytics 4",
      envVar: "GA4_PROPERTY_ID",
      status: process.env.GA4_PROPERTY_ID ? "connected" : "not_configured",
      lastSync: syncLogs?.find((l) => l.source === "ga4"),
      description: "Active users, pageviews, sessions by country/device/source.",
    },
    {
      name: "Google Search Console",
      envVar: "GSC_SITE_URL",
      status: process.env.GSC_SITE_URL ? "connected" : "not_configured",
      lastSync: syncLogs?.find((l) => l.source === "gsc"),
      description: "Impressions, clicks, CTR, position by page/query/country.",
    },
    {
      name: "Supabase Database",
      envVar: "NEXT_PUBLIC_SUPABASE_URL",
      status: "connected",
      lastSync: null,
      description: "Primary data store for all admin panel data.",
    },
    {
      name: "Vercel Analytics",
      envVar: null,
      status: "client_only",
      lastSync: null,
      description: "Client-side page view and Web Vitals tracking. No data API available.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Integrations</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Connection status and sync health for external services.</p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="a-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[14px] font-semibold" style={{ color: "var(--a-text-1)" }}>{integration.name}</h3>
                  <StatusPill status={integration.status} />
                </div>
                <p className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{integration.description}</p>
                {integration.envVar && (
                  <p className="text-[11px] mt-1.5 font-mono" style={{ color: "var(--a-text-4)" }}>
                    Env: {integration.envVar}
                  </p>
                )}
              </div>
              <div className="text-right">
                {integration.lastSync ? (
                  <div>
                    <p className="text-[11px]" style={{ color: "var(--a-text-4)" }}>Last sync</p>
                    <p className="text-[12px]" style={{ color: "var(--a-text-2)" }}>
                      {new Date(integration.lastSync.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[11px]" style={{ color: integration.lastSync.status === "success" ? "var(--a-success)" : "var(--a-error)" }}>
                      {integration.lastSync.status} {integration.lastSync.rows_synced ? `(${integration.lastSync.rows_synced} rows)` : ""}
                    </p>
                  </div>
                ) : (
                  <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>No sync history</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent sync logs */}
      {syncLogs && syncLogs.length > 0 && (
        <div className="a-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--a-border)" }}>
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--a-text-1)" }}>Sync History</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Source", "Status", "Rows", "Started", "Completed"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log, i) => (
                <tr key={log.id} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < syncLogs.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3"><span className="text-[12px] font-medium" style={{ color: "var(--a-text-1)" }}>{log.source}</span></td>
                  <td className="px-4 py-3"><StatusPill status={log.status} /></td>
                  <td className="px-4 py-3"><span className="text-[12px]" style={{ color: "var(--a-text-2)" }}>{log.rows_synced || 0}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>{new Date(log.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>{log.completed_at ? new Date(log.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    connected: { bg: "color-mix(in srgb, var(--a-success) 15%, transparent)", text: "var(--a-success)", label: "Connected" },
    not_configured: { bg: "var(--a-bg-elevated)", text: "var(--a-text-4)", label: "Not configured" },
    client_only: { bg: "color-mix(in srgb, var(--a-accent) 15%, transparent)", text: "var(--a-accent)", label: "Client-only" },
    success: { bg: "color-mix(in srgb, var(--a-success) 15%, transparent)", text: "var(--a-success)", label: "Success" },
    error: { bg: "color-mix(in srgb, var(--a-error) 15%, transparent)", text: "var(--a-error)", label: "Error" },
    running: { bg: "color-mix(in srgb, var(--a-warning) 15%, transparent)", text: "var(--a-warning)", label: "Running" },
    skipped: { bg: "var(--a-bg-elevated)", text: "var(--a-text-4)", label: "Skipped" },
  };
  const c = colors[status] || colors.not_configured;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}
