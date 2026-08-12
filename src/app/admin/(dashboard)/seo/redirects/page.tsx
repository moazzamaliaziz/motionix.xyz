import { createAdminClient } from "@/lib/supabase";

export default async function RedirectsPage() {
  const supabase = createAdminClient();
  const { data: redirects, error } = await supabase.from("redirects").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Redirects</h1>
        <div className="admin-card p-4 border-[color-mix(in_srgb,var(--a-error)_20%,transparent)]">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Redirects</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{redirects?.length || 0} redirects</p>
        </div>
        <button className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Add Redirect
        </button>
      </div>

      {!redirects?.length ? (
        <EmptyState icon="↪️" title="No redirects yet" hint="Run supabase/seed.sql to populate." />
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Source", "Destination", "Code", "Hits", "Reason"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {redirects.map((r, i) => (
                <tr key={r.id} className="admin-hover transition-colors duration-100"
                  style={{ borderBottom: i < redirects.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono text-[var(--a-text-2)]">{r.source_path}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono text-[var(--a-accent)]">{r.destination_path}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-[var(--a-bg-elevated)] text-[var(--a-text-2)]">
                      {r.status_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-[var(--a-text-1)]">{r.hit_count || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-4)]">{r.reason || "—"}</span>
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

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="admin-card p-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border border-[var(--a-border)] bg-[var(--a-bg-elevated)] opacity-50">{icon}</div>
      <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">{title}</p>
      <p className="text-[13px] text-[var(--a-text-4)]">
        Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> to populate.
      </p>
    </div>
  );
}
