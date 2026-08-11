"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  role: string;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    label: "Content",
    icon: "📝",
    children: [
      { label: "Tools", href: "/admin/tools" },
      { label: "Blog", href: "/admin/blog" },
      { label: "Media", href: "/admin/media" },
      { label: "Translations", href: "/admin/translations" },
    ],
  },
  {
    label: "SEO",
    icon: "🔍",
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
    icon: "📈",
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Search Console", href: "/admin/analytics/search-console" },
      { label: "Tool Analytics", href: "/admin/analytics/tools" },
      { label: "Performance", href: "/admin/analytics/performance" },
    ],
  },
  {
    label: "Users",
    icon: "👥",
    children: [
      { label: "Users", href: "/admin/users" },
      { label: "Admins & Roles", href: "/admin/users/roles" },
      { label: "Activity Logs", href: "/admin/activity" },
    ],
  },
  {
    label: "System",
    icon: "⚙️",
    children: [
      { label: "Feature Flags", href: "/admin/system/flags" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.children?.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
