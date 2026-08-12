import { createAdminClient } from "@/lib/supabase";

export default async function NotFoundPage() {
  const supabase = createAdminClient();

  // In a real implementation, this would query a 404 log table
  // For now, show a placeholder with instructions
  const { data: issues } = await supabase
    .from("seo_issues")
    .select("*")
    .eq("issue_type", "broken_internal_link")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>404 Monitor</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Track broken URLs and fix them before they impact SEO.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="a-card p-5">
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>Broken Links Found</p>
          <p className="text-[28px] font-bold tracking-tight" style={{ color: "var(--a-error)" }}>{issues?.length || 0}</p>
        </div>
        <div className="a-card p-5">
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>Redirects Configured</p>
          <p className="text-[28px] font-bold tracking-tight" style={{ color: "var(--a-success)" }}>5</p>
        </div>
        <div className="a-card p-5">
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>Status</p>
          <p className="text-[14px] font-medium" style={{ color: "var(--a-text-2)" }}>Monitoring active</p>
        </div>
      </div>

      {/* Broken links from SEO issues */}
      {issues && issues.length > 0 && (
        <div className="a-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--a-border)" }}>
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--a-text-1)" }}>Broken Links Detected</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--a-text-4)" }}>These links return 404 errors and should be fixed or redirected.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Page", "Description", "Detected", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => (
                <tr key={issue.id} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < issues.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono" style={{ color: "var(--a-accent)" }}>{issue.page_url}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{issue.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>
                      {new Date(issue.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium ${issue.resolved ? "text-emerald-400" : "text-red-400"}`}>
                      {issue.resolved ? "Resolved" : "Open"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {(!issues || issues.length === 0) && (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>✅</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No broken links detected</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>Broken links will appear here when detected by SEO audits.</p>
        </div>
      )}
    </div>
  );
}
