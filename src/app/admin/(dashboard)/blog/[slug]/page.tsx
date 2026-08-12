"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    status: "draft",
    cluster_id: "",
  });

  useEffect(() => {
    async function loadPost() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
      if (data) {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          content: data.content || "",
          status: data.status || "draft",
          cluster_id: data.cluster_id || "",
        });
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createBrowserSupabase();
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: form.title,
        slug: form.slug,
        description: form.description,
        content: form.content,
        status: form.status,
        cluster_id: form.cluster_id || null,
        published_at: form.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (error) {
      alert("Error: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Edit Post</h1>
        <div className="admin-card p-8">
          <p className="text-[var(--a-text-4)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Edit Post</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">/{slug}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="admin-btn admin-focus px-4 py-2 rounded-md text-[13px] font-medium border transition-colors duration-100 bg-[var(--a-bg-elevated)] border-[var(--a-border)] text-[var(--a-text-2)]"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (confirm("Delete this post? This cannot be undone.")) {
                const supabase = createBrowserSupabase();
                await supabase.from("blog_posts").delete().eq("slug", slug);
                router.push("/admin/blog");
                router.refresh();
              }
            }}
            className="admin-btn admin-focus px-4 py-2 rounded-md text-[13px] font-medium border transition-colors duration-100 bg-[var(--a-error)]/10 border-[var(--a-error)]/20 text-[var(--a-error)]"
          >
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="admin-card p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5 text-[var(--a-text-3)]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 admin-focus bg-[var(--a-bg-elevated)] border border-[var(--a-border)] text-[var(--a-text-1)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5 text-[var(--a-text-3)]">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono transition-all duration-150 admin-focus bg-[var(--a-bg-elevated)] border border-[var(--a-border)] text-[var(--a-text-1)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5 text-[var(--a-text-3)]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 admin-focus resize-y bg-[var(--a-bg-elevated)] border border-[var(--a-border)] text-[var(--a-text-1)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5 text-[var(--a-text-3)]">Content (Markdown)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={20}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono transition-all duration-150 admin-focus resize-y bg-[var(--a-bg-elevated)] border border-[var(--a-border)] text-[var(--a-text-1)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5 text-[var(--a-text-3)]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 admin-focus bg-[var(--a-bg-elevated)] border border-[var(--a-border)] text-[var(--a-text-1)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
