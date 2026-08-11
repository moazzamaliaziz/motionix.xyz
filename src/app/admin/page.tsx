import { createClient } from "@supabase/supabase-js";

export default async function AdminDashboard() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Supabase is not configured.</p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch stats
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
    { label: "Tools", value: toolCount || 0, icon: "🛠️" },
    { label: "Blog Posts", value: blogCount || 0, icon: "📝" },
    { label: "Keywords", value: keywordCount || 0, icon: "🔍" },
    { label: "Translations", value: translationCount || 0, icon: "🌍" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-6"
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
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/tools"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🛠️</span>
            <div>
              <p className="font-medium text-gray-900">Manage Tools</p>
              <p className="text-sm text-gray-600">Edit tool SEO, content, and settings</p>
            </div>
          </a>
          <a
            href="/admin/blog"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Manage Blog</p>
              <p className="text-sm text-gray-600">Create and edit blog posts</p>
            </div>
          </a>
          <a
            href="/admin/seo"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-medium text-gray-900">SEO Manager</p>
              <p className="text-sm text-gray-600">Keywords, clusters, and links</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Supabase Connection</span>
            <span className="text-sm font-medium text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Next.js Version</span>
            <span className="text-sm font-medium text-gray-900">16.2.10</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Environment</span>
            <span className="text-sm font-medium text-gray-900">{process.env.NODE_ENV || "production"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
