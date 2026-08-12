import { createAdminClient } from "@/lib/supabase";

export default async function ActivityLogsPage() {
  const supabase = createAdminClient();
  const { data: logs, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Activity Logs</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Activity Logs</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{logs?.length || 0} recent actions</p>
      </div>

      {!logs?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>📋</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No activity logged</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Action", "Resource", "User", "Time", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < logs.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-[13px]" style={{ color: "var(--a-text-1)" }}>{log.resource}</span>
                      {log.resource_id && <span className="text-[11px] ml-2" style={{ color: "var(--a-text-4)" }}>{log.resource_id.slice(0, 8)}...</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{log.user_email || log.user_id?.slice(0, 8) || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {log.ip_address && <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>{log.ip_address}</span>}
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

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    create: { bg: "color-mix(in srgb, var(--a-success) 15%, transparent)", text: "var(--a-success)" },
    update: { bg: "color-mix(in srgb, var(--a-accent) 15%, transparent)", text: "var(--a-accent)" },
    delete: { bg: "color-mix(in srgb, var(--a-error) 15%, transparent)", text: "var(--a-error)" },
    login: { bg: "var(--a-bg-elevated)", text: "var(--a-text-3)" },
  };
  const c = colors[action] || colors.login;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {action}
    </span>
  );
}
