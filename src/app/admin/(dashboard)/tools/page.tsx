import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function ToolsManagerPage() {
  const supabase = createAdminClient();
  const { data: tools, error } = await supabase.from("tools").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Tools</h1>
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
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Tools</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{tools?.length || 0} registered</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Add Tool
        </button>
      </div>

      {!tools?.length ? (
        <EmptyState icon="🛠" title="No tools yet" hint="Run supabase/seed.sql to populate." />
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Tool", "Engine", "Status", "Phase", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tools.map((tool, i) => (
                <tr key={tool.id} className="transition-colors duration-100"
                  style={{ borderBottom: i < tools.length - 1 ? "1px solid var(--a-border)" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--a-bg-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)" }}>
                        {tool.glyph || "🛠"}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "var(--a-text-1)" }}>{tool.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--a-text-4)" }}>/{tool.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono" style={{ color: "var(--a-text-3)" }}>{tool.engine}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tool.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>{tool.phase}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/tools/${tool.slug}`} className="text-[12px] transition-colors duration-100 hover:opacity-80" style={{ color: "var(--a-text-3)" }}>
                      Edit →
                    </Link>
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

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{ color: isPublished ? "var(--a-success)" : "var(--a-warning)" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPublished ? "var(--a-success)" : "var(--a-warning)" }} />
      {status}
    </span>
  );
}

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="a-card p-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>
        {icon}
      </div>
      <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>{title}</p>
      <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
        Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
      </p>
    </div>
  );
}
