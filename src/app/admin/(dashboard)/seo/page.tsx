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
    { title: "Keywords & Clusters", desc: "Track target keywords, search volume, and topic cluster strategy.", href: "/admin/seo/keywords" },
    { title: "Internal Links", desc: "Map link structure, find orphan pages, and optimize link equity.", href: "/admin/seo/links" },
    { title: "Redirects", desc: "Manage 301/302 redirects and monitor redirect chains.", href: "/admin/seo/redirects" },
    { title: "SEO Issues", desc: "View and resolve technical SEO issues found during audits.", href: "/admin/seo/issues" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>SEO Manager</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Search engine optimization tools and tracking.</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Run Audit
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="a-card-interactive p-4 group block">
            <p className="text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>{stat.value}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                className="transition-opacity duration-150 group-hover:opacity-100"
                style={{ color: "var(--a-text-4)", opacity: 0.3 }}>
                <path d="M4 2l4 4-4 4" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="a-card-interactive p-5 group block">
            <h3 className="text-[14px] font-semibold group-hover:opacity-80 transition-opacity duration-100" style={{ color: "var(--a-text-1)" }}>{s.title}</h3>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--a-text-3)" }}>{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
