"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TrafficChart({ data }: { data: { name: string; impressions: number; clicks: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" horizontal={true} vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--a-text-4)", fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--a-text-4)", fontSize: 11 }}
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
        <Bar dataKey="impressions" name="Impressions" fill="var(--a-accent)" barSize={16} radius={[8, 8, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="clicks" name="Clicks" fill="var(--a-pink)" barSize={16} radius={[8, 8, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
