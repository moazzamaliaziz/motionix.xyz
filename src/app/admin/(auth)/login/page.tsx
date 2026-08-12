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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--a-bg-page, #09090b)" }}>
      <style>{`
        :root {
          --a-bg-page: #09090b;
          --a-bg-surface: #111113;
          --a-bg-elevated: #18181b;
          --a-bg-hover: #1e1e21;
          --a-border: rgba(255,255,255,0.06);
          --a-border-hover: rgba(255,255,255,0.10);
          --a-text-1: #fafafa;
          --a-text-2: rgba(255,255,255,0.62);
          --a-text-3: rgba(255,255,255,0.36);
          --a-text-4: rgba(255,255,255,0.18);
          --a-radius: 10px;
          --a-accent: #3b82f6;
        }
      `}</style>

      {/* Subtle grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      }} />

      <div className="w-full max-w-[360px] relative">
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-white/5">
            <span className="text-black font-bold text-lg">M</span>
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--a-text-1)" }}>Sign in to Admin</h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--a-text-3)" }}>Enter your credentials to continue.</p>
        </div>

        <div className="a-card p-6" style={{ background: "var(--a-bg-surface)", border: "1px solid var(--a-border)", borderRadius: "var(--a-radius)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="a-focus w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150"
                style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
                placeholder="admin@motionix.xyz"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] font-medium mb-2" style={{ color: "var(--a-text-3)" }}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="a-focus w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150"
                style={{ background: "var(--a-bg-elevated)", border: "1px solid var(--a-border)", color: "var(--a-text-1)" }}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-[13px] text-red-400 p-3 rounded-lg" style={{ background: "color-mix(in srgb, var(--a-error) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--a-error) 15%, transparent)" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="a-btn a-focus w-full py-2.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/5">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[11px]" style={{ color: "var(--a-text-4)" }}>Motionix Admin Panel</p>
      </div>
    </div>
  );
}
