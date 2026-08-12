import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function BlogManagerPage() {
  const supabase = createAdminClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*, blog_clusters(name, slug)")
    .order("created_at", { ascending: false });

  const { data: clusters } = await supabase
    .from("blog_clusters")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-white">Blog Manager</h1>
        <div className="border border-red-500/20 rounded-lg bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error loading posts: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Blog Manager</h1>
          <p className="mt-1 text-sm text-[#888]">{posts?.length || 0} posts, {clusters?.length || 0} clusters</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-1.5 bg-white text-black rounded-md text-[13px] font-medium hover:bg-[#e0e0e0] transition-colors">
            New Post
          </button>
          <button className="px-3.5 py-1.5 bg-[#111] text-white border border-[#333] rounded-md text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors">
            New Cluster
          </button>
        </div>
      </div>

      {/* Clusters */}
      {clusters && clusters.length > 0 && (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Topic Clusters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="p-3 rounded-md border border-[#222] hover:border-[#333] transition-colors">
                <p className="text-[13px] font-medium text-white">{cluster.name}</p>
                <p className="text-[12px] text-[#555] mt-0.5">/{cluster.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {!posts?.length ? (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-12 text-center">
          <p className="text-[#888] mb-2">No blog posts found in the database.</p>
          <p className="text-[13px] text-[#555]">
            Run <code className="px-1.5 py-0.5 bg-[#111] rounded text-[#888]">supabase/seed.sql</code> to populate blog posts.
          </p>
        </div>
      ) : (
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Cluster</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[#111] hover:bg-[#0d0d0d]">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-white">{post.title}</p>
                      <p className="text-[12px] text-[#555]">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {post.blog_clusters ? (
                      <span className="text-[13px] text-[#888]">{post.blog_clusters.name}</span>
                    ) : (
                      <span className="text-[13px] text-[#444]">&mdash;</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : post.status === "draft"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-[#222] text-[#888]"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-[#666]">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "&mdash;"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/blog/${post.slug}`} className="text-[13px] text-[#666] hover:text-white transition-colors">
                      Edit
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
