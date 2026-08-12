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
    { label: "Keywords", value: keywordCount || 0, href: "/admin/seo/keywords" },
    { label: "Clusters", value: clusterCount || 0, href: "/admin/seo/clusters" },
    { label: "Internal Links", value: linkCount || 0, href: "/admin/seo/links" },
    { label: "Redirects", value: redirectCount || 0, href: "/admin/seo/redirects" },
    { label: "Open Issues", value: issueCount || 0, href: "/admin/seo/issues" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">SEO Manager</h1>
          <p className="mt-1 text-sm text-[#888]">Search engine optimization tools and tracking.</p>
        </div>
        <button className="px-3.5 py-1.5 bg-white text-black rounded-md text-[13px] font-medium hover:bg-[#e0e0e0] transition-colors">
          Run SEO Audit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-[#222] rounded-lg bg-[#0a0a0a] p-4 hover:border-[#444] transition-colors"
          >
            <p className="text-[11px] font-medium text-[#666] uppercase tracking-wider">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: "Keywords & Clusters", desc: "Manage your keyword database, topic clusters, and content strategy.", href: "/admin/seo/keywords" },
          { title: "Internal Links", desc: "Manage internal link structure and find orphan pages.", href: "/admin/seo/links" },
          { title: "Redirects", desc: "Manage URL redirects and monitor redirect chains.", href: "/admin/seo/redirects" },
          { title: "SEO Issues", desc: "View and resolve technical SEO issues found during audits.", href: "/admin/seo/issues" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5 hover:border-[#333] transition-colors"
          >
            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-[13px] text-[#666]">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
