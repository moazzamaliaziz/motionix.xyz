import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function BlogManagerPage() {
  const supabase = createAdminClient();
  const { data: posts, error } = await supabase.from("blog_posts").select("*, blog_clusters(name, slug)").order("created_at", { ascending: false });
  const { data: clusters } = await supabase.from("blog_clusters").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Blog</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Blog</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{posts?.length || 0} posts · {clusters?.length || 0} clusters</p>
        </div>
        <div className="flex gap-2">
          <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
            New Post
          </button>
          <button className="a-btn a-focus px-4 py-2 rounded-md text-[13px] font-medium border transition-colors duration-100 hover:opacity-80"
            style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", color: "var(--a-text-2)" }}>
            New Cluster
          </button>
        </div>
      </div>

      {clusters && clusters.length > 0 && (
        <div className="a-card p-5">
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--a-text-2)" }}>Topic Clusters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {clusters.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border transition-colors duration-100 cursor-default a-border-hover"
                style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)" }}
              >
                <p className="text-[13px] font-medium" style={{ color: "var(--a-text-1)" }}>{c.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--a-text-4)" }}>/{c.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!posts?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>📝</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No posts yet</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                {["Title", "Cluster", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium" style={{ color: "var(--a-text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} className="transition-colors duration-100 a-hover"
                  style={{ borderBottom: i < posts.length - 1 ? "1px solid var(--a-border)" : "none" }}
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium" style={{ color: "var(--a-text-1)" }}>{post.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--a-text-4)" }}>/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-3)" }}>{post.blog_clusters?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/blog/${post.slug}`} className="text-[12px] transition-colors duration-100 hover:opacity-80" style={{ color: "var(--a-text-3)" }}>
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
  const colors: Record<string, string> = { published: "var(--a-success)", draft: "var(--a-warning)" };
  const color = colors[status] || "var(--a-text-4)";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}
