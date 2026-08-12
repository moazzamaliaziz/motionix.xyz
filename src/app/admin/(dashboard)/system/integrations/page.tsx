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
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Integrations</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Connection status and sync health for external services.</p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[14px] font-semibold text-[var(--a-text-1)]">{integration.name}</h3>
                  <StatusPill status={integration.status} />
                </div>
                <p className="text-[12px] text-[var(--a-text-3)]">{integration.description}</p>
                {integration.envVar && (
                  <p className="text-[11px] mt-1.5 font-mono text-[var(--a-text-4)]">
                    Env: {integration.envVar}
                  </p>
                )}
              </div>
              <div className="text-right">
                {integration.lastSync ? (
                  <div>
                    <p className="text-[11px] text-[var(--a-text-4)]">Last sync</p>
                    <p className="text-[12px] text-[var(--a-text-2)]">
                      {new Date(integration.lastSync.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className={integration.lastSync.status === "success" ? "text-[11px] text-[var(--a-success)]" : "text-[11px] text-[var(--a-error)]"}>
                      {integration.lastSync.status} {integration.lastSync.rows_synced ? `(${integration.lastSync.rows_synced} rows)` : ""}
                    </p>
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--a-text-4)]">No sync history</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent sync logs */}
      {syncLogs && syncLogs.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--a-border)]">
            <h2 className="text-[14px] font-semibold text-[var(--a-text-1)]">Sync History</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Source", "Status", "Rows", "Started", "Completed"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id} className="transition-colors duration-100 admin-hover border-b border-[var(--a-border)] last:border-b-0">
                  <td className="px-4 py-3"><span className="text-[12px] font-medium text-[var(--a-text-1)]">{log.source}</span></td>
                  <td className="px-4 py-3"><StatusPill status={log.status} /></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-[var(--a-text-2)]">{log.rows_synced || 0}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] text-[var(--a-text-4)]">{new Date(log.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] text-[var(--a-text-4)]">{log.completed_at ? new Date(log.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span></td>
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
  const variants: Record<string, string> = {
    connected: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    not_configured: "bg-[var(--a-bg-elevated)] text-[var(--a-text-4)]",
    client_only: "bg-[var(--a-accent)]/15 text-[var(--a-accent)]",
    success: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    error: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
    running: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
    skipped: "bg-[var(--a-bg-elevated)] text-[var(--a-text-4)]",
  };
  const labels: Record<string, string> = {
    connected: "Connected",
    not_configured: "Not configured",
    client_only: "Client-only",
    success: "Success",
    error: "Error",
    running: "Running",
    skipped: "Skipped",
  };
  const variant = variants[status] || variants.not_configured;
  const label = labels[status] || status;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${variant}`}>
      {label}
    </span>
  );
}
