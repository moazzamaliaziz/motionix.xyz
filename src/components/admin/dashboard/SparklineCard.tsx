"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SparklineCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  data: { name: string; value: number }[];
  color?: string;
  className?: string;
}

export function SparklineCard({ title, value, subtitle, data, color = "var(--a-accent)", className = "" }: SparklineCardProps) {
  const id = `spark-${title.replace(/\s/g, "")}`;
  return (
    <div className={`admin-card p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-4xl font-bold text-[var(--a-text-1)]">{value}</p>
          <p className="mt-3 text-base font-semibold text-[var(--a-text-2)]">{title}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--a-text-4)]">{subtitle}</p>
          )}
        </div>
        <div className="h-14 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
