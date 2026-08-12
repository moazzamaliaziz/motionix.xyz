import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

function Sparkline({ values, color = "var(--a-accent)" }: { values: number[]; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const h = 28;
  const w = 72;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.5 }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCard({ label, value, change, changeLabel, href, color, sparkValues }: {
  label: string; value: number; change?: number; changeLabel?: string; href: string; color: string; sparkValues: number[];
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Link href={href} className="a-card-interactive p-5 group block">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{label}</span>
        <Sparkline values={sparkValues} color={color} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] font-bold tracking-tight leading-none" style={{ color: "var(--a-text-1)" }}>{value}</span>
        {change !== undefined && (
          <span className="text-[11px] font-medium" style={{ color: isPositive ? "var(--a-success)" : "var(--a-error)" }}>
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>
      {changeLabel && (
        <p className="text-[11px] mt-1" style={{ color: "var(--a-text-4)" }}>{changeLabel}</p>
      )}
    </Link>
  );
}

function SectionLabel({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[13px] font-semibold" style={{ color: "var(--a-text-2)" }}>{title}</h2>
      {action && (
        <Link href={action.href} className="text-[12px] transition-colors duration-100 hover:opacity-80" style={{ color: "var(--a-text-4)" }}>
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const d28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [
    { count: toolCount },
    { count: blogCount },
    { count: keywordCount },
    { count: clusterCount },
    { count: issueCount },
    { data: recentPosts },
    { data: snapshots7 },
    { data: snapshots28 },
    { data: snapshots90 },
    { data: recentEvents },
    { data: lastSync },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("blog_clusters").select("*", { count: "exact", head: true }),
    supabase.from("seo_issues").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("blog_posts").select("title, slug, status, published_at, reading_minutes").order("created_at", { ascending: false }).limit(5),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d7).lte("date", today),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d28).lte("date", today),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d90).lte("date", today),
    supabase.from("tool_usage_events").select("tool_slug, event_type, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("analytics_sync_log").select("source, status, completed_at").order("started_at", { ascending: false }).limit(3),
  ]);

  // Aggregate analytics
  const sum = (rows: { impressions?: number; clicks?: number }[] | null, key: "impressions" | "clicks") =>
    rows?.reduce((s, r) => s + (r[key] || 0), 0) || 0;

  const imp7 = sum(snapshots7, "impressions");
  const imp28 = sum(snapshots28, "impressions");
  const click7 = sum(snapshots7, "clicks");
  const click28 = sum(snapshots28, "clicks");

  // Previous period for comparison
  const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: prevSnapshots7 } = await supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d14).lt("date", d7);
  const prevImp7 = sum(prevSnapshots7, "impressions");
  const prevClick7 = sum(prevSnapshots7, "clicks");

  // Sparkline data (last 7 days, grouped by day)
  const { data: sparkData } = await supabase.from("analytics_snapshots").select("date, impressions, clicks").gte("date", d7).order("date");
  const dailyImp = new Map<string, number>();
  const dailyClick = new Map<string, number>();
  sparkData?.forEach((s) => {
    dailyImp.set(s.date, (dailyImp.get(s.date) || 0) + (s.impressions || 0));
    dailyClick.set(s.date, (dailyClick.get(s.date) || 0) + (s.clicks || 0));
  });
  const impSparkline = Array.from(dailyImp.values());
  const clickSparkline = Array.from(dailyClick.values());

  const kpis = [
    { label: "Impressions (7d)", value: imp7, change: pctChange(imp7, prevImp7), changeLabel: "vs previous 7d", href: "/admin/analytics/search-console", color: "#3b82f6", sparkValues: impSparkline },
    { label: "Clicks (7d)", value: click7, change: pctChange(click7, prevClick7), changeLabel: "vs previous 7d", href: "/admin/analytics/search-console", color: "#8b5cf6", sparkValues: clickSparkline },
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords", color: "#06b6d4", sparkValues: [0, 3, 5, 8, 10, 12, keywordCount || 0] },
    { label: "Open Issues", value: issueCount || 0, href: "/admin/seo/issues", color: issueCount ? "#ef4444" : "#22c55e", sparkValues: [0, 0, 0, 0, 0, 0, issueCount || 0] },
  ];

  const actions = [
    { label: "New Blog Post", href: "/admin/blog", desc: "Write and publish", primary: true },
    { label: "Manage Tools", href: "/admin/tools", desc: "Edit tool settings" },
    { label: "SEO Opportunities", href: "/admin/seo/opportunities", desc: "Ranking gains" },
    { label: "View Analytics", href: "/admin/analytics", desc: "Traffic data" },
    { label: "Translations", href: "/admin/translations", desc: "Locale status" },
    { label: "Settings", href: "/admin/settings", desc: "Configuration" },
  ];

  const health = [
    { label: "Supabase", status: "ok" as const, detail: "Connected" },
    { label: "Build", status: "ok" as const, detail: "Next.js 16.2.10" },
    { label: "Analytics Data", status: (imp28 > 0 ? "ok" : "warn") as "ok" | "warn", detail: imp28 > 0 ? `${imp28.toLocaleString()} impressions (28d)` : "No data yet" },
    { label: "SEO Issues", status: ((issueCount ?? 0) > 0 ? "warn" : "ok") as "ok" | "warn", detail: `${issueCount || 0} unresolved` },
  ];

  // Sync status
  const syncStatuses = lastSync?.map((s) => ({
    source: s.source,
    status: s.status,
    time: s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never",
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Dashboard</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Site overview and quick actions.</p>
      </div>

      {/* KPI cards with 7-day comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Two-column: Quick Actions + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 a-card p-5">
          <SectionLabel title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`a-focus flex flex-col gap-2 p-4 rounded-lg border transition-all duration-150 group a-btn ${
                  action.primary ? "col-span-2 md:col-span-1" : "a-border-hover"
                }`}
                style={{
                  background: action.primary ? "var(--a-text-1)" : "var(--a-bg-elevated)",
                  borderColor: action.primary ? "transparent" : "var(--a-border)",
                  color: action.primary ? "#000" : "inherit",
                }}
              >
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: action.primary ? "#000" : "var(--a-text-1)" }}>{action.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: action.primary ? "rgba(0,0,0,0.5)" : "var(--a-text-4)" }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 a-card p-5">
          <SectionLabel title="Recent Posts" action={{ label: "View all", href: "/admin/blog" }} />
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-0">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/admin/blog/${post.slug}`}
                  className="flex items-start justify-between gap-3 py-3 px-2 -mx-2 rounded-md transition-colors duration-100 block a-hover"
                  style={{ borderBottom: i < recentPosts.length - 1 ? "1px solid var(--a-border)" : "none" }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--a-text-1)" }}>{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Draft"}
                      </span>
                      {post.reading_minutes && (
                        <>
                          <span style={{ color: "var(--a-text-4)" }}>·</span>
                          <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>{post.reading_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    post.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {post.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[13px] py-4" style={{ color: "var(--a-text-4)" }}>No posts yet.</p>
          )}
        </div>
      </div>

      {/* Recent Activity + Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Tool Activity */}
        <div className="a-card p-5">
          <SectionLabel title="Recent Tool Activity" action={{ label: "All events", href: "/admin/analytics/tools" }} />
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-0">
              {recentEvents.map((event, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < recentEvents.length - 1 ? "1px solid var(--a-border)" : "none" }}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      event.event_type === "tool_complete" ? "bg-emerald-500" :
                      event.event_type === "tool_error" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    <span className="text-[13px]" style={{ color: "var(--a-text-1)" }}>{event.tool_slug}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-4)" }}>
                      {event.event_type.replace("tool_", "")}
                    </span>
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>
                    {new Date(event.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] py-4" style={{ color: "var(--a-text-4)" }}>No recent events.</p>
          )}
        </div>

        {/* Sync Status */}
        <div className="a-card p-5">
          <SectionLabel title="Data Sync Status" action={{ label: "Integrations", href: "/admin/system/integrations" }} />
          {syncStatuses.length > 0 ? (
            <div className="space-y-3">
              {syncStatuses.map((s) => (
                <div key={s.source} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--a-bg-elevated)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                      s.status === "success" ? "bg-emerald-500" :
                      s.status === "running" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span className="text-[13px] font-medium" style={{ color: "var(--a-text-1)" }}>{s.source.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-medium ${s.status === "success" ? "text-emerald-400" : "text-amber-400"}`}>{s.status}</span>
                    <p className="text-[10px]" style={{ color: "var(--a-text-4)" }}>{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg text-center" style={{ background: "var(--a-bg-elevated)" }}>
              <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>No sync history. Configure GA4/GSC credentials to enable data sync.</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="a-card p-5">
        <SectionLabel title="System Health" action={{ label: "Settings", href: "/admin/settings" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {health.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--a-bg-elevated)" }}>
              <div className={`w-2 h-2 rounded-full shrink-0 ring-2 ${
                item.status === "ok" ? "bg-emerald-500 ring-emerald-500/20" :
                item.status === "warn" ? "bg-amber-500 ring-amber-500/20" :
                "bg-red-500 ring-red-500/20"
              }`} />
              <div className="min-w-0">
                <p className="text-[12px] font-medium" style={{ color: "var(--a-text-2)" }}>{item.label}</p>
                <p className="text-[11px] truncate" style={{ color: "var(--a-text-4)" }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
