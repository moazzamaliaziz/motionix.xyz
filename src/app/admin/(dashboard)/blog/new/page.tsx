"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    status: "draft",
    cluster_id: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: form.description,
      content: form.content,
      status: form.status,
      cluster_id: form.cluster_id || null,
      author: "Motionix",
      published_at: form.status === "published" ? new Date().toISOString() : null,
    });

    if (error) {
      alert("Error: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>New Blog Post</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>Create a new blog post.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="a-btn a-focus px-4 py-2 rounded-md text-[13px] font-medium border transition-colors duration-100"
          style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", color: "var(--a-text-2)" }}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="a-card p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--a-text-3)" }}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 a-focus"
              style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
              placeholder="My Blog Post Title"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--a-text-3)" }}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono transition-all duration-150 a-focus"
              style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
              placeholder="my-blog-post-title"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--a-text-3)" }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 a-focus resize-y"
              style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
              placeholder="A brief description of the post..."
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--a-text-3)" }}>Content (Markdown)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={15}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono transition-all duration-150 a-focus resize-y"
              style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
              placeholder="# My Blog Post&#10;&#10;Write your content here..."
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--a-text-3)" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 a-focus"
              style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="a-btn a-focus px-4 py-2 rounded-md text-[13px] font-medium border transition-colors duration-100"
            style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", color: "var(--a-text-2)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
