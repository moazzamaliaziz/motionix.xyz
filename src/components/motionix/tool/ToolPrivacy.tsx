interface ToolPrivacyProps {
  privacy: {
    processing: "browser" | "server" | "hybrid";
    uploadRequired: boolean;
    retention: string;
    description: string;
  };
}

export function ToolPrivacy({ privacy }: ToolPrivacyProps) {
  if (!privacy) return null;

  const processingLabels = {
    browser: "Browser-only",
    server: "Server-side",
    hybrid: "Hybrid",
  };

  return (
    <section className="mt-16">
      <div className="rounded-2xl border border-foreground/10 bg-white/60 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔒</span>
          <h2 className="font-serif text-2xl italic">Privacy & Security</h2>
        </div>
        
        <p className="text-sm text-foreground/70 mb-4">{privacy.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-foreground/5 p-3">
            <p className="text-foreground/40 text-xs mb-1">Processing</p>
            <p className="font-medium">{processingLabels[privacy.processing]}</p>
          </div>
          <div className="rounded-xl bg-foreground/5 p-3">
            <p className="text-foreground/40 text-xs mb-1">Upload Required</p>
            <p className="font-medium">{privacy.uploadRequired ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-xl bg-foreground/5 p-3">
            <p className="text-foreground/40 text-xs mb-1">Data Retention</p>
            <p className="font-medium">{privacy.retention}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
