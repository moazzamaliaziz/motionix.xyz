import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function SEOManagerPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
        <p className="text-gray-600">Supabase is not configured.</p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch SEO data
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
    { label: "Keywords", value: keywordCount || 0, icon: "🔍", href: "/admin/seo/keywords" },
    { label: "Topic Clusters", value: clusterCount || 0, icon: "🕸️", href: "/admin/seo/clusters" },
    { label: "Internal Links", value: linkCount || 0, icon: "🔗", href: "/admin/seo/links" },
    { label: "Redirects", value: redirectCount || 0, icon: "↪️", href: "/admin/seo/redirects" },
    { label: "Open Issues", value: issueCount || 0, icon: "⚠️", href: "/admin/seo/issues" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Run SEO Audit
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/seo/keywords"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Keywords & Clusters</h3>
          <p className="text-sm text-gray-600">
            Manage your keyword database, topic clusters, and content strategy.
          </p>
        </Link>
        <Link
          href="/admin/seo/links"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Internal Links</h3>
          <p className="text-sm text-gray-600">
            Manage internal link structure and find orphan pages.
          </p>
        </Link>
        <Link
          href="/admin/seo/redirects"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Redirects</h3>
          <p className="text-sm text-gray-600">
            Manage URL redirects and monitor redirect chains.
          </p>
        </Link>
        <Link
          href="/admin/seo/issues"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-2">SEO Issues</h3>
          <p className="text-sm text-gray-600">
            View and resolve technical SEO issues found during audits.
          </p>
        </Link>
      </div>
    </div>
  );
}
