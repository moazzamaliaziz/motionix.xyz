"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  storage_path: string;
  created_at: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setFiles(data || []);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Upload failed");
      } else {
        await loadFiles();
      }
    } catch {
      setError("Upload failed");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;

    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (!error) {
      setFiles(files.filter((f) => f.id !== id));
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Media Library</h1>
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
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Media Library</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{files.length} files</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-card p-4 border-[color-mix(in_srgb,var(--a-error)_20%,transparent)]">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {!files.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">📁</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No media files</p>
          <p className="text-[13px] text-[var(--a-text-4)]">
            Click &quot;Upload File&quot; to add media.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map((file) => (
            <div key={file.id} className="admin-card-hover p-4 group relative">
              <div className="w-full h-32 rounded-lg mb-3 flex items-center justify-center text-3xl bg-[var(--a-bg-elevated)]">
                {file.mime_type?.startsWith("image/") ? "🖼️" : file.mime_type?.startsWith("video/") ? "🎬" : "📄"}
              </div>
              <p className="text-[12px] font-medium truncate text-[var(--a-text-1)]">{file.original_name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--a-text-4)]">
                <span>{file.mime_type?.split("/")[1]?.toUpperCase()}</span>
                {file.width && file.height && <span>{file.width}×{file.height}</span>}
                <span>{formatBytes(file.size_bytes)}</span>
              </div>
              <button
                onClick={() => handleDelete(file.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity admin-btn bg-[color-mix(in_srgb,var(--a-error)_80%,transparent)] text-white"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
