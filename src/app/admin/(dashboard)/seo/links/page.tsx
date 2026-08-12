import { createAdminClient } from "@/lib/supabase";

export default async function InternalLinksPage() {
  const supabase = createAdminClient();
  const { data: links, error } = await supabase.from("internal_links").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Internal Links</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Internal Links</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{links?.length || 0} links tracked</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Add Link
        </button>
      </div>

      {!links?.length ? (
        <EmptyState icon="🔗" title="No internal links yet" hint="Run supabase/seed.sql to populate." />
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Source", "Target", "Anchor Text", "Type", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((link, i) => (
                <tr key={link.id} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < links.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono truncate block max-w-[200px]" style={{ color: "var(--a-text-2)" }}>{link.source_url}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono truncate block max-w-[200px]" style={{ color: "var(--a-accent)" }}>{link.target_url}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px]" style={{ color: "var(--a-text-1)" }}>{link.anchor_text || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>
                      {link.link_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium ${link.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                      {link.status}
                    </span>
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
    <div className="a-card p-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>{icon}</div>
      <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>{title}</p>
      <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
        Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
      </p>
    </div>
  );
}
