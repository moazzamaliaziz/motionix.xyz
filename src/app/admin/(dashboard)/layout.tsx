import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase";
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

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <style>{`
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        .admin-card { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
        .admin-card-hover:hover { border-color: rgba(255,255,255,0.1); background: #131313; }
        .stat-sparkline { opacity: 0.4; }
      `}</style>
      <AdminHeader user={session.user} />
      <AdminSidebar role={adminUser.role} />
      <main className="ml-0 md:ml-[240px] pt-14 transition-[margin] duration-200">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
