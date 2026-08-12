"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createBrowserSupabase());
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/admin");
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Authentication failed"); setLoading(false); return; }
      const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single();
      if (!adminUser) { setError("You do not have admin access"); await supabase.auth.signOut(); setLoading(false); return; }
      await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
      router.push("/admin");
      router.refresh();
    } catch { setError("An unexpected error occurred"); setLoading(false); }
  }

  return (
    <div className="admin-theme min-h-screen flex items-center justify-center px-4">
      {/* Subtle grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      }} />

      <div className="w-full max-w-[360px] relative">
        <div className="text-center mb-8">
          <div
            className="grid size-11 place-items-center rounded-full mx-auto mb-5 text-lg font-bold text-white shadow-lg"
            style={{ background: "var(--a-gradient)" }}
          >
            M
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--a-text-1)]">Sign in to Admin</h1>
          <p className="mt-1.5 text-[13px] text-[var(--a-text-3)]">Enter your credentials to continue.</p>
        </div>

        <div className="admin-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium mb-2 text-[var(--a-text-3)]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-focus w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-3.5 py-2.5 text-[13px] text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] transition-all"
                placeholder="admin@motionix.xyz"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] font-medium mb-2 text-[var(--a-text-3)]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-focus w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-3.5 py-2.5 text-[13px] text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-[var(--a-error)]/20 bg-[var(--a-error)]/10 p-3 text-[13px] text-[var(--a-error)]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-focus w-full rounded-lg bg-white py-2.5 text-[13px] font-semibold text-black shadow-lg hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[11px] text-[var(--a-text-4)]">Motionix Admin Panel</p>
      </div>
    </div>
  );
}
