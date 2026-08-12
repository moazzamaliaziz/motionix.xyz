"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BarChartCardProps {
  title: string;
  data: Record<string, string | number>[];
  bars: { key: string; color: string; name: string }[];
  height?: number;
  className?: string;
}

export function BarChartCard({ title, data, bars, height = 300, className = "" }: BarChartCardProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h3>
      <div className="mt-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={4} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" horizontal={true} vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--a-text-4)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--a-text-4)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--a-bg-surface)",
                border: "1px solid var(--a-border)",
                borderRadius: "0.75rem",
                fontSize: "0.75rem",
                color: "var(--a-text-1)",
              }}
            />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color}
                barSize={16}
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
