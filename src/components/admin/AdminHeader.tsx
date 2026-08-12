"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

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
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--a-text-4)" }}>
              <path d="M4 2l4 4-4 4" />
            </svg>
          )}
          {crumb.isLast ? (
            <span className="font-medium" style={{ color: "var(--a-text-2)" }}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="transition-colors duration-100 hover:opacity-80" style={{ color: "var(--a-text-3)" }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminHeader({ user, issueCount = 0 }: AdminHeaderProps) {
  const displayName = user.user_metadata?.display_name || user.email || "Admin";
  const router = useRouter();
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
    <header
      className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-5 z-[55] backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--a-bg-page) 85%, transparent)", borderBottom: "1px solid var(--a-border)" }}
    >
      <div className="flex items-center gap-4 pl-10 md:pl-0">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2.5">
        {issueCount > 0 && (
          <Link href="/admin/seo/issues" className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border a-btn"
            style={{ background: "color-mix(in srgb, var(--a-warning) 8%, transparent)", borderColor: "color-mix(in srgb, var(--a-warning) 15%, transparent)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--a-warning)" }}>
              <path d="M7 1L13 12H1L7 1z" />
              <path d="M7 5.5v3M7 10.5v.5" />
            </svg>
            <span className="text-[11px] font-medium" style={{ color: "var(--a-warning)" }}>{issueCount}</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors duration-100"
          style={{ color: "var(--a-text-3)" }}
        >
          <span>Site</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1v6M9 1H3M9 7L1 1" />
          </svg>
        </Link>

        <div className="w-px h-5" style={{ background: "var(--a-border)" }} />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors duration-100 a-btn"
            style={{ background: showMenu ? "var(--a-bg-hover)" : "transparent" }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium border"
              style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)", borderColor: "var(--a-border)" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12px] hidden md:block" style={{ color: "var(--a-text-2)" }}>{displayName}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              style={{ color: "var(--a-text-4)", transform: showMenu ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
              <path d="M2 3.5l3 3 3-3" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-lg z-50"
                style={{ background: "var(--a-bg-surface)", borderColor: "var(--a-border)" }}>
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--a-border)" }}>
                  <p className="text-[12px] font-medium" style={{ color: "var(--a-text-1)" }}>{displayName}</p>
                  <p className="text-[11px]" style={{ color: "var(--a-text-4)" }}>{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors duration-100"
                    style={{ color: "var(--a-text-2)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--a-bg-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--a-text-4)" }}>
                      <circle cx="7" cy="7" r="2" />
                      <path d="M11 9v1a1.5 1.5 0 01-3 0v-.5a1.5 1.5 0 00-3 0v.5a1.5 1.5 0 01-3 0V9" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors duration-100 w-full text-left"
                    style={{ color: "var(--a-error)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--a-bg-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--a-error)" }}>
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
    </header>
  );
}
