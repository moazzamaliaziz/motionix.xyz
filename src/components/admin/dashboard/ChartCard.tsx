"use client";

import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function ChartCard({ title, subtitle, action, children, footer }: ChartCardProps) {
  return (
    <div className="admin-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--a-text-4)]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button aria-label="More options" className="grid size-8 place-items-center rounded-full text-[var(--a-text-4)] transition-colors hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)]">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
