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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication failed");
        setLoading(false);
        return;
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!adminUser) {
        setError("You do not have admin access");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Motionix Admin</h1>
          <p className="mt-1 text-sm text-[#888]">Sign in to access the admin panel</p>
        </div>
        <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-[#aaa] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black border border-[#333] rounded-md text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#555] transition-colors"
                placeholder="admin@motionix.xyz"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-[#aaa] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black border border-[#333] rounded-md text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#555] transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-400 text-[13px] bg-red-500/5 border border-red-500/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-white text-black rounded-md text-[13px] font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
