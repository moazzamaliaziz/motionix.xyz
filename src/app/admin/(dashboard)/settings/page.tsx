import { createAdminClient } from "@/lib/supabase";

export default async function SettingsPage() {
  const supabase = createAdminClient();
  const { data: settings, error } = await supabase.from("site_settings").select("*").order("category");

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Settings</h1>
        <div className="a-card p-4" style={{ borderColor: "color-mix(in srgb, var(--a-error) 20%, transparent)" }}>
          <p className="text-[13px] text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Group by category
  const categoryMap = new Map<string, typeof settings>();
  settings?.forEach((s) => {
    if (!categoryMap.has(s.category)) categoryMap.set(s.category, []);
    categoryMap.get(s.category)?.push(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--a-text-1)" }}>Settings</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text-3)" }}>{settings?.length || 0} settings</p>
        </div>
        <button className="a-btn a-focus px-4 py-2 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-white/90 transition-colors duration-100">
          Save Changes
        </button>
      </div>

      {!settings?.length ? (
        <div className="a-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border" style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", opacity: 0.5 }}>⚙️</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--a-text-2)" }}>No settings configured</p>
          <p className="text-[13px]" style={{ color: "var(--a-text-4)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)" }}>supabase/seed.sql</code> to populate.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(categoryMap.entries()).map(([category, items]) => (
            <div key={category} className="a-card p-5">
              <h2 className="text-[14px] font-semibold mb-4 capitalize" style={{ color: "var(--a-text-1)" }}>{category}</h2>
              <div className="space-y-3">
                {items.map((setting) => (
                  <div key={setting.key} className="flex items-start justify-between py-2 border-b" style={{ borderColor: "var(--a-border)" }}>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: "var(--a-text-1)" }}>{setting.key}</p>
                      <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--a-text-4)" }}>
                        {typeof setting.value === "object" ? JSON.stringify(setting.value) : String(setting.value)}
                      </p>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--a-text-4)" }}>
                      {new Date(setting.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
