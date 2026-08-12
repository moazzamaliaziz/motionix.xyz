import { createAdminClient } from "@/lib/supabase";

export default async function FeatureFlagsPage() {
  const supabase = createAdminClient();
  const { data: flags, error } = await supabase.from("feature_flags").select("*").order("key");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Feature Flags</h1>
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
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Feature Flags</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{flags?.length || 0} flags</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Add Flag
        </button>
      </div>

      {!flags?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>🚩</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No feature flags</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Flag", "Description", "Status", "Updated"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((flag, i) => (
                <tr key={flag.id} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < flags.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-mono font-medium" style={{ color: "var(--a-text-1)" }}>{flag.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{flag.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${flag.enabled ? "bg-emerald-500/30" : "bg-white/10"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${flag.enabled ? "left-4 bg-emerald-400" : "left-0.5 bg-white/40"}`} />
                      </div>
                      <span className={`text-[11px] font-medium ${flag.enabled ? "text-emerald-400" : "text-white/40"}`}>
                        {flag.enabled ? "ON" : "OFF"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>
                      {new Date(flag.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
