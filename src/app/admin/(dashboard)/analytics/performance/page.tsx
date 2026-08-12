import { createAdminClient } from "@/lib/supabase";

export default async function PerformancePage() {
  const supabase = createAdminClient();

  const { data: snapshots, error } = await supabase
    .from("performance_snapshots")
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Performance</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Aggregate by page
  const pageMap = new Map<string, { lcp: number[]; inp: number[]; cls: number[]; ttfb: number[] }>();
  snapshots?.forEach((s) => {
    const existing = pageMap.get(s.page_url) || { lcp: [], inp: [], cls: [], ttfb: [] };
    if (s.lcp) existing.lcp.push(s.lcp);
    if (s.inp) existing.inp.push(s.inp);
    if (s.cls) existing.cls.push(s.cls);
    if (s.ttfb) existing.ttfb.push(s.ttfb);
    pageMap.set(s.page_url, existing);
  });

  const pageStats = Array.from(pageMap.entries()).map(([url, data]) => ({
    url,
    lcp: avg(data.lcp),
    inp: avg(data.inp),
    cls: avg(data.cls),
    ttfb: avg(data.ttfb),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Performance</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Core Web Vitals monitoring.</p>
      </div>

      {!snapshots?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>⚡</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No performance data</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>Core Web Vitals data will appear here once measured.</p>
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Page", "LCP", "INP", "CLS", "TTFB"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageStats.map((page, i) => (
                <tr key={page.url} className="a-hover transition-colors duration-100"
                  style={{ borderBottom: i < pageStats.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono truncate block max-w-[250px]" style={{ color: "var(--a-text-1)" }}>{page.url}</span>
                  </td>
                  <td className="px-4 py-3">
                    <CwvBadge value={page.lcp} unit="s" good={2.5} poor={4} />
                  </td>
                  <td className="px-4 py-3">
                    <CwvBadge value={page.inp} unit="ms" good={200} poor={500} />
                  </td>
                  <td className="px-4 py-3">
                    <CwvBadge value={page.cls} unit="" good={0.1} poor={0.25} />
                  </td>
                  <td className="px-4 py-3">
                    <CwvBadge value={page.ttfb} unit="ms" good={800} poor={1800} />
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

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function CwvBadge({ value, unit, good, poor }: { value: number; unit: string; good: number; poor: number }) {
  if (value === 0) return <span style={{ color: "var(--a-text-4)" }}>—</span>;
  const color = value <= good ? "var(--a-success)" : value <= poor ? "var(--a-warning)" : "var(--a-error)";
  const display = unit === "ms" ? `${Math.round(value)}` : unit === "s" ? value.toFixed(1) : value.toFixed(2);
  return (
    <span className="text-[13px] font-medium" style={{ color }}>
      {display}{unit ? ` ${unit}` : ""}
    </span>
  );
}
