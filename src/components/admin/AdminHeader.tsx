"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-5 z-[55] backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--a-bg-page) 85%, transparent)", borderBottom: "1px solid var(--a-border)" }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-4 pl-10 md:pl-0">
        <Breadcrumbs />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search hint */}
        <button
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border a-btn a-focus"
          style={{ background: "var(--a-bg-surface)", borderColor: "var(--a-border)" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--a-text-4)" }}>
            <circle cx="5.5" cy="5.5" r="4.5" />
            <path d="M12 12l-3.5-3.5" />
          </svg>
          <span className="text-[12px]" style={{ color: "var(--a-text-4)" }}>Search</span>
          <kbd className="ml-1 px-1.5 py-px text-[10px] rounded border font-mono" style={{ color: "var(--a-text-4)", background: "var(--a-bg-hover)", borderColor: "var(--a-border)" }}>
            /
          </kbd>
        </button>

        {/* Notification — SEO issues */}
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

        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors duration-100"
          style={{ color: "var(--a-text-3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--a-text-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--a-text-3)"; }}
        >
          <span>Site</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1v6M9 1H3M9 7L1 1" />
          </svg>
        </Link>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "var(--a-border)" }} />

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium border"
          style={{ background: "var(--a-bg-elevated)", color: "var(--a-text-3)", borderColor: "var(--a-border)" }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
