import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function ToolsManagerPage() {
  const supabase = createAdminClient();
  const { data: tools, error } = await supabase.from("tools").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Tools</h1>
        <div className="admin-card p-4 border-red-500/20 bg-red-500/[0.03]">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Tools</h1>
          <p className="mt-1 text-[13px] text-white/30">{tools?.length || 0} registered</p>
        </div>
        <button className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors">
          Add Tool
        </button>
      </div>

      {!tools?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-xl opacity-50">🛠</div>
          <p className="text-[14px] text-white/50 mb-1">No tools yet</p>
          <p className="text-[13px] text-white/25">
            Run <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-white/40 text-[12px]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Tool", "Engine", "Status", "Phase", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tools.map((tool, i) => (
                <tr
                  key={tool.id}
                  className={`transition-colors hover:bg-white/[0.02] ${
                    i < tools.length - 1 ? "border-b border-white/[0.03]" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm">
                        {tool.glyph || "🛠"}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white/80">{tool.name}</p>
                        <p className="text-[11px] text-white/20">/{tool.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-white/35 font-mono">{tool.engine}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      tool.status === "published" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tool.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-white/30">{tool.phase}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/tools/${tool.slug}`} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
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
