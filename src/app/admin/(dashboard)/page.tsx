import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: toolCount },
    { count: blogCount },
    { count: keywordCount },
    { count: translationCount },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("translations").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Tools", value: toolCount || 0, href: "/admin/tools" },
    { label: "Blog Posts", value: blogCount || 0, href: "/admin/blog" },
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords" },
    { label: "Translations", value: translationCount || 0, href: "/admin/translations" },
  ];

  const quickActions = [
    { label: "Manage Tools", href: "/admin/tools", desc: "Edit tool SEO, content, and settings" },
    { label: "Manage Blog", href: "/admin/blog", desc: "Create and edit blog posts" },
    { label: "SEO Manager", href: "/admin/seo", desc: "Keywords, clusters, and links" },
    { label: "Analytics", href: "/admin/analytics", desc: "Usage and performance data" },
    { label: "Translations", href: "/admin/translations", desc: "Locale completeness tracking" },
    { label: "Settings", href: "/admin/settings", desc: "Global site configuration" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#888]">Overview of your site content and performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5 hover:border-[#444] transition-colors"
          >
            <p className="text-[12px] font-medium text-[#666] uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-3 p-3 rounded-md border border-transparent hover:border-[#333] hover:bg-[#111] transition-colors"
            >
              <div className="w-8 h-8 rounded bg-[#1a1a1a] border border-[#222] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 1l4 6-4 6" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">{action.label}</p>
                <p className="text-[12px] text-[#666] mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">System</h2>
        <div className="space-y-2">
          {[
            { label: "Supabase", value: "Connected", ok: true },
            { label: "Next.js", value: "16.2.10" },
            { label: "Environment", value: process.env.NODE_ENV || "production" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <span className="text-[13px] text-[#666]">{item.label}</span>
              <span className={`text-[13px] font-medium ${item.ok ? "text-emerald-500" : "text-[#aaa]"}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
