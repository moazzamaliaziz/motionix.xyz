import { createAdminClient } from "@/lib/supabase";

export default async function RolesPage() {
  const supabase = createAdminClient();
  const { data: users, error } = await supabase.from("admin_users").select("role, permissions");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Roles</h1>
        <div className="admin-card p-4 border-[var(--a-error)]/20">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const roleCounts = new Map<string, number>();
  users?.forEach((u) => roleCounts.set(u.role, (roleCounts.get(u.role) || 0) + 1));

  const roles = [
    { name: "admin", label: "Admin", desc: "Full access to all modules, settings, and user management.", count: roleCounts.get("admin") || 0 },
    { name: "editor", label: "Editor", desc: "Can manage content, tools, blog posts, and SEO data.", count: roleCounts.get("editor") || 0 },
    { name: "viewer", label: "Viewer", desc: "Read-only access to dashboard and analytics.", count: roleCounts.get("viewer") || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Roles & Permissions</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{users?.length || 0} users across {roleCounts.size} roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((role) => (
          <div key={role.name} className="admin-card p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[var(--a-text-1)]">{role.label}</h3>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">
                {role.count} {role.count === 1 ? "user" : "users"}
              </span>
            </div>
            <p className="text-[12px] mb-4 text-[var(--a-text-3)]">{role.desc}</p>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2">
                <span className={role.name === "viewer" ? "text-[var(--a-text-4)]" : "text-[var(--a-success)]"}>✓</span>
                <span className="text-[var(--a-text-3)]">View dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={role.name === "viewer" ? "text-[var(--a-text-4)]" : "text-[var(--a-success)]"}>✓</span>
                <span className="text-[var(--a-text-3)]">View analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={role.name === "admin" || role.name === "editor" ? "text-[var(--a-success)]" : "text-[var(--a-text-4)]"}>
                  {role.name === "admin" || role.name === "editor" ? "✓" : "✗"}
                </span>
                <span className="text-[var(--a-text-3)]">Edit content</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={role.name === "admin" ? "text-[var(--a-success)]" : "text-[var(--a-text-4)]"}>
                  {role.name === "admin" ? "✓" : "✗"}
                </span>
                <span className="text-[var(--a-text-3)]">Manage users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={role.name === "admin" ? "text-[var(--a-success)]" : "text-[var(--a-text-4)]"}>
                  {role.name === "admin" ? "✓" : "✗"}
                </span>
                <span className="text-[var(--a-text-3)]">System settings</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
