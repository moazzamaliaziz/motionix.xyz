"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  role: string;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: "Content",
    children: [
      { label: "Tools", href: "/admin/tools" },
      { label: "Blog", href: "/admin/blog" },
      { label: "Media", href: "/admin/media" },
      { label: "Translations", href: "/admin/translations" },
    ],
  },
  {
    label: "SEO",
    children: [
      { label: "Overview", href: "/admin/seo" },
      { label: "Keywords", href: "/admin/seo/keywords" },
      { label: "Topic Clusters", href: "/admin/seo/clusters" },
      { label: "Internal Links", href: "/admin/seo/links" },
      { label: "Redirects", href: "/admin/seo/redirects" },
    ],
  },
  {
    label: "Analytics",
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Search Console", href: "/admin/analytics/search-console" },
      { label: "Tool Analytics", href: "/admin/analytics/tools" },
      { label: "Performance", href: "/admin/analytics/performance" },
    ],
  },
  {
    label: "Users",
    children: [
      { label: "Users", href: "/admin/users" },
      { label: "Roles", href: "/admin/users/roles" },
      { label: "Activity Logs", href: "/admin/activity" },
    ],
  },
  {
    label: "System",
    children: [
      { label: "Feature Flags", href: "/admin/system/flags" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Content: true,
    SEO: true,
    Analytics: true,
    Users: false,
    System: false,
  });

  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-[#0a0a0a] border-r border-[#222] overflow-y-auto z-40">
      <nav className="p-3">
        <ul className="space-y-0.5">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#888] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className="mt-3">
                  <button
                    onClick={() => toggle(item.label)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-[#555] uppercase tracking-wider hover:text-[#888] transition-colors"
                  >
                    <span>{item.label}</span>
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      className={`transition-transform ${expanded[item.label] ? "rotate-90" : ""}`}
                    >
                      <path d="M3 1l4 4-4 4" />
                    </svg>
                  </button>
                  {expanded[item.label] && (
                    <ul className="mt-0.5 space-y-0.5">
                      {item.children?.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-3 py-1.5 rounded-md text-[13px] transition-colors ml-3 ${
                              pathname === child.href
                                ? "bg-[#1a1a1a] text-white font-medium"
                                : "text-[#666] hover:bg-[#111] hover:text-[#aaa]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Role badge */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#222]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[12px] text-[#666]">
            Signed in as <span className="text-[#aaa] font-medium">{role}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
