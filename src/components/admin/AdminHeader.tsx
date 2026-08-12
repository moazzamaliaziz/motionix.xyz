"use client";

import Link from "next/link";

interface AdminHeaderProps {
  user: {
    email?: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const displayName = user.user_metadata?.display_name || user.email || "Admin";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-5 z-50">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">M</span>
          </div>
          <span className="font-semibold text-sm text-white">Motionix</span>
          <span className="text-[10px] font-medium text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-[13px] text-[#666] hover:text-white transition-colors"
          target="_blank"
        >
          View Site
          <svg className="inline ml-1 -mt-0.5" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1v6M9 1H3M9 7L1 1" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[11px] font-medium text-[#888]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
