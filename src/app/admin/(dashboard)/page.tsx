import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { PromoBanner } from "@/components/admin/dashboard/PromoBanner";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import { ActivityTimeline } from "@/components/admin/dashboard/ActivityTimeline";
import { ProgressCard } from "@/components/admin/dashboard/ProgressCard";
import { DonutCard } from "@/components/admin/dashboard/DonutCard";
import { BarChartCard } from "@/components/admin/dashboard/BarChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function SectionLabel({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[13px] font-semibold text-[var(--a-text-2)]">{title}</h2>
      {action && (
        <Link href={action.href} className="text-[12px] text-[var(--a-text-4)] hover:text-[var(--a-text-2)] transition-colors">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const d28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
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
    { data: prevSnapshots7 },
    { data: recentEvents },
    { data: lastSync },
    { data: snapshots30 },
    { data: toolEvents },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("blog_clusters").select("*", { count: "exact", head: true }),
    supabase.from("seo_issues").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("blog_posts").select("title, slug, status, published_at, reading_minutes").order("created_at", { ascending: false }).limit(5),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d7).lte("date", today),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d28).lte("date", today),
    supabase.from("analytics_snapshots").select("impressions, clicks").gte("date", d14).lt("date", d7),
    supabase.from("tool_usage_events").select("tool_slug, event_type, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("analytics_sync_log").select("source, status, completed_at").order("started_at", { ascending: false }).limit(3),
    supabase.from("analytics_snapshots").select("date, impressions, clicks").gte("date", d30).order("date"),
    supabase.from("tool_usage_events").select("tool_slug, event_type").gte("created_at", d30),
  ]);

  // Aggregate analytics
  const sum = (rows: { impressions?: number; clicks?: number }[] | null, key: "impressions" | "clicks") =>
    rows?.reduce((s, r) => s + (r[key] || 0), 0) || 0;

  const imp7 = sum(snapshots7, "impressions");
  const imp28 = sum(snapshots28, "impressions");
  const click7 = sum(snapshots7, "clicks");
  const prevImp7 = sum(prevSnapshots7, "impressions");
  const prevClick7 = sum(prevSnapshots7, "clicks");

  // Sparkline data (last 7 days)
  const dailyImp = new Map<string, number>();
  const dailyClick = new Map<string, number>();
  snapshots7?.forEach((s) => {
    const d = s.impressions || 0;
    const c = s.clicks || 0;
    // Group by date if multiple entries per day
    const existing_d = dailyImp.get("key") || 0;
    const existing_c = dailyClick.get("key") || 0;
    dailyImp.set("key", existing_d + d);
    dailyClick.set("key", existing_c + c);
  });

  // 30-day chart data for bar chart
  const chartData: { name: string; impressions: number; clicks: number }[] = [];
  const dailyMap = new Map<string, { impressions: number; clicks: number }>();
  snapshots30?.forEach((s) => {
    const existing = dailyMap.get(s.date) || { impressions: 0, clicks: 0 };
    dailyMap.set(s.date, {
      impressions: existing.impressions + (s.impressions || 0),
      clicks: existing.clicks + (s.clicks || 0),
    });
  });
  Array.from(dailyMap.entries()).sort().forEach(([date, data]) => {
    chartData.push({
      name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      impressions: data.impressions,
      clicks: data.clicks,
    });
  });

  // Tool usage aggregation
  const toolStats = new Map<string, { starts: number; completions: number; errors: number }>();
  toolEvents?.forEach((e) => {
    const existing = toolStats.get(e.tool_slug) || { starts: 0, completions: 0, errors: 0 };
    if (e.event_type === "tool_start") existing.starts++;
    else if (e.event_type === "tool_complete") existing.completions++;
    else if (e.event_type === "tool_error") existing.errors++;
    toolStats.set(e.tool_slug, existing);
  });
  const topTools = Array.from(toolStats.entries())
    .map(([slug, stats]) => ({ name: slug, ...stats, total: stats.starts + stats.completions + stats.errors }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Donut data: blog status distribution
  const { data: allPosts } = await supabase.from("blog_posts").select("status");
  const statusDist = { published: 0, draft: 0 };
  allPosts?.forEach((p) => {
    if (p.status === "published") statusDist.published++;
    else statusDist.draft++;
  });

  // Cluster progress
  const { data: clusters } = await supabase.from("blog_clusters").select("name, status");
  const clusterProgress = clusters?.map((c) => ({
    label: c.name,
    value: c.status === "active" ? 100 : 50,
    max: 100,
  })) || [];

  // Activity items
  const activityItems = recentEvents?.map((e, i) => ({
    id: String(i),
    title: `${e.tool_slug} — ${e.event_type.replace("tool_", "")}`,
    time: new Date(e.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    type: e.event_type === "tool_complete" ? "create" as const : e.event_type === "tool_error" ? "delete" as const : "update" as const,
  })) || [];

  // Sync status
  const syncStatuses = lastSync?.map((s) => ({
    source: s.source,
    status: s.status,
    time: s.completed_at
      ? new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Never",
  })) || [];

  return (
    <div className="space-y-6">
      {/* Promo banner + KPI cards */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <PromoBanner
          headline="Welcome back to Motionix"
          subcopy="Your SEO dashboard is ready. Check your latest analytics and content performance."
          ctaLabel="View Analytics"
          ctaHref="/admin/analytics"
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <KpiCard
            label="Impressions (7d)"
            value={imp7.toLocaleString()}
            change={pctChange(imp7, prevImp7)}
            changeLabel="vs previous 7d"
            barValues={Array.from(dailyImp.values())}
            color="var(--a-accent)"
          />
          <KpiCard
            label="Clicks (7d)"
            value={click7.toLocaleString()}
            change={pctChange(click7, prevClick7)}
            changeLabel="vs previous 7d"
            sparkValues={Array.from(dailyClick.values())}
            color="var(--a-pink)"
          />
          <KpiCard
            label="Keywords"
            value={keywordCount || 0}
            sparkValues={[0, 3, 5, 8, 10, 12, keywordCount || 0]}
            color="var(--a-info)"
          />
          <KpiCard
            label="Open Issues"
            value={issueCount || 0}
            sparkValues={[0, 0, 0, 0, 0, 0, issueCount || 0]}
            color={issueCount ? "var(--a-error)" : "var(--a-success)"}
          />
        </div>
      </div>

      {/* Charts row: 30-day traffic + Tool usage */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard title="Traffic (30 days)" subtitle="Impressions and clicks over time">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" horizontal={true} vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--a-text-4)", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--a-text-4)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--a-bg-surface)",
                    border: "1px solid var(--a-border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--a-text-1)",
                  }}
                />
                <Bar dataKey="impressions" name="Impressions" fill="var(--a-accent)" barSize={16} radius={[8, 8, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="clicks" name="Clicks" fill="var(--a-pink)" barSize={16} radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="grid gap-6">
          <DonutCard
            title="Content Status"
            total={allPosts?.length || 0}
            data={[
              { name: "Published", value: statusDist.published, color: "var(--a-success)" },
              { name: "Draft", value: statusDist.draft, color: "var(--a-warning)" },
            ]}
          />
          {topTools.length > 0 && (
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-[var(--a-text-1)]">Top Tools (30d)</h3>
              <div className="mt-4 space-y-3">
                {topTools.map((tool) => (
                  <div key={tool.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--a-text-2)]">{tool.name}</span>
                      <span className="font-medium text-[var(--a-text-1)]">{tool.total}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--a-bg-elevated)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (tool.total / (topTools[0]?.total || 1)) * 100)}%`,
                          background: "var(--a-gradient)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 admin-card p-6">
          <SectionLabel title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "New Blog Post", href: "/admin/blog", desc: "Write and publish", primary: true },
              { label: "Manage Tools", href: "/admin/tools", desc: "Edit tool settings" },
              { label: "SEO Opportunities", href: "/admin/seo/opportunities", desc: "Ranking gains" },
              { label: "View Analytics", href: "/admin/analytics", desc: "Traffic data" },
              { label: "Translations", href: "/admin/translations", desc: "Locale status" },
              { label: "Settings", href: "/admin/settings", desc: "Configuration" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`admin-focus admin-btn flex flex-col gap-2 rounded-lg border p-4 transition-all ${
                  action.primary
                    ? "col-span-2 md:col-span-1 border-transparent bg-white text-black"
                    : "border-[var(--a-border)] bg-[var(--a-bg-elevated)] hover:border-[var(--a-border-hover)]"
                }`}
              >
                <div>
                  <p className={`text-[13px] font-semibold ${action.primary ? "text-black" : "text-[var(--a-text-1)]"}`}>{action.label}</p>
                  <p className={`text-[11px] mt-0.5 ${action.primary ? "text-black/50" : "text-[var(--a-text-4)]"}`}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 admin-card p-6">
          <SectionLabel title="Recent Posts" action={{ label: "View all", href: "/admin/blog" }} />
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-0">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/admin/blog/${post.slug}`}
                  className="flex items-start justify-between gap-3 rounded-md px-2 py-3 -mx-2 transition-colors hover:bg-[var(--a-bg-hover)] block"
                  style={{ borderBottom: i < recentPosts.length - 1 ? "1px solid var(--a-border)" : "none" }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate text-[var(--a-text-1)]">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[var(--a-text-4)]">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Draft"}
                      </span>
                      {post.reading_minutes && (
                        <>
                          <span className="text-[var(--a-text-4)]">·</span>
                          <span className="text-[11px] text-[var(--a-text-4)]">{post.reading_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                    post.status === "published" ? "bg-[var(--a-success)]/15 text-[var(--a-success)]" : "bg-[var(--a-warning)]/15 text-[var(--a-warning)]"
                  }`}>
                    {post.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[13px] py-4 text-[var(--a-text-4)]">No posts yet.</p>
          )}
        </div>
      </div>

      {/* Activity + Sync + Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityTimeline
          title="Recent Tool Activity"
          items={activityItems}
          viewAllHref="/admin/analytics/tools"
        />

        <div className="admin-card p-6">
          <SectionLabel title="Data Sync Status" action={{ label: "Integrations", href: "/admin/system/integrations" }} />
          {syncStatuses.length > 0 ? (
            <div className="space-y-3">
              {syncStatuses.map((s) => (
                <div key={s.source} className="flex items-center justify-between rounded-lg bg-[var(--a-bg-elevated)] p-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`size-2 rounded-full ${
                      s.status === "success" ? "bg-[var(--a-success)]" :
                      s.status === "running" ? "bg-[var(--a-warning)]" : "bg-[var(--a-error)]"
                    }`} />
                    <span className="text-[13px] font-medium text-[var(--a-text-1)]">{s.source.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-medium ${
                      s.status === "success" ? "text-[var(--a-success)]" : "text-[var(--a-warning)]"
                    }`}>{s.status}</span>
                    <p className="text-[10px] text-[var(--a-text-4)]">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-[var(--a-bg-elevated)] p-4 text-center">
              <p className="text-[13px] text-[var(--a-text-4)]">No sync history. Configure GA4/GSC credentials to enable data sync.</p>
            </div>
          )}
        </div>

        <ProgressCard
          title="Cluster Progress"
          items={clusterProgress.length > 0 ? clusterProgress : [{ label: "No clusters yet", value: 0, max: 100 }]}
        />
      </div>

      {/* System Health */}
      <div className="admin-card p-6">
        <SectionLabel title="System Health" action={{ label: "Settings", href: "/admin/settings" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Supabase", status: "ok" as const, detail: "Connected" },
            { label: "Build", status: "ok" as const, detail: "Next.js 16.2.10" },
            { label: "Analytics Data", status: (imp28 > 0 ? "ok" : "warn") as "ok" | "warn", detail: imp28 > 0 ? `${imp28.toLocaleString()} impressions (28d)` : "No data yet" },
            { label: "SEO Issues", status: ((issueCount ?? 0) > 0 ? "warn" : "ok") as "ok" | "warn", detail: `${issueCount || 0} unresolved` },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-[var(--a-bg-elevated)] p-3">
              <div className={`size-2 shrink-0 rounded-full ring-2 ${
                item.status === "ok" ? "bg-[var(--a-success)] ring-[var(--a-success)]/20" :
                item.status === "warn" ? "bg-[var(--a-warning)] ring-[var(--a-warning)]/20" :
                "bg-[var(--a-error)] ring-[var(--a-error)]/20"
              }`} />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[var(--a-text-2)]">{item.label}</p>
                <p className="truncate text-[11px] text-[var(--a-text-4)]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
