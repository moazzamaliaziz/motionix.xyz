import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase, createAdminClient } from "@/lib/supabase";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin — Motionix",
  description: "Motionix administration panel",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Use admin client for DB queries (bypasses RLS)
  const admin = createAdminClient();

  const { data: adminUser } = await admin
    .from("admin_users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminUser) {
    redirect("/admin/login");
  }

  // Fetch issue count (non-blocking, table may not exist)
  let issueCount = 0;
  try {
    const { count } = await admin
      .from("seo_issues")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false);
    issueCount = count || 0;
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen text-white antialiased" style={{ background: "var(--a-bg-page)" }}>
      <style>{`
        :root {
          --a-bg-page:     #09090b;
          --a-bg-surface:  #111113;
          --a-bg-elevated: #18181b;
          --a-bg-hover:    #1e1e21;
          --a-border:      rgba(255,255,255,0.06);
          --a-border-hover:rgba(255,255,255,0.10);
          --a-border-focus:rgba(255,255,255,0.16);
          --a-text-1:      #fafafa;
          --a-text-2:      rgba(255,255,255,0.62);
          --a-text-3:      rgba(255,255,255,0.36);
          --a-text-4:      rgba(255,255,255,0.18);
          --a-radius:      10px;
          --a-radius-sm:   6px;
          --a-radius-lg:   14px;
          --a-accent:      #3b82f6;
          --a-success:     #22c55e;
          --a-warning:     #f59e0b;
          --a-error:       #ef4444;
        }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 6px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        .a-card {
          background: var(--a-bg-surface);
          border: 1px solid var(--a-border);
          border-radius: var(--a-radius);
        }
        .a-card-interactive {
          background: var(--a-bg-surface);
          border: 1px solid var(--a-border);
          border-radius: var(--a-radius);
          transition: border-color 150ms, background 150ms;
        }
        .a-card-interactive:hover {
          border-color: var(--a-border-hover);
          background: var(--a-bg-elevated);
        }
        .a-focus:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--a-bg-page), 0 0 0 4px rgba(255,255,255,0.16);
        }
        .a-btn:active { transform: scale(0.98); }
        .a-hover:hover { background: var(--a-bg-hover); }
        .a-border-hover:hover { border-color: var(--a-border-hover); }
        .a-chart-hover:hover { background: color-mix(in srgb, var(--a-accent) 50%, transparent); }
      `}</style>

      <AdminHeader user={session.user} issueCount={issueCount} />
      <AdminSidebar role={adminUser.role} />
      <main className="ml-0 md:ml-[60px] lg:ml-[256px] pt-14 transition-[margin] duration-200">
        <div className="p-5 lg:p-7 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
