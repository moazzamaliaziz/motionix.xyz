import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function BlogManagerPage() {
  const supabase = createAdminClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*, blog_clusters(name, slug)")
    .order("created_at", { ascending: false });
  const { data: clusters } = await supabase.from("blog_clusters").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Blog</h1>
        <div className="admin-card p-4 border-red-500/20 bg-red-500/[0.03]">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Blog</h1>
          <p className="mt-1 text-[13px] text-white/30">{posts?.length || 0} posts · {clusters?.length || 0} clusters</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors">
            New Post
          </button>
          <button className="px-4 py-2 bg-white/[0.06] text-white/70 border border-white/[0.08] rounded-lg text-[13px] font-medium hover:bg-white/[0.1] transition-colors">
            New Cluster
          </button>
        </div>
      </div>

      {/* Clusters */}
      {clusters && clusters.length > 0 && (
        <div className="admin-card p-5">
          <h2 className="text-[13px] font-semibold text-white/70 mb-3">Topic Clusters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
                <p className="text-[13px] font-medium text-white/70">{cluster.name}</p>
                <p className="text-[11px] text-white/20 mt-0.5">/{cluster.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {!posts?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-xl opacity-50">📝</div>
          <p className="text-[14px] text-white/50 mb-1">No posts yet</p>
          <p className="text-[13px] text-white/25">
            Run <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-white/40 text-[12px]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Title", "Cluster", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} className={`transition-colors hover:bg-white/[0.02] ${i < posts.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-white/80">{post.title}</p>
                    <p className="text-[11px] text-white/20 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-white/30">{post.blog_clusters?.name || "—"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      post.status === "published" ? "text-emerald-400" : post.status === "draft" ? "text-amber-400" : "text-white/30"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        post.status === "published" ? "bg-emerald-500" : post.status === "draft" ? "bg-amber-500" : "bg-white/20"
                      }`} />
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-white/25">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/blog/${post.slug}`} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
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
