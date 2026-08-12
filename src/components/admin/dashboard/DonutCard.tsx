"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutEntry {
  name: string;
  value: number;
  color: string;
}

interface DonutCardProps {
  title: string;
  total?: string | number;
  data: DonutEntry[];
  className?: string;
}

export function DonutCard({ title, total, data, className = "" }: DonutCardProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h3>
      <div className="mt-4 flex items-center gap-6">
        <div className="h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--a-bg-surface)",
                  border: "1px solid var(--a-border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--a-text-1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1">
          {total && (
            <p className="text-2xl font-bold text-[var(--a-text-1)]">{total}</p>
          )}
          <div className="mt-3 space-y-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
                <span className="text-xs text-[var(--a-text-3)]">{entry.name}</span>
                <span className="ml-auto text-xs font-medium text-[var(--a-text-2)]">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
