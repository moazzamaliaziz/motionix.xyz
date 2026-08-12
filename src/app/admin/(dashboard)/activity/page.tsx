import { createAdminClient } from "@/lib/supabase";

export default async function ActivityLogsPage() {
  const supabase = createAdminClient();
  const { data: logs, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Activity Logs</h1>
        <div className="admin-card p-4 border-[var(--a-error)]/20">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Activity Logs</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{logs?.length || 0} recent actions</p>
      </div>

      {!logs?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">📋</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No activity logged</p>
          <p className="text-[13px] text-[var(--a-text-4)]">
            Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Action", "Resource", "User", "Time", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors duration-100 admin-hover border-b border-[var(--a-border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-[13px] text-[var(--a-text-1)]">{log.resource}</span>
                      {log.resource_id && <span className="text-[11px] ml-2 text-[var(--a-text-4)]">{log.resource_id.slice(0, 8)}...</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-3)]">{log.user_email || log.user_id?.slice(0, 8) || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-4)]">
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {log.ip_address && <span className="text-[11px] text-[var(--a-text-4)]">{log.ip_address}</span>}
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
  const variants: Record<string, string> = {
    create: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    update: "bg-[var(--a-accent)]/15 text-[var(--a-accent)]",
    delete: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
    login: "bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]",
  };
  const variant = variants[action] || variants.login;
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${variant}`}>
      {action}
    </span>
  );
}
