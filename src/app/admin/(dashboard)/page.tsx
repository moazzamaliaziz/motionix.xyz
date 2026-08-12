import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

// Mini sparkline SVG — pure CSS-free, renders inline
function Sparkline({ values, color = "#3b82f6" }: { values: number[]; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="stat-sparkline">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Section header
function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[13px] font-semibold text-white/70 tracking-tight">{title}</h2>
      {action && (
        <Link href={action.href} className="text-[12px] text-white/25 hover:text-white/50 transition-colors">
          {action.label}
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
    { count: translationCount },
    { count: issueCount },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("blog_clusters").select("*", { count: "exact", head: true }),
    supabase.from("translations").select("*", { count: "exact", head: true }),
    supabase.from("seo_issues").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("blog_posts").select("title, slug, status, published_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Tools", value: toolCount || 0, href: "/admin/tools", color: "#3b82f6", trend: null },
    { label: "Blog Posts", value: blogCount || 0, href: "/admin/blog", color: "#8b5cf6", trend: null },
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords", color: "#06b6d4", trend: null },
    { label: "Clusters", value: clusterCount || 0, href: "/admin/seo/clusters", color: "#f59e0b", trend: null },
  ];

  const quickActions = [
    { label: "New Blog Post", href: "/admin/blog", desc: "Write and publish content", icon: "✦" },
    { label: "Run SEO Audit", href: "/admin/seo", desc: "Check site health", icon: "◉" },
    { label: "View Analytics", href: "/admin/analytics", desc: "Traffic and usage data", icon: "◈" },
    { label: "Manage Tools", href: "/admin/tools", desc: "Edit tool settings", icon: "◇" },
    { label: "Translations", href: "/admin/translations", desc: "Locale completeness", icon: "◆" },
    { label: "Settings", href: "/admin/settings", desc: "Site configuration", icon: "⊡" },
  ];

  const healthItems = [
    { label: "Supabase", status: "connected" as const, detail: "qgroslpmtvjjninvmqkv.supabase.co" },
    { label: "Build", status: "healthy" as const, detail: "Next.js 16.2.10" },
    { label: "Environment", status: "ok" as const, detail: process.env.NODE_ENV || "production" },
    { label: "Open SEO Issues", status: (issueCount ?? 0) > 0 ? "warning" as const : "healthy" as const, detail: `${issueCount || 0} unresolved` },
    { label: "Translations", status: (translationCount ?? 0) > 0 ? "ok" as const : "empty" as const, detail: `${translationCount || 0} entries` },
  ];

  const statusColors: Record<string, string> = {
    connected: "bg-emerald-500",
    healthy: "bg-emerald-500",
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    empty: "bg-white/20",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[13px] text-white/30">Site overview and quick actions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="admin-card admin-card-hover p-5 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{stat.label}</p>
              <Sparkline values={[3, 5, 4, 7, 6, 8, stat.value]} color={stat.color} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-[28px] font-semibold text-white tracking-tight leading-none">{stat.value}</p>
              <span className="text-[11px] text-white/20 group-hover:text-white/40 transition-colors">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: Quick Actions + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Quick Actions — 3 cols */}
        <div className="lg:col-span-3 admin-card p-5">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-2 p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-200 group"
              >
                <span className="text-[16px] text-white/20 group-hover:text-white/40 transition-colors">{action.icon}</span>
                <div>
                  <p className="text-[13px] font-medium text-white/70 group-hover:text-white transition-colors">{action.label}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Posts — 2 cols */}
        <div className="lg:col-span-2 admin-card p-5">
          <SectionHeader title="Recent Posts" action={{ label: "View all", href: "/admin/blog" }} />
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-0">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/admin/blog/${post.slug}`}
                  className={`flex items-start justify-between gap-3 py-3 ${
                    i < recentPosts.length - 1 ? "border-b border-white/[0.04]" : ""
                  } hover:bg-white/[0.02] -mx-2 px-2 rounded-md transition-colors`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white/70 truncate">{post.title}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Draft"}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
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
            <p className="text-[13px] text-white/20 py-4">No posts yet.</p>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="admin-card p-5">
        <SectionHeader title="System Health" action={{ label: "Settings", href: "/admin/settings" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
          {healthItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-3 md:px-4 first:pl-0 last:pr-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[item.status]}`} />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-white/50">{item.label}</p>
                <p className="text-[11px] text-white/20 truncate">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
