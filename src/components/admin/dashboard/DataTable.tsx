"use client";

import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data found.",
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--a-text-4)]">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--a-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--a-text-4)] ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-[var(--a-border)] transition-colors hover:bg-[var(--a-bg-hover)] ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-[13px] text-[var(--a-text-2)] ${col.className || ""}`}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Reusable badge components */
export function StatusBadge({ status, colors }: { status: string; colors?: Record<string, string> }) {
  const defaultColors: Record<string, string> = {
    published: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    active: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    connected: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    success: "bg-[var(--a-success)]/15 text-[var(--a-success)]",
    draft: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
    running: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
    pending: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
    error: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
    failed: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
    disabled: "bg-[var(--a-bg-elevated)] text-[var(--a-text-4)]",
    inactive: "bg-[var(--a-bg-elevated)] text-[var(--a-text-4)]",
  };

  const allColors = { ...defaultColors, ...colors };
  const colorClass = allColors[status.toLowerCase()] || "bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]";

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
    warning: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
    info: "bg-[var(--a-info)]/15 text-[var(--a-info)]",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold ${colors[severity.toLowerCase()] || "bg-[var(--a-bg-elevated)] text-[var(--a-text-3)]"}`}>
      {severity}
    </span>
  );
}
