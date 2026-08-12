import { createAdminClient } from "@/lib/supabase";

export default async function SeoIssuesPage() {
  const supabase = createAdminClient();
  const { data: issues, error } = await supabase.from("seo_issues").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>SEO Issues</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const unresolved = issues?.filter((i) => !i.resolved) || [];
  const resolved = issues?.filter((i) => i.resolved) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>SEO Issues</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{unresolved.length} unresolved · {resolved.length} resolved</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Run Audit
        </button>
      </div>

      {!issues?.length ? (
        <EmptyState icon="✅" title="No SEO issues" hint="All clear. Issues will appear here when found." />
      ) : (
        <div className="space-y-4">
          {unresolved.length > 0 && (
            <div className="a-card overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--a-border)" }}>
                <h2 className="text-[13px] font-semibold" style={{ color: "var(--a-text-2)" }}>Unresolved</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                    {["Severity", "Type", "Page", "Description", "Created"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unresolved.map((issue, i) => (
                    <tr key={issue.id} className="a-hover transition-colors duration-100"
                      style={{ borderBottom: i < unresolved.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={issue.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px]" style={{ color: "var(--a-text-2)" }}>{issue.issue_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-mono truncate block max-w-[200px]" style={{ color: "var(--a-accent)" }}>{issue.page_url}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{issue.description || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>
                          {new Date(issue.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {resolved.length > 0 && (
            <div className="a-card overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--a-border)" }}>
                <h2 className="text-[13px] font-semibold" style={{ color: "var(--a-text-2)" }}>Resolved</h2>
              </div>
              <table className="w-full">
                <tbody>
                  {resolved.map((issue, i) => (
                    <tr key={issue.id} className="a-hover transition-colors duration-100"
                      style={{ borderBottom: i < resolved.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={issue.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{issue.issue_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-mono truncate block max-w-[200px]" style={{ color: "var(--a-text-4)" }}>{issue.page_url}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[11px] text-emerald-400">Resolved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: "color-mix(in srgb, var(--a-error) 15%, transparent)", text: "var(--a-error)" },
    warning: { bg: "color-mix(in srgb, var(--a-warning) 15%, transparent)", text: "var(--a-warning)" },
    info: { bg: "color-mix(in srgb, var(--a-accent) 15%, transparent)", text: "var(--a-accent)" },
  };
  const c = colors[severity] || colors.info;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {severity}
    </span>
  );
}

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="a-card p-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>{icon}</div>
      <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>{title}</p>
      <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>{hint}</p>
    </div>
  );
}
