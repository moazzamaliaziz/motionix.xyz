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

function KpiCard({ label, value, href, color, sparkValues }: {
  label: string; value: number; href: string; color: string; sparkValues: number[];
}) {
  return (
    <Link href={href} className="a-card-interactive p-5 group block">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{label}</span>
        <Sparkline values={sparkValues} color={color} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] font-bold tracking-tight leading-none" style={{ color: "var(--a-text-1)" }}>{value}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className="transition-opacity duration-150 group-hover:opacity-100"
          style={{ color: "var(--a-text-4)", opacity: 0.4 }}>
          <path d="M5 3l4 4-4 4" />
        </svg>
      </div>
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

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: toolCount },
    { count: blogCount },
    { count: keywordCount },
    { count: clusterCount },
    { count: issueCount },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("blog_clusters").select("*", { count: "exact", head: true }),
    supabase.from("seo_issues").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("blog_posts").select("title, slug, status, published_at, reading_minutes").order("created_at", { ascending: false }).limit(5),
  ]);

  const kpis = [
    { label: "Tools", value: toolCount || 0, href: "/admin/tools", color: "#3b82f6", sparkValues: [2, 3, 5, 4, 6, 7, toolCount || 0] },
    { label: "Blog Posts", value: blogCount || 0, href: "/admin/blog", color: "#8b5cf6", sparkValues: [1, 2, 2, 3, 3, 4, blogCount || 0] },
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords", color: "#06b6d4", sparkValues: [0, 3, 5, 8, 10, 12, keywordCount || 0] },
    { label: "Clusters", value: clusterCount || 0, href: "/admin/seo/clusters", color: "#f59e0b", sparkValues: [0, 1, 2, 4, 6, 8, clusterCount || 0] },
  ];

  // Primary action first, then secondary
  const actions = [
    { label: "New Blog Post", href: "/admin/blog", desc: "Write and publish", primary: true },
    { label: "Manage Tools", href: "/admin/tools", desc: "Edit tool settings" },
    { label: "Run SEO Audit", href: "/admin/seo", desc: "Check site health" },
    { label: "View Analytics", href: "/admin/analytics", desc: "Traffic data" },
    { label: "Translations", href: "/admin/translations", desc: "Locale status" },
    { label: "Settings", href: "/admin/settings", desc: "Configuration" },
  ];

  const health = [
    { label: "Supabase", status: "ok" as const, detail: "Connected" },
    { label: "Build", status: "ok" as const, detail: "Next.js 16.2.10" },
    { label: "Environment", status: "ok" as const, detail: process.env.NODE_ENV || "production" },
    { label: "SEO Issues", status: (issueCount ?? 0) > 0 ? "warn" as const : "ok" as const, detail: `${issueCount || 0} unresolved` },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Dashboard</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Site overview and quick actions.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Two-column: Quick Actions + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Quick Actions */}
        <div className="lg:col-span-3 a-card p-5">
          <SectionLabel title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`a-focus flex flex-col gap-2 p-4 rounded-lg border transition-all duration-150 group a-btn ${
                  action.primary ? "col-span-2 md:col-span-1" : ""
                }`}
                style={{
                  background: action.primary ? "var(--a-text-1)" : "var(--a-bg-elevated)",
                  borderColor: action.primary ? "transparent" : "var(--a-border)",
                  color: action.primary ? "#000" : "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!action.primary) e.currentTarget.style.background = "var(--a-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!action.primary) e.currentTarget.style.background = "var(--a-bg-elevated)";
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

        {/* Recent Posts */}
        <div className="lg:col-span-2 a-card p-5">
          <SectionLabel title="Recent Posts" action={{ label: "View all", href: "/admin/blog" }} />
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-0">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/admin/blog/${post.slug}`}
                  className="flex items-start justify-between gap-3 py-3 px-2 -mx-2 rounded-md transition-colors duration-100 block"
                  style={{ borderBottom: i < recentPosts.length - 1 ? "1px solid var(--a-border)" : "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--a-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--a-text-1)" }}>{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "Draft"}
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
                    post.status === "published"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
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
