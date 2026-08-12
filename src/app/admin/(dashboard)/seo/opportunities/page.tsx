import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function SeoOpportunitiesPage() {
  const supabase = createAdminClient();

  const [
    { data: keywords },
    { data: issues },
    { data: links },
    { data: snapshots },
    { data: completeness },
  ] = await Promise.all([
    supabase.from("keywords").select("*").order("search_volume", { ascending: false }),
    supabase.from("seo_issues").select("*").eq("resolved", false),
    supabase.from("internal_links").select("*"),
    supabase.from("analytics_snapshots").select("*").order("date", { ascending: false }).limit(60),
    supabase.from("translation_completeness").select("*"),
  ]);

  // Top-10 opportunities: keywords ranking 11-20
  const top10Opps = keywords?.filter((k) => k.current_rank && k.current_rank >= 11 && k.current_rank <= 20) || [];

  // CTR opportunities: high impressions, low CTR
  const ctrOpps = snapshots
    ?.filter((s) => s.impressions > 100 && s.ctr < 0.05)
    .reduce((acc: { page_url: string; impressions: number; clicks: number; count: number }[], s) => {
      const existing = acc.find((a) => a.page_url === s.page_url);
      if (existing) { existing.impressions += s.impressions; existing.clicks += s.clicks; existing.count++; }
      else acc.push({ page_url: s.page_url, impressions: s.impressions, clicks: s.clicks, count: 1 });
      return acc;
    }, [] as { page_url: string; impressions: number; clicks: number; count: number }[])
    ?.filter((a) => a.count >= 3)
    .map((a) => ({ ...a, ctr: a.impressions > 0 ? a.clicks / a.impressions : 0 }))
    .sort((a, b) => b.impressions - a.impressions) || [];

  // Translation gaps
  const transGaps = completeness?.filter((c) => !c.seo_complete || !c.content_complete) || [];

  // Critical issues
  const criticalIssues = issues?.filter((i) => i.severity === "critical") || [];
  const warningIssues = issues?.filter((i) => i.severity === "warning") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">SEO Opportunity Center</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Ranking gains, CTR opportunities, and technical issues.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Top-10 Opps" value={top10Opps.length} color="var(--a-accent)" />
        <StatCard label="CTR Opps" value={ctrOpps.length} color="var(--a-warning)" />
        <StatCard label="Critical Issues" value={criticalIssues.length} color="var(--a-error)" />
        <StatCard label="Warnings" value={warningIssues.length} color="var(--a-warning)" />
        <StatCard label="Translation Gaps" value={transGaps.length} color="var(--a-text-3)" />
      </div>

      {/* Top-10 Opportunities */}
      <Section title="Top-10 Opportunities" desc="Keywords ranking 11-20 that could reach page 1 with optimization.">
        {top10Opps.length === 0 ? (
          <EmptyRow text="No keywords ranking 11-20 yet." />
        ) : (
          <Table headers={["Keyword", "Current Rank", "Volume", "Difficulty"]}>
            {top10Opps.slice(0, 10).map((kw) => (
              <tr key={kw.id} className="admin-hover transition-colors duration-100 border-b border-[var(--a-border)]">
                <td className="px-4 py-3"><span className="text-[13px] font-medium text-[var(--a-text-1)]">{kw.keyword}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] font-medium text-[var(--a-warning)]">#{kw.current_rank}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] text-[var(--a-text-2)]">{kw.search_volume?.toLocaleString()}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] text-[var(--a-text-3)]">{kw.keyword_difficulty}</span></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* CTR Opportunities */}
      <Section title="CTR Opportunities" desc="Pages with high impressions but low CTR — optimize titles and descriptions.">
        {ctrOpps.length === 0 ? (
          <EmptyRow text="No CTR opportunities found." />
        ) : (
          <Table headers={["Page", "Impressions", "Clicks", "CTR"]}>
            {ctrOpps.slice(0, 10).map((opp) => (
              <tr key={opp.page_url} className="admin-hover transition-colors duration-100 border-b border-[var(--a-border)]">
                <td className="px-4 py-3"><span className="text-[12px] font-mono text-[var(--a-accent)]">{opp.page_url}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] text-[var(--a-text-2)]">{opp.impressions.toLocaleString()}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] text-[var(--a-text-2)]">{opp.clicks.toLocaleString()}</span></td>
                <td className="px-4 py-3"><span className="text-[13px] font-medium text-[var(--a-error)]">{(opp.ctr * 100).toFixed(1)}%</span></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Critical Issues */}
      <Section title="Critical Issues" desc="Technical SEO issues that need immediate attention.">
        {criticalIssues.length === 0 && warningIssues.length === 0 ? (
          <EmptyRow text="No critical issues. All clear!" />
        ) : (
          <Table headers={["Severity", "Type", "Page", "Description"]}>
            {[...criticalIssues, ...warningIssues].slice(0, 10).map((issue) => (
              <tr key={issue.id} className="admin-hover transition-colors duration-100 border-b border-[var(--a-border)]">
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    issue.severity === "critical" ? "bg-[var(--a-error)]/15 text-[var(--a-error)]" : "bg-[var(--a-warning)]/15 text-[var(--a-warning)]"
                  }`}>{issue.severity}</span>
                </td>
                <td className="px-4 py-3"><span className="text-[12px] text-[var(--a-text-2)]">{issue.issue_type}</span></td>
                <td className="px-4 py-3"><span className="text-[12px] font-mono truncate block max-w-[200px] text-[var(--a-accent)]">{issue.page_url}</span></td>
                <td className="px-4 py-3"><span className="text-[12px] text-[var(--a-text-3)]">{issue.description || "—"}</span></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Translation Gaps */}
      <Section title="Translation Gaps" desc="Locales missing SEO metadata or content translations.">
        {transGaps.length === 0 ? (
          <EmptyRow text="All translations complete." />
        ) : (
          <Table headers={["Locale", "Page", "SEO", "Content", "Indexable"]}>
            {transGaps.slice(0, 15).map((gap) => (
              <tr key={`${gap.locale}-${gap.page_path}`} className="admin-hover transition-colors duration-100 border-b border-[var(--a-border)]">
                <td className="px-4 py-3"><span className="text-[12px] font-medium uppercase text-[var(--a-text-1)]">{gap.locale}</span></td>
                <td className="px-4 py-3"><span className="text-[12px] font-mono text-[var(--a-text-2)]">{gap.page_path}</span></td>
                <td className="px-4 py-3"><span className={gap.seo_complete ? "text-[var(--a-success)]" : "text-[var(--a-error)]"}>{gap.seo_complete ? "✓" : "✗"}</span></td>
                <td className="px-4 py-3"><span className={gap.content_complete ? "text-[var(--a-success)]" : "text-[var(--a-error)]"}>{gap.content_complete ? "✓" : "✗"}</span></td>
                <td className="px-4 py-3"><span className={gap.indexable ? "text-[var(--a-success)]" : "text-[var(--a-error)]"}>{gap.indexable ? "✓" : "✗"}</span></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="admin-card p-4">
      <p className="text-[11px] font-medium mb-2 text-[var(--a-text-3)]">{label}</p>
      <p className="text-[28px] font-bold tracking-tight" style={{ color }}>{value}</p>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--a-border)]">
        <h2 className="text-[14px] font-semibold text-[var(--a-text-1)]">{title}</h2>
        <p className="text-[12px] mt-0.5 text-[var(--a-text-4)]">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-[var(--a-border)]">
          {headers.map((h) => (
            <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[13px] text-[var(--a-text-4)]">{text}</p>
    </div>
  );
}
