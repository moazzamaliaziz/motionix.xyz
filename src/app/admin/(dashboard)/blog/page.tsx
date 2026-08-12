import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function BlogManagerPage() {
  const supabase = createAdminClient();
  const { data: posts, error } = await supabase.from("blog_posts").select("*, blog_clusters(name, slug)").order("created_at", { ascending: false });
  const { data: clusters } = await supabase.from("blog_clusters").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Blog</h1>
         <div className="admin-card p-4 border-[var(--a-error)]/20">
           <p className="text-[13px] text-red-400">{error.message}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Blog</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{posts?.length || 0} posts · {clusters?.length || 0} clusters</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/new"
            className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
            New Post
          </Link>
        </div>
      </div>

      {clusters && clusters.length > 0 && (
        <div className="admin-card p-5">
          <h2 className="text-[13px] font-semibold mb-3 text-[var(--a-text-2)]">Topic Clusters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {clusters.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border transition-colors duration-100 cursor-default admin-hover bg-[var(--a-bg-elevated)] border-[var(--a-border)]">
                <p className="text-[13px] font-medium text-[var(--a-text-1)]">{c.name}</p>
                <p className="text-[11px] mt-0.5 text-[var(--a-text-4)]">/{c.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!posts?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">📝</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No posts yet</p>
          <p className="text-[13px] text-[var(--a-text-4)]">
            Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> or click &quot;New Post&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Title", "Cluster", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors duration-100 admin-hover border-b border-[var(--a-border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[var(--a-text-1)]">{post.title}</p>
                    <p className="text-[11px] mt-0.5 text-[var(--a-text-4)]">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-3)]">{post.blog_clusters?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-4)]">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/blog/${post.slug}`} className="text-[12px] transition-colors duration-100 hover:opacity-80 text-[var(--a-text-3)]">
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

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    published: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    draft: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
  };
  const variant = variants[status] || "bg-[var(--a-text-4)]/15 text-[var(--a-text-4)]";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${variant}`}>
      {status}
    </span>
  );
}
