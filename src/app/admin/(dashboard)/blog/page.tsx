import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function BlogManagerPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <p className="text-gray-600">Supabase is not configured.</p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch blog posts with cluster info
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*, blog_clusters(name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <p className="text-red-600">Error loading posts: {error.message}</p>
      </div>
    );
  }

  // Fetch blog clusters
  const { data: clusters } = await supabase
    .from("blog_clusters")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            New Post
          </button>
          <button className="px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            New Cluster
          </button>
        </div>
      </div>

      {/* Clusters Overview */}
      {clusters && clusters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Topic Clusters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{cluster.name}</h3>
                <p className="text-sm text-gray-600 mt-1">/{cluster.slug}</p>
                {cluster.tool_slug && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tool: {cluster.tool_slug}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No blog posts found in the database.</p>
          <p className="text-sm text-gray-500">
            Run the database schema to create the blog_posts table, then populate it with your content.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cluster
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.blog_clusters ? (
                      <span className="text-sm text-gray-600">
                        {post.blog_clusters.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800"
                        : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/blog/${post.slug}`}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
