import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function ToolsManagerPage() {
  const supabase = createAdminClient();

  const { data: tools, error } = await supabase
    .from("tools")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-white">Tools Manager</h1>
        <div className="border border-red-500/20 rounded-lg bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error loading tools: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Tools Manager</h1>
          <p className="mt-1 text-sm text-[#888]">{tools?.length || 0} tools registered</p>
        </div>
        <button className="px-3.5 py-1.5 bg-white text-black rounded-md text-[13px] font-medium hover:bg-[#e0e0e0] transition-colors">
          Add Tool
        </button>
      </div>

      {!tools?.length ? (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-12 text-center">
          <p className="text-[#888] mb-2">No tools found in the database.</p>
          <p className="text-[13px] text-[#555]">
            Run <code className="px-1.5 py-0.5 bg-[#111] rounded text-[#888]">supabase/seed.sql</code> in your Supabase SQL Editor to populate the tools table.
          </p>
        </div>
      ) : (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Tool</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Engine</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Phase</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="border-b border-[#111] hover:bg-[#0d0d0d]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{tool.glyph || "🛠"}</span>
                      <div>
                        <p className="text-[13px] font-medium text-white">{tool.name}</p>
                        <p className="text-[12px] text-[#555]">/{tool.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-[#888]">{tool.engine}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ${
                      tool.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-[#666]">{tool.phase}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/tools/${tool.slug}`}
                      className="text-[13px] text-[#666] hover:text-white transition-colors"
                    >
                      Edit
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
