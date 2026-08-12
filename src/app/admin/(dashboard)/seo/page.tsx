import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function SEOManagerPage() {
  const supabase = createAdminClient();
  const [
    { count: keywordCount },
    { count: clusterCount },
    { count: linkCount },
    { count: redirectCount },
    { count: issueCount },
  ] = await Promise.all([
    supabase.from("keywords").select("*", { count: "exact", head: true }),
    supabase.from("blog_clusters").select("*", { count: "exact", head: true }),
    supabase.from("internal_links").select("*", { count: "exact", head: true }),
    supabase.from("redirects").select("*", { count: "exact", head: true }),
    supabase.from("seo_issues").select("*", { count: "exact", head: true }).eq("resolved", false),
  ]);

  const stats = [
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords", color: "#06b6d4" },
    { label: "Clusters", value: clusterCount || 0, href: "/admin/seo/clusters", color: "#f59e0b" },
    { label: "Links", value: linkCount || 0, href: "/admin/seo/links", color: "#8b5cf6" },
    { label: "Redirects", value: redirectCount || 0, href: "/admin/seo/redirects", color: "#3b82f6" },
    { label: "Issues", value: issueCount || 0, href: "/admin/seo/issues", color: issueCount ? "#ef4444" : "#22c55e" },
  ];

  const sections = [
    { title: "Keywords & Clusters", desc: "Track target keywords, search volume, and topic cluster strategy.", href: "/admin/seo/keywords", icon: "◉" },
    { title: "Internal Links", desc: "Map link structure, find orphan pages, and optimize link equity.", href: "/admin/seo/links", icon: "◈" },
    { title: "Redirects", desc: "Manage 301/302 redirects and monitor redirect chains.", href: "/admin/seo/redirects", icon: "→" },
    { title: "SEO Issues", desc: "View and resolve technical SEO issues found during audits.", href: "/admin/seo/issues", icon: issueCount ? "⚠" : "✓" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">SEO Manager</h1>
          <p className="mt-1 text-[13px] text-white/30">Search engine optimization tools and tracking.</p>
        </div>
        <button className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors">
          Run Audit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card admin-card-hover p-4 transition-all duration-200">
            <p className="text-[11px] font-medium text-white/25 uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 text-[24px] font-semibold text-white tracking-tight">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="admin-card admin-card-hover p-5 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[14px] text-white/25 shrink-0 group-hover:text-white/40 transition-colors">
                {section.icon}
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">{section.title}</h3>
                <p className="text-[12px] text-white/25 mt-1 leading-relaxed">{section.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
