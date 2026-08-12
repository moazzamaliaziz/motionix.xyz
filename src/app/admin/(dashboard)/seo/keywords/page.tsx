import { createAdminClient } from "@/lib/supabase";

export default async function KeywordsPage() {
  const supabase = createAdminClient();
  const { data: keywords, error } = await supabase
    .from("keywords")
    .select("*")
    .order("search_volume", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Keywords</h1>
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
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Keywords</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{keywords?.length || 0} tracked keywords</p>
        </div>
        <button className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Add Keyword
        </button>
      </div>

      {!keywords?.length ? (
        <EmptyState icon="🔍" title="No keywords yet" hint="Run supabase/seed.sql to populate." />
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Keyword", "Volume", "Difficulty", "Intent", "Rank", "Target", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw, i) => (
                <tr key={kw.id} className="admin-hover transition-colors duration-100"
                  style={{ borderBottom: i < keywords.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--a-text-1)]">{kw.keyword}</p>
                      {kw.target_url && <p className="text-[11px] mt-0.5 text-[var(--a-text-4)]">{kw.target_url}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-medium text-[var(--a-text-1)]">
                      {kw.search_volume?.toLocaleString() || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBar value={kw.keyword_difficulty || 0} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">
                      {kw.intent || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] ${kw.current_rank ? "text-[var(--a-text-1)]" : "text-[var(--a-text-4)]"}`}>
                      {kw.current_rank ? `#${kw.current_rank}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] ${kw.target_rank ? "text-[var(--a-accent)]" : "text-[var(--a-text-4)]"}`}>
                      {kw.target_rank ? `#${kw.target_rank}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] text-[var(--a-text-4)]">{kw.country || "—"}</span>
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

function DifficultyBar({ value }: { value: number }) {
  const color = value <= 30 ? "var(--a-success)" : value <= 60 ? "var(--a-warning)" : "var(--a-error)";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-[var(--a-bg-elevated)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[12px] font-medium" style={{ color }}>{value}</span>
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
