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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900">Motionix</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          View Site →
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
