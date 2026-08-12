"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Bell, Settings, AlignLeft, ExternalLink } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useAdminTheme } from "./theme-context";

interface AdminHeaderProps {
  user: {
    email?: string;
    user_metadata?: {
      display_name?: string;
    };
  };
  issueCount?: number;
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-[13px]">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-[var(--a-text-4)]">/</span>
          )}
          {crumb.isLast ? (
            <span className="font-medium text-[var(--a-text-2)]">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-[var(--a-text-3)] hover:text-[var(--a-text-2)] transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function IconBadge({ icon: Icon, count, tone, label }: { icon: typeof Bell; count: number; tone: string; label: string }) {
  return (
    <button
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-full text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-bg-hover)]"
    >
      <Icon className="size-[1.15rem]" />
      <span
        className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full px-1 text-[0.625rem] font-semibold text-white"
        style={{ background: tone }}
      >
        {count}
      </span>
    </button>
  );
}

export function AdminHeader({ user, issueCount = 0 }: AdminHeaderProps) {
  const displayName = user.user_metadata?.display_name || user.email || "Admin";
  const router = useRouter();
  const { toggleSidebar, setMobileNavOpen, mobileNavOpen, sidebarCollapsed } = useAdminTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[4.5rem] border-b border-[var(--a-border)] bg-[var(--a-bg-sidebar)]">
      <div className="flex h-full items-center">
        {/* Brand block — aligned to sidebar width */}
        <div className={`flex h-full shrink-0 items-center gap-3 border-r border-[var(--a-border)] px-5 transition-[width] duration-300 ${sidebarCollapsed ? "lg:w-[4.5rem] lg:justify-center lg:px-0" : "lg:w-[15.5rem]"}`}>
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold text-white"
              style={{ background: "var(--a-gradient)" }}
            >
              M
            </span>
            {!sidebarCollapsed && (
              <span className="leading-tight">
                <span className="block text-lg font-bold tracking-tight text-[var(--a-text-1)]">motionix</span>
                <span className="block text-[0.625rem] text-[var(--a-text-4)]">Admin Panel</span>
              </span>
            )}
          </Link>
        </div>

        {/* Main bar */}
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-6">
          <button
            aria-label="Toggle navigation"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileNavOpen(!mobileNavOpen);
              } else {
                toggleSidebar();
              }
            }}
            className="grid size-9 place-items-center rounded-md text-[var(--a-text-3)] transition-colors hover:text-[var(--a-text-1)]"
          >
            <AlignLeft className="size-5" />
          </button>

          <h1 className="hidden text-lg font-semibold text-[var(--a-text-1)] sm:block">Dashboard</h1>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--a-text-4)]" />
              <input
                placeholder="Search here..."
                className="h-11 w-56 rounded-full border border-[var(--a-border)] bg-[var(--a-bg-elevated)] pl-10 pr-4 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30 lg:w-72"
              />
            </div>

            {/* Settings */}
            <button
              aria-label="Settings"
              className="grid size-10 place-items-center rounded-full text-[var(--a-warning)] transition-colors hover:bg-[var(--a-bg-hover)]"
            >
              <Settings className="size-[1.15rem]" />
            </button>

            {/* Notification badges */}
            <div className="hidden items-center gap-2 sm:flex">
              {issueCount > 0 && (
                <Link href="/admin/seo/issues">
                  <IconBadge icon={Bell} count={issueCount} tone="var(--a-warning)" label="SEO Issues" />
                </Link>
              )}
            </div>

            {/* Site link */}
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-[var(--a-text-3)] transition-colors hover:text-[var(--a-text-1)] sm:flex"
            >
              <span>Site</span>
              <ExternalLink className="size-3" />
            </Link>

            <div className="hidden h-5 w-px bg-[var(--a-border)] sm:block" />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Account"
                className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: "var(--a-gradient)" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-lg z-50">
                    <div className="border-b border-[var(--a-border)] px-3 py-2.5">
                      <p className="text-[12px] font-medium text-[var(--a-text-1)]">{displayName}</p>
                      <p className="text-[11px] text-[var(--a-text-4)]">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/admin/settings"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--a-text-2)] transition-colors hover:bg-[var(--a-bg-hover)]"
                      >
                        <Settings className="size-3.5 text-[var(--a-text-4)]" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--a-error)] transition-colors hover:bg-[var(--a-bg-hover)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M5 1H3a2 2 0 00-2 2v8a2 2 0 002 2h2M9 10l3-3-3-3M12 7H5" />
                        </svg>
                        {loggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
