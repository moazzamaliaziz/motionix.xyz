import { createAdminClient } from "@/lib/supabase";

export default async function UsersPage() {
  const supabase = createAdminClient();
  const { data: users, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Users</h1>
        <div className="admin-card p-4 border-[var(--a-error)]/20">
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Users</h1>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{users?.length || 0} admin users</p>
        </div>
        <button className="admin-btn admin-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Invite User
        </button>
      </div>

      {!users?.length ? (
        <div className="admin-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border bg-[var(--a-bg-elevated)] border-[var(--a-border)] opacity-50">👥</div>
          <p className="text-[14px] font-medium mb-1 text-[var(--a-text-2)]">No admin users</p>
          <p className="text-[13px] text-[var(--a-text-4)]">
            Run <code className="px-1.5 py-0.5 rounded text-[12px] bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]">supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                {["User", "Role", "Last Login", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[12px] font-medium text-[var(--a-text-3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors duration-100 admin-hover border-b border-[var(--a-border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium border bg-[var(--a-bg-elevated)] text-[var(--a-text-3)] border-[var(--a-border)]">
                        {(user.display_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--a-text-1)]">{user.display_name || "Unknown"}</p>
                        <p className="text-[11px] text-[var(--a-text-4)]">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-3)]">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--a-text-4)]">
                      {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, string> = {
    admin: "bg-[var(--a-accent)]/15 text-[var(--a-accent)]",
    editor: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    viewer: "bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]",
  };
  const variant = variants[role] || variants.viewer;
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${variant}`}>
      {role}
    </span>
  );
}
