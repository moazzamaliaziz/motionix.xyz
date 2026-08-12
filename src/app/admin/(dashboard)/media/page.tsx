import { createAdminClient } from "@/lib/supabase";

export default async function MediaPage() {
  const supabase = createAdminClient();
  const { data: media, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Media Library</h1>
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
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Media Library</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{media?.length || 0} files</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Upload
        </button>
      </div>

      {!media?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>📁</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No media files</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((file) => (
            <div key={file.id} className="a-card-interactive p-4 group">
              <div className="w-full h-32 rounded-lg mb-3 flex items-center justify-center text-3xl" style={{ background: "var(--a-bg-elevated)" }}>
                {file.mime_type?.startsWith("image/") ? "🖼️" : file.mime_type?.startsWith("video/") ? "🎬" : "📄"}
              </div>
              <p className="text-[12px] font-medium truncate" style={{ color: "var(--a-text-1)" }}>{file.original_name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: "var(--a-text-4)" }}>
                <span>{file.mime_type?.split("/")[1]?.toUpperCase()}</span>
                {file.width && file.height && <span>{file.width}×{file.height}</span>}
                <span>{formatBytes(file.size_bytes)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
