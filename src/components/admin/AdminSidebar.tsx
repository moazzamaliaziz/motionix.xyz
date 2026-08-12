"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  role: string;
}

// Inline SVG icons — compact, crisp at 16px
const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  ),
  tools: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 1.5l4 4-8 8H2.5v-4l8-8z" />
      <path d="M8 4l4 4" />
    </svg>
  ),
  blog: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H2V2z" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  ),
  media: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
      <circle cx="5.5" cy="5.5" r="1.5" />
      <path d="M14.5 10.5l-4-4-8.5 8.5" />
    </svg>
  ),
  translations: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.5h5v5h-5z" />
      <path d="M9.5 1.5h5v5h-5z" />
      <path d="M1.5 9.5h5v5h-5z" />
      <path d="M12 9.5v5M9.5 12h5" />
    </svg>
  ),
  seo: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M14.5 14.5l-4-4" />
    </svg>
  ),
  keywords: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5h14M1 10.5h14" />
      <path d="M4 1.5v13M12 1.5v13" />
    </svg>
  ),
  clusters: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="13" cy="3" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      <circle cx="13" cy="13" r="1.5" />
      <path d="M5.5 5.5L4.5 4.5M10.5 5.5l1-1M5.5 10.5l-1 1M10.5 10.5l1 1" />
    </svg>
  ),
  links: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 9a3 3 0 004 .5l2-2a3 3 0 00-4.2-4.3L7.5 4.5" />
      <path d="M9 7a3 3 0 00-4-.5l-2 2a3 3 0 004.2 4.3L8.5 11.5" />
    </svg>
  ),
  redirects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 14.5v-4l3-3 3 2 4-6 3.5 3.5" />
    </svg>
  ),
  searchConsole: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M1.5 6h13M5 2.5v3.5M11 2.5v3.5" />
    </svg>
  ),
  performance: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="10" r="6" />
      <path d="M8 10l3-5" />
      <circle cx="8" cy="10" r="1" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="3" />
      <path d="M1 14c0-3 2.5-5 5-5s5 2 5 5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M11 9c2 0.5 4 2 4 5" />
    </svg>
  ),
  roles: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <circle cx="8" cy="7" r="2" />
      <path d="M5 13v-1c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5v1" />
    </svg>
  ),
  activity: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4v4l3 2" />
    </svg>
  ),
  flags: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 1.5v13" />
      <path d="M2.5 1.5h9l-2 3.5 2 3.5h-9" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M13 10v1.5a1.5 1.5 0 01-3 0v-1a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0V10a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 01-3 0" />
      <path d="M14 6V4.5a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0v-1a1.5 1.5 0 00-3 0v1a1.5 1.5 0 01-3 0V6" />
    </svg>
  ),
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

  // Auto-expand sections containing the active page
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

  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-black font-bold text-[11px]">M</span>
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[14px] text-white tracking-tight">Motionix</span>
              <span className="text-[10px] font-medium text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">
                admin
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 sidebar-scroll">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-all duration-150 ${
                    pathname === item.href
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-70">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <div className="mt-2">
                  <button
                    onClick={() => toggle(item.label)}
                    className="flex items-center justify-between w-full px-2.5 py-[5px] text-[10px] font-semibold text-white/25 uppercase tracking-[0.08em] hover:text-white/40 transition-colors"
                  >
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        <svg
                          width="8" height="8" viewBox="0 0 8 8" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                          className={`transition-transform duration-200 ${expanded[item.label] ? "rotate-90" : ""}`}
                        >
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
                              className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] transition-all duration-150 ${
                                active
                                  ? "bg-white/[0.08] text-white"
                                  : "text-white/35 hover:bg-white/[0.04] hover:text-white/60"
                              }`}
                            >
                              <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-50">{child.icon}</span>
                              {!collapsed && <span>{child.label}</span>}
                              {!collapsed && active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                              )}
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
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-2.5 px-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {!collapsed && (
            <span className="text-[11px] text-white/30 truncate">
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
        className="fixed top-3 left-3 z-[60] md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-[#111] border border-white/[0.08] text-white/60 hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {mobileOpen ? <path d="M4 4l8 8M12 4l-8 8" /> : <><path d="M2 4h12M2 8h12M2 12h12" /></>}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[49] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#0c0c0c] border-r border-white/[0.06] transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {sidebarContent}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#191919] border border-white/[0.08] items-center justify-center text-white/40 hover:text-white/70 hover:bg-[#222] transition-all duration-150 z-10"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>
            <path d="M7 1L3 5l4 4" />
          </svg>
        </button>
      </aside>
    </>
  );
}
