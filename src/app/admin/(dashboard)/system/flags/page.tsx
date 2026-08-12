"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

interface Flag {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.from("feature_flags").select("*").order("key");
    if (error) setError(error.message);
    else setFlags(data || []);
    setLoading(false);
  }

  async function toggleFlag(id: string, enabled: boolean) {
    const supabase = createBrowserSupabase();
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setFlags(flags.map((f) => f.id === id ? { ...f, enabled, updated_at: new Date().toISOString() } : f));
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Feature Flags</h1>
        <div className="admin-card p-8">
          <p className="text-[var(--a-text-4)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Feature Flags</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{flags.length} flags</p>
      </div>

      {error && (
        <div className="admin-card p-4 border-[var(--a-error)]/20">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {!flags.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">🚩</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No feature flags</p>
          <p className="text-[13px] text-[var(--a-text-4)]">
            Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["Flag", "Description", "Status", "Updated"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id} className="transition-colors duration-100 admin-hover border-b border-[var(--a-border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-mono font-medium text-[var(--a-text-1)]">{flag.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-3)]">{flag.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFlag(flag.id, !flag.enabled)}
                      className="flex items-center gap-2 admin-btn admin-focus"
                    >
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${flag.enabled ? "bg-emerald-500/30" : "bg-white/10"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${flag.enabled ? "left-4 bg-emerald-400" : "left-0.5 bg-white/40"}`} />
                      </div>
                      <span className={`text-[11px] font-medium ${flag.enabled ? "text-emerald-400" : "text-white/40"}`}>
                        {flag.enabled ? "ON" : "OFF"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-4)]">
                      {new Date(flag.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
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
