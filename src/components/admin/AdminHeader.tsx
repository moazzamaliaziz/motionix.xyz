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
    <nav className="flex items-center gap-1 text-[12px]">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-white/15">/</span>}
          {crumb.isLast ? (
            <span className="text-white/50 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-white/25 hover:text-white/50 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const displayName = user.user_metadata?.display_name || user.email || "Admin";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-5 z-[55]">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-4 pl-10 md:pl-0">
        <Breadcrumbs />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Keyboard shortcut hint */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/25">
            <circle cx="5" cy="5" r="4" />
            <path d="M11 11l-3-3" />
          </svg>
          <span className="text-[11px] text-white/20">Search</span>
          <kbd className="ml-1 px-1 py-px text-[9px] text-white/20 bg-white/[0.06] rounded border border-white/[0.06] font-mono">
            /
          </kbd>
        </div>

        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors"
        >
          <span>Site</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1v6M9 1H3M9 7L1 1" />
          </svg>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-[11px] font-medium text-white/50 ring-1 ring-white/[0.06]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
