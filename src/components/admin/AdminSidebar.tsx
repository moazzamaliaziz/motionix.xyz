"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface AdminSidebarProps {
  role: string;
}

const icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5.5" height="5.5" rx="1.5"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5"/><rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5"/></svg>,
  tools: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2l4.5 4.5-8.5 8.5H3v-4.5L11.5 2z"/><path d="M9 4.5l4.5 4.5"/></svg>,
  blog: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="10" height="14" rx="2"/><path d="M5 6h6M5 9h4"/></svg>,
  media: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="14" height="14" rx="2.5"/><circle cx="6.5" cy="6.5" r="1.5"/><path d="M16 12l-5-5-9 9"/></svg>,
  translations: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5.5" height="5.5" rx="1"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1"/><rect x="2" y="10.5" width="5.5" height="5.5" rx="1"/><path d="M13.5 10.5v5.5M10.75 13.25h5.5"/></svg>,
  seo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="5.5"/><path d="M16 16l-4-4"/></svg>,
  keywords: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h16M1 12h16"/><path d="M4.5 2v14M13.5 2v14"/></svg>,
  clusters: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="3.5" cy="3.5" r="1.5"/><circle cx="14.5" cy="3.5" r="1.5"/><circle cx="3.5" cy="14.5" r="1.5"/><circle cx="14.5" cy="14.5" r="1.5"/><path d="M6.5 6.5L5 5M11.5 6.5l1.5-1.5M6.5 11.5L5 13M11.5 11.5l1.5 1.5"/></svg>,
  links: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10.5a3.5 3.5 0 005 .5l2.5-2.5a3.5 3.5 0 00-5-5L9 4.5"/><path d="M10.5 7.5a3.5 3.5 0 00-5-.5L3 9.5a3.5 3.5 0 005 5l1-1"/></svg>,
  redirects: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h12M11 5l4 4-4 4"/></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16v-5l3.5-3.5 3 2.5 5.5-7 2 2"/></svg>,
  searchConsole: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="14" height="12" rx="2"/><path d="M2 7h14M5.5 3v4M12.5 3v4"/></svg>,
  performance: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="11" r="6.5"/><path d="M9 11l3.5-5.5"/><circle cx="9" cy="11" r="1"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="5.5" r="3"/><path d="M1.5 16c0-3.5 3-5.5 5.5-5.5s5.5 2 5.5 5.5"/><circle cx="13.5" cy="6" r="2"/><path d="M12.5 10.5c2.5 0.5 4.5 2 4.5 5.5"/></svg>,
  roles: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3.5" width="13" height="11" rx="2.5"/><circle cx="9" cy="8" r="2.5"/><path d="M5.5 14.5v-1.5c0-1.5 2-3 3.5-3s3.5 1.5 3.5 3V14.5"/></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3.5 2"/></svg>,
  flags: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v14"/><path d="M3 2h10l-2.5 4 2.5 4H3"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5"/><path d="M14.5 11.5v1.5a1.5 1.5 0 01-3 0v-1a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0V11.5a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 01-3 0"/><path d="M15.5 6.5V5a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0V5a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0V6.5"/></svg>,
};

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: icons.dashboard },
  {
    label: "Content",
    children: [
      { label: "Tools", href: "/admin/tools", icon: icons.tools },
      { label: "Blog", href: "/admin/blog", icon: icons.blog },
      { label: "Media", href: "/admin/media", icon: icons.media },
      { label: "Translations", href: "/admin/translations", icon: icons.translations },
    ],
  },
  {
    label: "SEO",
    children: [
      { label: "Overview", href: "/admin/seo", icon: icons.seo },
      { label: "Keywords", href: "/admin/seo/keywords", icon: icons.keywords },
      { label: "Clusters", href: "/admin/seo/clusters", icon: icons.clusters },
      { label: "Internal Links", href: "/admin/seo/links", icon: icons.links },
      { label: "Redirects", href: "/admin/seo/redirects", icon: icons.redirects },
    ],
  },
  {
    label: "Analytics",
    children: [
      { label: "Overview", href: "/admin/analytics", icon: icons.analytics },
      { label: "Search Console", href: "/admin/analytics/search-console", icon: icons.searchConsole },
      { label: "Tool Usage", href: "/admin/analytics/tools", icon: icons.tools },
      { label: "Performance", href: "/admin/analytics/performance", icon: icons.performance },
    ],
  },
  {
    label: "Users",
    children: [
      { label: "Users", href: "/admin/users", icon: icons.users },
      { label: "Roles", href: "/admin/users/roles", icon: icons.roles },
      { label: "Activity", href: "/admin/activity", icon: icons.activity },
    ],
  },
  {
    label: "System",
    children: [
      { label: "Feature Flags", href: "/admin/system/flags", icon: icons.flags },
      { label: "Settings", href: "/admin/settings", icon: icons.settings },
    ],
  },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-expand sections containing active page
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
        if (hasActive) newExpanded[item.label] = true;
      }
    });
    setExpanded((prev) => ({ ...newExpanded, ...prev }));
  }, [pathname]);

  // Keyboard shortcut: Cmd+B / Ctrl+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggle = useCallback((label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] })), []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b" style={{ borderColor: "var(--a-border)" }}>
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <span className="text-black font-bold text-[11px]">M</span>
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[14px] tracking-tight" style={{ color: "var(--a-text-1)" }}>Motionix</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--a-text-4)", background: "var(--a-border)" }}>admin</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 sidebar-scroll">
        <ul className="space-y-0.5">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className="a-focus relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors duration-100"
                  style={{
                    color: pathname === item.href ? "var(--a-text-1)" : "var(--a-text-3)",
                    background: pathname === item.href ? "var(--a-bg-elevated)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (pathname !== item.href) e.currentTarget.style.background = "var(--a-bg-hover)"; }}
                  onMouseLeave={(e) => { if (pathname !== item.href) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Active bar */}
                  {pathname === item.href && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full" style={{ background: "var(--a-accent)" }} />
                  )}
                  <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" style={{ opacity: pathname === item.href ? 1 : 0.5 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <div className="mt-2.5">
                  <button
                    onClick={() => toggle(item.label)}
                    className="flex items-center justify-between w-full px-2.5 py-[5px] text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-100"
                    style={{ color: "var(--a-text-4)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--a-text-3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--a-text-4)"; }}
                  >
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                          className={`transition-transform duration-150 ${expanded[item.label] ? "rotate-90" : ""}`}>
                          <path d="M2 1l3 3-3 3" />
                        </svg>
                      </>
                    )}
                  </button>
                  {expanded[item.label] && (
                    <ul className="mt-0.5 space-y-px">
                      {item.children?.map((child) => {
                        const active = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              title={collapsed ? child.label : undefined}
                              className="a-focus relative flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] transition-colors duration-100"
                              style={{
                                color: active ? "var(--a-text-1)" : "var(--a-text-3)",
                                background: active ? "var(--a-bg-elevated)" : "transparent",
                                fontWeight: active ? 500 : 400,
                              }}
                              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--a-bg-hover)"; }}
                              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                            >
                              {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3.5 rounded-r-full" style={{ background: "var(--a-accent)" }} />
                              )}
                              <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" style={{ opacity: active ? 1 : 0.4 }}>{child.icon}</span>
                              {!collapsed && <span>{child.label}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3" style={{ borderColor: "var(--a-border)" }}>
        <div className="flex items-center gap-2.5 px-2.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--a-success)" }} />
          {!collapsed && (
            <span className="text-[11px] truncate" style={{ color: "var(--a-text-4)" }}>
              {role}
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-[60] md:hidden w-8 h-8 flex items-center justify-center rounded-md border a-btn a-focus"
        style={{ background: "var(--a-bg-surface)", borderColor: "var(--a-border)", color: "var(--a-text-2)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {mobileOpen ? <path d="M4 4l8 8M12 4l-8 8" /> : <><path d="M2 4h12M2 8h12M2 12h12" /></>}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[49] md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r transition-[width] duration-200 ${
          collapsed ? "w-[60px]" : "w-[256px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: "var(--a-bg-page)", borderColor: "var(--a-border)" }}
      >
        {sidebarContent}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full border items-center justify-center z-10 a-btn a-focus"
          style={{ background: "var(--a-bg-elevated)", borderColor: "var(--a-border)", color: "var(--a-text-4)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>
            <path d="M7 1L3 5l4 4" />
          </svg>
        </button>
      </aside>
    </>
  );
}
