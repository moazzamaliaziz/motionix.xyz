import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Poppins } from "next/font/google";
import { createServerSupabase, createAdminClient } from "@/lib/supabase";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/components/admin/theme-context";
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer";

export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--a-font",
});

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

  const admin = createAdminClient();

  const { data: adminUser } = await admin
    .from("admin_users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!adminUser) {
    redirect("/admin/login");
  }

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
    <AdminThemeProvider>
      <div className={`admin-theme min-h-screen ${poppins.variable}`}>
        <AdminHeader user={session.user} issueCount={issueCount} />
        <AdminSidebar role={adminUser.role} />
        <ThemeCustomizer />
        <main className="pt-[4.5rem] pl-0 lg:pl-[15.5rem] transition-[padding] duration-300">
          <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
