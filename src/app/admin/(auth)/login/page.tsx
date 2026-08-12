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

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Authentication failed"); setLoading(false); return; }

      const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single();
      if (!adminUser) {
        setError("You do not have admin access");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      }} />

      <div className="w-full max-w-[360px] relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-white/5">
            <span className="text-black font-bold text-lg">M</span>
          </div>
          <h1 className="text-[20px] font-semibold text-white tracking-tight">Sign in to Admin</h1>
          <p className="mt-1.5 text-[13px] text-white/30">Enter your credentials to continue.</p>
        </div>

        {/* Form card */}
        <div className="admin-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-white/40 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200"
                placeholder="admin@motionix.xyz"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] font-medium text-white/40 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-[13px] text-red-400 bg-red-500/[0.06] border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-[11px] text-white/15">
          Motionix Admin Panel
        </p>
      </div>
    </div>
  );
}
