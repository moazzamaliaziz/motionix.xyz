import { createAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function ClustersPage() {
  const supabase = createAdminClient();
  const { data: clusters, error } = await supabase.from("blog_clusters").select("*").order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Topic Clusters</h1>
        <div className="admin-card p-4 border-[color-mix(in_srgb,var(--a-error)_20%,transparent)]">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Topic Clusters</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{clusters?.length || 0} clusters</p>
        </div>
        <button className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          New Cluster
        </button>
      </div>

      {!clusters?.length ? (
        <EmptyState icon="🕸️" title="No clusters yet" hint="Run supabase/seed.sql to populate." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="admin-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-[var(--a-text-1)]">{cluster.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  cluster.status === "active" ? "bg-[var(--a-success)]/15 text-[var(--a-success)]" : "bg-[var(--a-warning)]/15 text-[var(--a-warning)]"
                }`}>
                  {cluster.status}
                </span>
              </div>
              <p className="text-[12px] mb-3 text-[var(--a-text-3)]">{cluster.description || "No description"}</p>
              <div className="space-y-1.5 text-[12px]">
                {cluster.pillar_slug && (
                  <div className="flex justify-between">
                    <span className="text-[var(--a-text-4)]">Pillar</span>
                    <span className="text-[var(--a-text-2)]">/{cluster.pillar_slug}</span>
                  </div>
                )}
                {cluster.tool_slug && (
                  <div className="flex justify-between">
                    <span className="text-[var(--a-text-4)]">Tool</span>
                    <Link href={`/admin/tools/${cluster.tool_slug}`} className="hover:underline text-[var(--a-accent)]">
                      {cluster.tool_slug}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="admin-card p-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border border-[var(--a-border)] bg-[var(--a-bg-elevated)] opacity-50">{icon}</div>
      <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">{title}</p>
      <p className="text-[13px] text-[var(--a-text-4)]">
        Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> to populate.
      </p>
    </div>
  );
}
