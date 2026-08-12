"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Image,
  Languages,
  Search,
  Sparkles,
  KeyRound,
  Layers,
  Link2,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Monitor,
  Gauge,
  CircleAlert,
  Users,
  Shield,
  Activity,
  Plug,
  Flag,
  Settings,
  ChevronDown,
  ChevronRight,
  Headphones,
  X,
  Calendar,
  Columns3,
  Mail,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { useAdminTheme } from "./theme-context";

interface NavChild {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  badge?: string;
  href?: string;
  children?: NavChild[];
}

const menuItems: NavGroup[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Content",
    children: [
      { label: "Tools", href: "/admin/tools", icon: Wrench },
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Media", href: "/admin/media", icon: Image },
      { label: "Translations", href: "/admin/translations", icon: Languages },
    ],
  },
  {
    label: "Planning",
    children: [
      { label: "Calendar", href: "/admin/calendar", icon: Calendar },
      { label: "Kanban Board", href: "/admin/kanban", icon: Columns3 },
    ],
  },
  {
    label: "SEO",
    children: [
      { label: "Overview", href: "/admin/seo", icon: Search },
      { label: "Opportunities", href: "/admin/seo/opportunities", icon: Sparkles },
      { label: "Keywords", href: "/admin/seo/keywords", icon: KeyRound },
      { label: "Clusters", href: "/admin/seo/clusters", icon: Layers },
      { label: "Internal Links", href: "/admin/seo/links", icon: Link2 },
      { label: "Redirects", href: "/admin/seo/redirects", icon: ArrowRight },
      { label: "Issues", href: "/admin/seo/issues", icon: AlertTriangle },
    ],
  },
  {
    label: "Analytics",
    children: [
      { label: "Overview", href: "/admin/analytics", icon: BarChart3 },
      { label: "Search Console", href: "/admin/analytics/search-console", icon: Monitor },
      { label: "Tool Usage", href: "/admin/analytics/tools", icon: Wrench },
      { label: "Performance", href: "/admin/analytics/performance", icon: Gauge },
      { label: "404 Monitor", href: "/admin/analytics/404s", icon: CircleAlert },
    ],
  },
  {
    label: "Communication",
    children: [
      { label: "Messages", href: "/admin/messages", icon: Mail },
    ],
  },
  {
    label: "Users",
    children: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/users/roles", icon: Shield },
      { label: "Activity", href: "/admin/activity", icon: Activity },
      { label: "Profile", href: "/admin/profile", icon: UserCircle },
    ],
  },
    ],
  },
  {
    label: "System",
    children: [
      { label: "Integrations", href: "/admin/system/integrations", icon: Plug },
      { label: "Feature Flags", href: "/admin/system/flags", icon: Flag },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen } = useAdminTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        );
        if (hasActive) newExpanded[item.label] = true;
      }
    });
    setExpanded((prev) => ({ ...newExpanded, ...prev }));
  }, [pathname]);

  const toggle = useCallback(
    (label: string) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] })),
    []
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <>
      <nav className="admin-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isOpen = expanded[item.label] && !sidebarCollapsed;
            const groupActive = item.children?.some((c) => isActive(c.href)) ?? false;

            return (
              <li key={item.label}>
                {item.href ? (
                  /* Single link (Dashboard) */
                  <Link
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-[var(--a-bg-elevated)] text-[var(--a-text-1)]"
                        : "text-[var(--a-text-3)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)]"
                    }`}
                  >
                    <Icon className="size-[1.15rem] shrink-0 opacity-70" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                ) : (
                  /* Collapsible group */
                  <div>
                    <button
                      onClick={() => toggle(item.label)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        groupActive
                          ? "bg-[var(--a-bg-elevated)] text-[var(--a-text-1)]"
                          : "text-[var(--a-text-3)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)]"
                      }`}
                    >
                      <Icon className="size-[1.15rem] shrink-0 opacity-70" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-[var(--a-error)] px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                              {item.badge}
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronDown className="size-4 opacity-60" />
                          ) : (
                            <ChevronRight className="size-4 opacity-60" />
                          )}
                        </>
                      )}
                    </button>

                    {isOpen && item.children && (
                      <ul className="mt-1 space-y-0.5 pl-8">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isActive(child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                title={sidebarCollapsed ? child.label : undefined}
                                className={`flex items-center gap-2 rounded-md py-1.5 text-[0.8125rem] transition-colors ${
                                  active
                                    ? "text-[var(--a-accent)]"
                                    : "text-[var(--a-text-3)] hover:text-[var(--a-text-1)]"
                                }`}
                              >
                                <span className="h-px w-2.5 bg-current opacity-60" />
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-[var(--a-border)] p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--a-accent)]/15 text-[var(--a-accent)]">
            <Headphones className="size-5" />
          </span>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--a-text-1)]">{role}</p>
              <p className="truncate text-xs text-[var(--a-text-4)]">Admin Panel</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[var(--a-text-4)]">
              <span>Session</span>
              <span>Active</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--a-bg-elevated)]">
              <div
                className="h-full rounded-full"
                style={{ width: "100%", background: "var(--a-gradient)" }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-[var(--a-bg-page)]/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[15.5rem] flex-col border-r border-[var(--a-border)] bg-[var(--a-bg-sidebar)] pt-[4.5rem] transition-[width,transform] duration-300 ${
          sidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-[15.5rem]"
        } ${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {sidebarContent}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setMobileNavOpen(false)}
          className="hidden lg:flex absolute -right-3 top-[72px] size-6 items-center justify-center rounded-full border border-[var(--a-border)] bg-[var(--a-bg-elevated)] text-[var(--a-text-4)] z-10 transition-colors hover:text-[var(--a-text-1)]"
          title="Collapse sidebar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M7 1L3 5l4 4" />
          </svg>
        </button>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="fixed top-3 left-3 z-[60] flex size-8 items-center justify-center rounded-md border border-[var(--a-border)] bg-[var(--a-bg-surface)] text-[var(--a-text-2)] lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileNavOpen ? (
          <X className="size-4" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        )}
      </button>
    </>
  );
}
