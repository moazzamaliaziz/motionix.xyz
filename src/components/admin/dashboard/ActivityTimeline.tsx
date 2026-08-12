"use client";

import { Activity, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  type?: "create" | "update" | "delete" | "login" | "default";
}

interface ActivityTimelineProps {
  title: string;
  items: ActivityItem[];
  viewAllHref?: string;
  className?: string;
}

const typeColors: Record<string, string> = {
  create: "bg-[var(--a-success)]",
  update: "bg-[var(--a-info)]",
  delete: "bg-[var(--a-error)]",
  login: "bg-[var(--a-bg-elevated)]",
  default: "bg-[var(--a-accent)]",
};

export function ActivityTimeline({ title, items, viewAllHref, className = "" }: ActivityTimelineProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs text-[var(--a-text-4)] hover:text-[var(--a-text-2)] transition-colors">
            View all →
          </a>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--a-text-4)]">
          <Activity className="size-8 mb-2 opacity-40" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-3"
              style={{ borderBottom: i < items.length - 1 ? "1px solid var(--a-border)" : "none" }}
            >
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${typeColors[item.type || "default"]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--a-text-1)] truncate">{item.title}</p>
                {item.description && (
                  <p className="text-[11px] text-[var(--a-text-4)] truncate">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="size-3 text-[var(--a-text-4)]" />
                <span className="text-[11px] text-[var(--a-text-4)]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
